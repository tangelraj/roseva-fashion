
import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction

from .models import Order

logger = logging.getLogger(__name__)


def send_order_emails(order_id):
    try:
        order = (
            Order.objects
            .prefetch_related("items")
            .get(pk=order_id)
        )

        items_text = "\n".join(
            (
                f"{item.product_name} "
                f"(Size: {item.size}) "
                f"x {item.quantity} "
                f"- Rs. {item.total}"
            )
            for item in order.items.all()
        )

        # Customer confirmation
        customer_message = (
            f"Dear {order.full_name},\n\n"
            "Thank you for shopping with Roséva Fashion!\n\n"
            "Your order has been placed successfully.\n\n"
            f"Order Number: {order.order_number}\n"
            f"Order Status: {order.get_status_display()}\n"
            f"Payment Method: {order.get_payment_method_display()}\n"
            f"Payment Status: {order.get_payment_status_display()}\n\n"
            "Ordered Products:\n"
            f"{items_text}\n\n"
            f"Subtotal: Rs. {order.subtotal}\n"
            f"Shipping: Rs. {order.shipping}\n"
            f"Total: Rs. {order.total}\n\n"
            "Thank you for choosing Roséva Fashion!\n\n"
            "Regards,\n"
            "Roséva Fashion Team"
        )

        send_mail(
            subject=f"Order Confirmation - {order.order_number}",
            message=customer_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.email],
            fail_silently=False,
        )

    except Exception:
        logger.exception(
            "Customer email failed for order %s",
            order_id,
        )

    try:
        order = (
            Order.objects
            .prefetch_related("items")
            .get(pk=order_id)
        )

        admin_email = getattr(
            settings,
            "ORDER_ADMIN_EMAIL",
            "",
        )

        if admin_email:
            items_text = "\n".join(
                (
                    f"{item.product_name} "
                    f"x {item.quantity} "
                    f"- Rs. {item.total}"
                )
                for item in order.items.all()
            )

            admin_message = (
                "New Order Received - Roséva Fashion\n\n"
                f"Order Number: {order.order_number}\n"
                f"Customer: {order.full_name}\n"
                f"Email: {order.email}\n"
                f"Phone: {order.phone}\n\n"
                "Delivery Address:\n"
                f"{order.address}\n"
                f"{order.city}, {order.state}\n"
                f"PIN: {order.postal_code}\n\n"
                "Products:\n"
                f"{items_text}\n\n"
                f"Total: Rs. {order.total}\n"
                f"Payment Method: {order.get_payment_method_display()}\n"
                f"Payment Status: {order.get_payment_status_display()}\n"
            )

            send_mail(
                subject=f"New Order - {order.order_number}",
                message=admin_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=False,
            )

    except Exception:
        logger.exception(
            "Admin email failed for order %s",
            order_id,
        )


def schedule_order_emails(order_id):
    transaction.on_commit(
        lambda: send_order_emails(order_id)
    )
