
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


def generate_order_number():
    return (
        f"RSV-{timezone.now():%Y%m%d}-"
        f"{uuid.uuid4().hex[:8].upper()}"
    )


class Order(models.Model):

    STATUS_CHOICES = [
        ("placed", "Order Placed"),
        ("confirmed", "Confirmed"),
        ("packed", "Packed"),
        ("shipped", "Shipped"),
        ("out_for_delivery", "Out for Delivery"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("returned", "Returned"),
    ]

    PAYMENT_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("upi", "UPI"),
        ("card", "Debit / Credit Card"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    # Registered customer (optional for guest checkout)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="fashion_orders",
    )

    # Order identification
    order_number = models.CharField(
        max_length=40,
        unique=True,
        default=generate_order_number,
        editable=False,
    )

    # Customer delivery details
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)

    # Pricing
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    shipping = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # Payment
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        default="cod",
    )

    payment_status = models.CharField(
        max_length=15,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
    )

    # Order status
    status = models.CharField(
        max_length=25,
        choices=STATUS_CHOICES,
        default="placed",
    )

    # Future Razorpay integration
    razorpay_order_id = models.CharField(
        max_length=150,
        blank=True,
    )

    razorpay_payment_id = models.CharField(
        max_length=150,
        blank=True,
    )

    # Shipping and tracking
    courier_name = models.CharField(
        max_length=150,
        blank=True,
    )

    tracking_number = models.CharField(
        max_length=150,
        blank=True,
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        "catalog.Product",
        on_delete=models.PROTECT,
    )

    product_name = models.CharField(
        max_length=255,
    )

    size = models.CharField(
        max_length=50,
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    def __str__(self):
        return (
            f"{self.product_name} "
            f"x {self.quantity}"
        )
