
from django.contrib import admin

from .models import EmailOTP


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):

    # ==========================================
    # ADMIN LIST DISPLAY
    # ==========================================

    list_display = (
        "user",
        "get_email",
        "is_verified",
        "expires_at",
        "attempts",
        "last_sent_at",
        "created_at",
    )

    # ==========================================
    # FILTER OPTIONS
    # ==========================================

    list_filter = (
        "is_verified",
        "created_at",
        "last_sent_at",
    )

    # ==========================================
    # SEARCH OPTIONS
    # ==========================================

    search_fields = (
        "user__email",
        "user__username",
    )

    # ==========================================
    # READ-ONLY FIELDS
    # ==========================================

    readonly_fields = (
        "user",
        "otp_hash",
        "expires_at",
        "attempts",
        "last_sent_at",
        "is_verified",
        "created_at",
    )

    # ==========================================
    # ADMIN FIELD GROUPS
    # ==========================================

    fieldsets = (
        (
            "Customer Information",
            {
                "fields": (
                    "user",
                    "is_verified",
                )
            },
        ),
        (
            "OTP Verification Details",
            {
                "fields": (
                    "otp_hash",
                    "expires_at",
                    "attempts",
                    "last_sent_at",
                )
            },
        ),
        (
            "Record Information",
            {
                "fields": (
                    "created_at",
                )
            },
        ),
    )

    # ==========================================
    # EMAIL DISPLAY
    # ==========================================

    @admin.display(description="Email Address")
    def get_email(self, obj):
        return obj.user.email

    # ==========================================
    # DISABLE MANUAL OTP CREATION
    # ==========================================

    def has_add_permission(self, request):
        return False

    # ==========================================
    # DISABLE MANUAL OTP EDITING
    # ==========================================

    def has_change_permission(self, request, obj=None):
        return False

    # ==========================================
    # ALLOW OTP DELETION FOR SUPERUSERS
    # ==========================================

    def has_delete_permission(self, request, obj=None):
        return (
            request.user.is_active
            and request.user.is_superuser
        )
