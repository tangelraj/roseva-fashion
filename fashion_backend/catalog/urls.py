from django.urls import path
from .views import categories_api, products_api
from . import review_views

urlpatterns = [
    path("categories/", categories_api, name="categories-api"),
    path("products/", products_api, name="products-api"),
    path(
        "products/<int:product_id>/reviews/",
        review_views.product_reviews,
        name="product-reviews",
    ),

    path(
        "products/<int:product_id>/reviews/submit/",
        review_views.submit_product_review,
        name="submit-product-review",
    ),
]