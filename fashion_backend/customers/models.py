
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import (
    check_password,
    make_password,
)
from django.db import models
from django.utils import timezone


class EmailOTP(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_otp",
    )

    otp_hash = models.CharField(
        max_length=255,
        blank=True,
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    attempts = models.PositiveSmallIntegerField(
        default=0,
    )

    last_sent_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    is_verified = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def generate_otp(self):
        otp = f"{secrets.randbelow(1000000):06d}"

        self.otp_hash = make_password(otp)
        self.expires_at = (
            timezone.now() + timedelta(minutes=5)
        )
        self.attempts = 0
        self.last_sent_at = timezone.now()

        self.save(
            update_fields=[
                "otp_hash",
                "expires_at",
                "attempts",
                "last_sent_at",
            ]
        )

        return otp

    def verify_otp(self, otp):
        if self.is_verified:
            return False

        if not self.otp_hash or not self.expires_at:
            return False

        if timezone.now() >= self.expires_at:
            return False

        if self.attempts >= 5:
            return False

        self.attempts += 1

        valid = check_password(
            str(otp),
            self.otp_hash,
        )

        if valid:
            self.is_verified = True
            self.otp_hash = ""
            self.expires_at = None

            self.save(
                update_fields=[
                    "attempts",
                    "is_verified",
                    "otp_hash",
                    "expires_at",
                ]
            )

            return True

        self.save(update_fields=["attempts"])
        return False

    def __str__(self):
        return f"{self.user.email} - OTP"
