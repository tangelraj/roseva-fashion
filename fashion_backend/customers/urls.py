
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [

    # ==========================================
    # CUSTOMER REGISTRATION
    # ==========================================

    path(
        "register/",
        views.register_customer,
        name="customer_register",
    ),

    # ==========================================
    # EMAIL OTP VERIFICATION
    # ==========================================

    path(
        "verify-otp/",
        views.verify_email_otp,
        name="customer_verify_otp",
    ),

    # ==========================================
    # RESEND EMAIL OTP
    # ==========================================

    path(
        "resend-otp/",
        views.resend_email_otp,
        name="customer_resend_otp",
    ),

    # ==========================================
    # CUSTOMER LOGIN
    # ==========================================

    path(
        "login/",
        views.login_customer,
        name="customer_login",
    ),

    # ==========================================
    # CUSTOMER PROFILE
    # ==========================================

    path(
        "profile/",
        views.customer_profile,
        name="customer_profile",
    ),

    # ==========================================
    # CUSTOMER ORDERS
    # ==========================================

    path(
        "orders/",
        views.customer_orders,
        name="customer_orders",
    ),

    # ==========================================
    # JWT TOKEN REFRESH
    # ==========================================

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

]
