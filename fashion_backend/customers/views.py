
from datetime import timedelta
import logging

import resend

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

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
from catalog.models import ProductReview

from .models import EmailOTP
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CustomerSerializer,
)


User = get_user_model()
logger = logging.getLogger(__name__)


# ==========================================
# THROTTLING
# ==========================================

class RegisterThrottle(AnonRateThrottle):
    scope = "customer_register"
    rate = "100/hour" if settings.DEBUG else "5/hour"


class LoginThrottle(AnonRateThrottle):
    scope = "customer_login"
    rate = "100/hour" if settings.DEBUG else "10/hour"


class OTPVerifyThrottle(AnonRateThrottle):
    scope = "customer_otp_verify"
    rate = "100/hour" if settings.DEBUG else "20/hour"


class OTPResendThrottle(AnonRateThrottle):
    scope = "customer_otp_resend"
    rate = "100/hour" if settings.DEBUG else "5/hour"


# ==========================================
# JWT TOKENS
# ==========================================

def generate_tokens(user):
    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# ==========================================
# SEND OTP EMAIL USING RESEND API
# ==========================================

def send_verification_email(user, otp):
    api_key = getattr(
        settings,
        "RESEND_API_KEY",
        "",
    )

    from_email = getattr(
        settings,
        "RESEND_FROM_EMAIL",
        "",
    )

    if not api_key:
        raise RuntimeError(
            "RESEND_API_KEY is not configured."
        )

    if not from_email:
        raise RuntimeError(
            "RESEND_FROM_EMAIL is not configured."
        )

    resend.api_key = api_key

    email_params = {
        "from": from_email,
        "to": [user.email],
        "subject": "Roséva Fashion - Verify Your Email",
        "text": (
            "Welcome to Roséva Fashion!\n\n"
            f"Your email verification OTP is: {otp}\n\n"
            "This OTP is valid for 5 minutes.\n"
            "Do not share this code with anyone.\n\n"
            "If you did not create this account, "
            "please ignore this email.\n\n"
            "Roséva Fashion Team"
        ),
    }

    result = resend.Emails.send(email_params)

    # Resend normally returns a dictionary
    # containing the accepted email ID.
    email_id = (
        result.get("id")
        if isinstance(result, dict)
        else getattr(result, "id", None)
    )

    if not email_id:
        raise RuntimeError(
            "Resend did not confirm email acceptance."
        )

    logger.info(
        "OTP email accepted by provider for user ID %s",
        user.pk,
    )

    return result


