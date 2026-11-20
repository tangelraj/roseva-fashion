
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


@api_view(["GET"])
def categories_api(request):
    categories = Category.objects.filter(
        is_active=True
    ).order_by("display_order", "name")

    return Response(
        CategorySerializer(
            categories,
            many=True,
            context={"request": request}
        ).data
    )


@api_view(["GET"])
def products_api(request):
    products = Product.objects.filter(
        is_active=True,
        category__is_active=True
    ).select_related("category").prefetch_related("variants")

    return Response(
        ProductSerializer(
            products,
            many=True,
            context={"request": request}
        ).data
    )
