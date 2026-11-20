
from rest_framework import serializers

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = "__all__"


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "size",
            "color",
            "sku",
            "stock",
            "is_active",
        )


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(
        source="category.slug",
        read_only=True
    )

    ageGroup = serializers.CharField(
        source="get_age_group_display",
        read_only=True
    )

    originalPrice = serializers.DecimalField(
        source="original_price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    isNew = serializers.BooleanField(
        source="is_new",
        read_only=True
    )

    isFeatured = serializers.BooleanField(
        source="is_featured",
        read_only=True
    )

    sizes = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "category",
            "description",
            "short_description",
            "price",
            "originalPrice",
            "image",
            "fabric",
            "occasion",
            "ageGroup",
            "isNew",
            "isFeatured",
            "sizes",
            "color",
            "created_at",
        )

    def get_sizes(self, obj):
        return list(
            obj.variants.filter(
                is_active=True
            ).values_list("size", flat=True).distinct()
        )

    def get_color(self, obj):
        variant = obj.variants.filter(
            is_active=True
        ).first()

        return variant.color if variant else ""

