
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import (
    validate_password,
)
from django.core.exceptions import ValidationError
from django.db import transaction

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from orders.models import Order

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CustomerSerializer,
)

User = get_user_model()


class RegisterThrottle(AnonRateThrottle):
    rate = "5/hour"


class LoginThrottle(AnonRateThrottle):
    rate = "10/hour"


def generate_tokens(user):
    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register_customer(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    password = serializer.validated_data["password"]

    try:
        validate_password(password)
    except ValidationError as exc:
        return Response(
            {"password": exc.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = serializer.save()

    return Response(
        {
            "message": "Registration successful.",
            "user": CustomerSerializer(user).data,
            "tokens": generate_tokens(user),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login_customer(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].strip()
    password = serializer.validated_data["password"]

    matching_users = list(
        User.objects.filter(email__iexact=email)[:2]
    )

    if len(matching_users) != 1:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = matching_users[0]

    if not user.is_active or not user.check_password(password):
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response(
        {
            "message": "Login successful.",
            "user": CustomerSerializer(user).data,
            "tokens": generate_tokens(user),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_profile(request):
    return Response(
        CustomerSerializer(request.user).data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_orders(request):
    orders = Order.objects.filter(
        customer=request.user
    ).order_by("-created_at")

    results = []

    for order in orders:
        results.append({
            "order_number": order.order_number,
            "total": str(order.total),
            "status": order.status,
            "status_display": order.get_status_display(),
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "created_at": order.created_at,
            "items": [
                {
                    "product_name": item.product_name,
                    "size": item.size,
                    "quantity": item.quantity,
                    "price": str(item.price),
                    "total": str(item.total),
                }
                for item in order.items.all()
            ],
        })

    return Response(results)
