
from django.urls import path
from . import views

urlpatterns = [
    path(
        "",
        views.create_order,
        name="create_order",
    ),
    path(
        "<str:order_number>/track/",
        views.track_order,
        name="track_order",
    ),
]
