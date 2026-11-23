
import logging

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import EmailMessage
from django.core.validators import validate_email

from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle

from .models import (
    AboutPage,
    FAQ,
    ContactSettings,
    ContactMessage,
    WhyChooseUsItem,
)


logger = logging.getLogger(__name__)


# ==========================================
# IMAGE URL HELPER
# ==========================================

def image_url(request, image):
    if not image:
        return ""

    try:
        return request.build_absolute_uri(image.url)
    except (ValueError, OSError):
        return ""


# ==========================================
# ABOUT US API
# GET /api/about/
# ==========================================

@api_view(["GET"])
def about_page(request):
    about = AboutPage.objects.first()

    if not about:
        return Response({})

    return Response({
        "title": about.title,
        "subtitle": about.subtitle,
        "description": about.description,
        "mission": about.mission,
        "vision": about.vision,
        "image": image_url(request, about.image),
    })


# ==========================================
# FAQ API
# GET /api/faqs/
# ==========================================

@api_view(["GET"])
def faq_list(request):
    faqs = FAQ.objects.filter(
        is_active=True
    ).order_by("order", "id")

    return Response([
        {
            "id": faq.id,
            "question": faq.question,
            "answer": faq.answer,
        }
        for faq in faqs
    ])


# ==========================================
# CONTACT SETTINGS API
# GET /api/contact-settings/
# ==========================================

@api_view(["GET"])
def contact_settings(request):
    contact = ContactSettings.objects.first()

    if not contact:
        return Response({})

    return Response({
        "title": contact.title,
        "description": contact.description,
        "email": contact.email,
        "phone": contact.phone,
        "address": contact.address,
        "instagram_url": contact.instagram_url,
        "facebook_url": contact.facebook_url,
    })


# ==========================================
# CONTACT FORM RATE LIMIT
# ==========================================

class ContactFormThrottle(AnonRateThrottle):
    scope = "contact_form"
    rate = "5/hour"


# ==========================================
# CONTACT FORM SUBMISSION
# POST /api/contact-submit/
# ==========================================

@api_view(["POST"])
@throttle_classes([ContactFormThrottle])
def submit_contact(request):

    # Read form data
    name = str(
        request.data.get("name") or ""
    ).strip()

    email = str(
        request.data.get("email") or ""
    ).strip()

    subject = str(
        request.data.get("subject") or ""
    ).strip()

    message = str(
        request.data.get("message") or ""
    ).strip()

    # --------------------------------------
    # VALIDATION
    # --------------------------------------

    if not name or not email or not message:
        return Response(
            {
                "error": (
                    "Name, email and message are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        len(name) > 150
        or len(email) > 254
        or len(subject) > 200
        or len(message) > 5000
    ):
        return Response(
            {
                "error": (
                    "One or more fields exceed "
                    "the allowed length."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_email(email)

    except ValidationError:
        return Response(
            {
                "error": (
                    "Please enter a valid email address."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # --------------------------------------
    # SAVE MESSAGE IN DJANGO DATABASE
    # --------------------------------------

    try:
        enquiry = ContactMessage.objects.create(
            name=name,
            email=email,
            subject=subject,
            message=message,
        )

    except Exception:
        logger.exception(
            "Failed to save contact enquiry."
        )

        return Response(
            {
                "error": (
                    "Unable to save your message. "
                    "Please try again later."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # --------------------------------------
    # PREPARE EMAIL
    # --------------------------------------

    receiver_email = getattr(
        settings,
        "CONTACT_RECEIVER_EMAIL",
        "tangelraj@gmail.com",
    )

    sender_email = getattr(
        settings,
        "DEFAULT_FROM_EMAIL",
        "",
    )

    email_subject = (
        "ROSÉVA FASHION - New Contact Enquiry"
    )

    email_body = f"""
New Contact Form Submission
ROSÉVA FASHION

----------------------------------------

Customer Name:
{name}

Customer Email:
{email}

Subject:
{subject or "General Enquiry"}

Message:
{message}

----------------------------------------

Enquiry ID: {enquiry.pk}

This message was submitted through
the Roséva Fashion Contact Us page.
"""

    # --------------------------------------
    # SEND EMAIL TO ADMIN
    # --------------------------------------

    try:
        if not getattr(
            settings,
            "EMAIL_HOST_USER",
            "",
        ) or not getattr(
            settings,
            "EMAIL_HOST_PASSWORD",
            "",
        ):
            raise RuntimeError(
                "SMTP email credentials are missing."
            )

        notification = EmailMessage(
            subject=email_subject,
            body=email_body,
            from_email=sender_email,
            to=[receiver_email],
            reply_to=[email],
        )

        sent_count = notification.send(
            fail_silently=False
        )

        if sent_count != 1:
            raise RuntimeError(
                "Email server did not accept the message."
            )

    except Exception:
        logger.exception(
            "Email notification failed for "
            "contact enquiry ID %s",
            enquiry.pk,
        )

        return Response(
            {
                "error": (
                    "Your message was saved, "
                    "but the email notification "
                    "could not be sent. "
                    "Please contact support directly."
                ),
                "saved": True,
                "email_sent": False,
                "id": enquiry.pk,
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # --------------------------------------
    # SUCCESS RESPONSE
    # --------------------------------------

    return Response(
        {
            "message": (
                "Your message has been "
                "sent successfully!"
            ),
            "saved": True,
            "email_sent": True,
            "id": enquiry.pk,
        },
        status=status.HTTP_201_CREATED,
    )


# ==========================================
# WHY CHOOSE US API
# GET /api/why-choose-us/
# ==========================================

@api_view(["GET"])
def why_choose_us(request):
    items = WhyChooseUsItem.objects.filter(
        is_active=True
    ).order_by("order", "id")

    return Response([
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "icon": item.icon,
        }
        for item in items
    ])
