from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path(
        "register/",
        views.register_customer,
        name="customer_register",
    ),
    path(
        "login/",
        views.login_customer,
        name="customer_login",
    ),
    path(
        "profile/",
        views.customer_profile,
        name="customer_profile",
    ),
    path(
        "orders/",
        views.customer_orders,
        name="customer_orders",
    ),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]