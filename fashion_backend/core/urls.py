
from django.urls import path
from . import views

urlpatterns = [
    path(
        "homepage/",
        views.homepage_api,
        name="homepage",
    ),
]
