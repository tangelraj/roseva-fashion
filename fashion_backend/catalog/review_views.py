
from django.db import IntegrityError, transaction
from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404

from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework import status

from catalog.models import Product, ProductReview
from orders.models import OrderItem


def serialize_review(review):
    customer = review.customer

    return {
        "id": review.id,
        "customer_name": (
            customer.get_full_name()
            or customer.get_username()
        ),
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "verified_purchase": (
            review.is_verified_purchase
        ),
        "created_at": review.created_at,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def product_reviews(request, product_id):

    product = get_object_or_404(
        Product,
        id=product_id,
    )

    reviews = ProductReview.objects.filter(
        product=product,
        is_approved=True,
    ).select_related("customer")

    stats = reviews.aggregate(
        average_rating=Avg("rating"),
        total_reviews=Count("id"),
    )

    return Response({
        "product_id": product.id,
        "average_rating": round(
            stats["average_rating"] or 0,
            1,
        ),
        "total_reviews": stats["total_reviews"],
        "reviews": [
            serialize_review(review)
            for review in reviews
        ],
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_product_review(request, product_id):

    product = get_object_or_404(
        Product,
        id=product_id,
    )

    # Verify that this customer has received
    # the product in a delivered order.
    has_purchased = OrderItem.objects.filter(
        product=product,
        order__customer=request.user,
        order__status="delivered",
    ).exists()

    if not has_purchased:
        return Response(
            {
                "error": (
                    "You can review this product "
                    "only after your order "
                    "has been delivered."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    rating = request.data.get("rating")
    title = str(
        request.data.get("title") or ""
    ).strip()
    comment = str(
        request.data.get("comment") or ""
    ).strip()

    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return Response(
            {"error": "Select a rating from 1 to 5."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if rating < 1 or rating > 5:
        return Response(
            {"error": "Rating must be between 1 and 5."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not comment:
        return Response(
            {"error": "Please write your review."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(title) > 150 or len(comment) > 2000:
        return Response(
            {"error": "Review text is too long."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            review, created = (
                ProductReview.objects.get_or_create(
                    product=product,
                    customer=request.user,
                    defaults={
                        "rating": rating,
                        "title": title,
                        "comment": comment,
                        "is_approved": False,
                    },
                )
            )

            if not created:
                return Response(
                    {
                        "error": (
                            "You have already reviewed "
                            "this product."
                        )
                    },
                    status=status.HTTP_409_CONFLICT,
                )

    except IntegrityError:
        return Response(
            {
                "error": (
                    "You have already reviewed "
                    "this product."
                )
            },
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        {
            "message": (
                "Review submitted successfully. "
                "It will appear after approval."
            ),
            "review_id": review.id,
        },
        status=status.HTTP_201_CREATED,
    )