# ==========================================
# CUSTOMER REGISTRATION
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register_customer(request):
    serializer = RegisterSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    password = serializer.validated_data["password"]

    try:
        validate_password(password)

    except ValidationError as exc:
        return Response(
            {"password": exc.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            user = serializer.save()

            # Account remains inactive until
            # email OTP verification succeeds.
            user.is_active = False
            user.save(
                update_fields=["is_active"]
            )

            verification = EmailOTP.objects.create(
                user=user
            )

            otp = verification.generate_otp()

            # If the email API raises an error,
            # the database transaction rolls back.
            send_verification_email(user, otp)

    except Exception:
        logger.exception(
            "Customer registration or OTP delivery failed"
        )

        return Response(
            {
                "error": (
                    "Unable to complete registration "
                    "or send verification email. "
                    "Please try again."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "message": (
                "Registration successful. "
                "Please verify your email."
            ),
            "email": user.email,
            "requires_verification": True,
        },
        status=status.HTTP_201_CREATED,
    )


# ==========================================
# VERIFY EMAIL OTP
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPVerifyThrottle])
def verify_email_otp(request):
    email = str(
        request.data.get("email") or ""
    ).strip()

    otp = str(
        request.data.get("otp") or ""
    ).strip()

    if not email or not otp:
        return Response(
            {
                "error": (
                    "Email and OTP are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(otp) != 6 or not otp.isdigit():
        return Response(
            {
                "error": (
                    "Enter a valid 6-digit OTP."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        users = list(
            User.objects.select_for_update()
            .filter(email__iexact=email)[:2]
        )

        if len(users) != 1:
            return Response(
                {
                    "error": (
                        "Invalid email or OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = users[0]

        try:
            verification = (
                EmailOTP.objects.select_for_update()
                .get(user=user)
            )

        except EmailOTP.DoesNotExist:
            return Response(
                {
                    "error": (
                        "Invalid email or OTP."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification.is_verified:
            if user.is_active:
                return Response(
                    {
                        "message": (
                            "Email already verified."
                        ),
                        "verified": True,
                    }
                )

            return Response(
                {
                    "error": (
                        "Account verification state is "
                        "inconsistent. Contact support."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        if not verification.verify_otp(otp):
            return Response(
                {
                    "error": (
                        "Invalid, expired, or exhausted OTP. "
                        "Request a new code if needed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(
            update_fields=["is_active"]
        )

    return Response(
        {
            "message": (
                "Email verified successfully. "
                "You can now log in."
            ),
            "verified": True,
        },
        status=status.HTTP_200_OK,
    )


# ==========================================
# RESEND EMAIL OTP
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPResendThrottle])
def resend_email_otp(request):
    email = str(
        request.data.get("email") or ""
    ).strip()

    if not email:
        return Response(
            {
                "error": "Email is required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    generic_message = (
        "If an unverified account exists, "
        "a verification email will be sent."
    )

    try:
        with transaction.atomic():
            users = list(
                User.objects.select_for_update()
                .filter(email__iexact=email)[:2]
            )

            if len(users) != 1:
                return Response(
                    {
                        "message": generic_message
                    }
                )

            user = users[0]

            if user.is_active:
                return Response(
                    {
                        "message": generic_message
                    }
                )

            try:
                verification = (
                    EmailOTP.objects.select_for_update()
                    .get(user=user)
                )

            except EmailOTP.DoesNotExist:
                return Response(
                    {
                        "message": generic_message
                    }
                )

            if verification.is_verified:
                return Response(
                    {
                        "message": generic_message
                    }
                )

            # ----------------------------------
            # 60-SECOND RESEND COOLDOWN
            # ----------------------------------

            if verification.last_sent_at:
                next_allowed = (
                    verification.last_sent_at
                    + timedelta(seconds=60)
                )

                now = timezone.now()

                if now < next_allowed:
                    remaining = max(
                        1,
                        int(
                            (
                                next_allowed - now
                            ).total_seconds()
                        ) + 1,
                    )

                    return Response(
                        {
                            "error": (
                                "Please wait before "
                                "requesting another OTP."
                            ),
                            "retry_after": remaining,
                        },
                        status=(
                            status.HTTP_429_TOO_MANY_REQUESTS
                        ),
                        headers={
                            "Retry-After": str(remaining),
                        },
                    )

            # ----------------------------------
            # GENERATE AND SEND NEW OTP
            # ----------------------------------

            otp = verification.generate_otp()

            # A provider exception rolls back
            # the newly generated OTP.
            send_verification_email(user, otp)

    except Exception:
        logger.exception(
            "OTP resend failed"
        )

        return Response(
            {
                "error": (
                    "Unable to send OTP email. "
                    "Please try again later."
                )
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "message": generic_message,
            "retry_after": 60,
        },
        status=status.HTTP_200_OK,
    )


# ==========================================
# CUSTOMER LOGIN
# ==========================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login_customer(request):
    serializer = LoginSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    email = serializer.validated_data[
        "email"
    ].strip()

    password = serializer.validated_data[
        "password"
    ]

    matching_users = list(
        User.objects.filter(
            email__iexact=email
        )[:2]
    )

    if len(matching_users) != 1:
        return Response(
            {
                "error": (
                    "Invalid email or password."
                )
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = matching_users[0]

    if not user.check_password(password):
        return Response(
            {
                "error": (
                    "Invalid email or password."
                )
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        verification = EmailOTP.objects.filter(
            user=user,
            is_verified=False,
        ).exists()

        if verification:
            return Response(
                {
                    "error": (
                        "Please verify your email "
                        "before logging in."
                    ),
                    "requires_verification": True,
                    "email": user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                "error": (
                    "This account is inactive."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        {
            "message": "Login successful.",
            "user": CustomerSerializer(
                user
            ).data,
            "tokens": generate_tokens(user),
        },
        status=status.HTTP_200_OK,
    )


# ==========================================
# CUSTOMER PROFILE
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_profile(request):
    return Response(
        CustomerSerializer(
            request.user
        ).data,
        status=status.HTTP_200_OK,
    )


# ==========================================
# CUSTOMER ORDERS WITH REVIEW STATUS
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def customer_orders(request):
    orders = (
        Order.objects
        .filter(customer=request.user)
        .prefetch_related("items")
        .order_by("-created_at")
    )

    reviewed_product_ids = set(
        ProductReview.objects.filter(
            customer=request.user
        ).values_list(
            "product_id",
            flat=True,
        )
    )

    results = []

    for order in orders:
        order_items = []

        for item in order.items.all():
            product_id = item.product_id

            already_reviewed = (
                product_id in reviewed_product_ids
            )

            can_review = (
                order.status == "delivered"
                and product_id is not None
                and not already_reviewed
            )

            order_items.append({
                "id": item.id,
                "product_id": product_id,
                "product_name": item.product_name,
                "size": item.size,
                "quantity": item.quantity,
                "price": str(item.price),
                "total": str(item.total),
                "can_review": can_review,
                "already_reviewed": already_reviewed,
            })

        results.append({
            "id": order.id,
            "order_number": order.order_number,
            "total": str(order.total),
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
            "created_at": order.created_at,
            "items": order_items,
        })

    return Response(
        results,
        status=status.HTTP_200_OK,
    )
