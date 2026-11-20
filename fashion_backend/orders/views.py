
from collections import defaultdict
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404

from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
    authentication_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle

from rest_framework_simplejwt.authentication import (
    JWTAuthentication,
)

from catalog.models import Product, ProductVariant
from .models import Order, OrderItem
from .emails import schedule_order_emails

FREE_SHIPPING_LIMIT = Decimal("1999.00")
SHIPPING_CHARGE = Decimal("99.00")


class CheckoutThrottle(AnonRateThrottle):
    scope = "checkout"
    rate = "10/hour"


class TrackingThrottle(AnonRateThrottle):
    scope = "tracking"
    rate = "20/hour"


class CheckoutValidationError(Exception):
    pass


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
@throttle_classes([CheckoutThrottle])
def create_order(request):
    data = request.data

    # ------------------------------------
    # 1. Get logged-in customer
    # ------------------------------------

    customer = (
        request.user
        if request.user.is_authenticated
        else None
    )

    # ------------------------------------
    # 2. Validate delivery information
    # ------------------------------------

    required_fields = [
        "full_name",
        "email",
        "phone",
        "address",
        "city",
        "state",
        "postal_code",
    ]

    for field in required_fields:
        if not str(data.get(field, "")).strip():
            return Response(
                {
                    "error": f"{field} is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # Prevent a logged-in customer from
    # creating an account-linked order
    # under a different email address.
    if customer is not None:
        submitted_email = str(
            data.get("email", "")
        ).strip().lower()

        if submitted_email != customer.email.lower():
            return Response(
                {
                    "error": (
                        "Please use your registered email "
                        "address for checkout."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # ------------------------------------
    # 3. Payment method
    # ------------------------------------

    payment_method = str(
        data.get("payment_method", "cod")
    ).strip().lower()

    if payment_method not in (
        "cod",
        "upi",
        "card",
    ):
        return Response(
            {
                "error": "Invalid payment method."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ------------------------------------
    # 4. Validate cart
    # ------------------------------------

    items = data.get("items")

    if not isinstance(items, list) or not items:
        return Response(
            {
                "error": "Your cart is empty."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(items) > 50:
        return Response(
            {
                "error": "Too many cart items."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    requested = defaultdict(int)

    try:
        for item in items:
            product_id = int(
                item["product_id"]
            )

            size = str(
                item["size"]
            ).strip()

            quantity = int(
                item["quantity"]
            )

            if product_id <= 0 or not size:
                raise ValueError()

            if quantity < 1 or quantity > 100:
                raise ValueError()

            requested[
                (product_id, size)
            ] += quantity

            if requested[
                (product_id, size)
            ] > 100:
                raise ValueError()

    except (
        KeyError,
        TypeError,
        ValueError,
        OverflowError,
    ):
        return Response(
            {
                "error": (
                    "Invalid cart items or quantities."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ------------------------------------
    # 5. Create order
    # ------------------------------------

    try:
        with transaction.atomic():

            order_lines = []
            subtotal = Decimal("0.00")

            for (
                product_id,
                size,
            ), quantity in sorted(
                requested.items()
            ):

                product = get_object_or_404(
                    Product,
                    pk=product_id,
                    is_active=True,
                )

                matching_variants = (
                    ProductVariant.objects.filter(
                        product=product,
                        size=size,
                        is_active=True,
                    )
                )

                if matching_variants.count() != 1:
                    raise CheckoutValidationError(
                        f"Size {size} is unavailable "
                        f"or ambiguous for "
                        f"{product.name}."
                    )

                variant = matching_variants.first()

                # Update stock safely
                updated = (
                    ProductVariant.objects.filter(
                        pk=variant.pk,
                        stock__gte=quantity,
                        is_active=True,
                    ).update(
                        stock=F("stock") - quantity
                    )
                )

                if updated != 1:
                    raise CheckoutValidationError(
                        f"Insufficient stock for "
                        f"{product.name} ({size})."
                    )

                line_total = (
                    product.price * quantity
                )

                subtotal += line_total

                order_lines.append(
                    {
                        "product": product,
                        "product_name": product.name,
                        "size": size,
                        "quantity": quantity,
                        "price": product.price,
                        "total": line_total,
                    }
                )

            # ------------------------------------
            # 6. Calculate shipping
            # ------------------------------------

            shipping = (
                Decimal("0.00")
                if subtotal >= FREE_SHIPPING_LIMIT
                else SHIPPING_CHARGE
            )

            # ------------------------------------
            # 7. Save order
            # ------------------------------------

            order = Order.objects.create(
                customer=customer,
                full_name=str(
                    data["full_name"]
                ).strip(),
                email=str(
                    data["email"]
                ).strip(),
                phone=str(
                    data["phone"]
                ).strip(),
                address=str(
                    data["address"]
                ).strip(),
                city=str(
                    data["city"]
                ).strip(),
                state=str(
                    data["state"]
                ).strip(),
                postal_code=str(
                    data["postal_code"]
                ).strip(),
                subtotal=subtotal,
                shipping=shipping,
                total=subtotal + shipping,
                payment_method=payment_method,
                payment_status="pending",
                status="placed",
            )

            # ------------------------------------
            # 8. Save order items
            # ------------------------------------

            OrderItem.objects.bulk_create(
                [
                    OrderItem(
                        order=order,
                        **line
                    )
                    for line in order_lines
                ]
            )

    except CheckoutValidationError as exc:
        return Response(
            {
                "error": str(exc)
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
        schedule_order_emails(order.pk)
    # ------------------------------------
    # 9. Success response
    # ------------------------------------

    return Response(
        {
            "order_number": order.order_number,
            "status": order.status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "subtotal": str(order.subtotal),
            "shipping": str(order.shipping),
            "total": str(order.total),
            "demo_payment": (
                payment_method in ("upi", "card")
            ),
            "message": (
                "Order placed successfully."
            ),
        },
        status=status.HTTP_201_CREATED,
    )
    

# ============================================
# ORDER TRACKING
# ============================================

@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([TrackingThrottle])
def track_order(request, order_number):

    email = str(
        request.query_params.get(
            "email",
            ""
        )
    ).strip()

    if not email:
        return Response(
            {
                "error": (
                    "Email address is required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    order = Order.objects.filter(
        order_number=order_number,
        email__iexact=email,
    ).first()

    if order is None:
        return Response(
            {
                "error": "Order not found."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "order_number": order.order_number,
            "status": order.status,
            "status_display": (
                order.get_status_display()
            ),
            "payment_method": (
                order.payment_method
            ),
            "payment_status": (
                order.payment_status
            ),
            "courier_name": (
                order.courier_name
            ),
            "tracking_number": (
                order.tracking_number
            ),
            "created_at": (
                order.created_at
            ),
            "demo_payment": (
                order.payment_method
                in ("upi", "card")
                and order.payment_status
                == "pending"
            ),
        },
        status=status.HTTP_200_OK,
    )
