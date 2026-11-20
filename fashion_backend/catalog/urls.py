from django.urls import path
from .views import categories_api, products_api

urlpatterns = [
    path("categories/", categories_api, name="categories-api"),
    path("products/", products_api, name="products-api"),
]