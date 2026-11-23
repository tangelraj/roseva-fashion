
from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
)
from .models import ProductReview

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
        "display_order",
        "is_active",
    )
    list_editable = ("display_order", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "is_new",
        "is_featured",
        "is_active",
    )

    list_filter = (
        "category",
        "age_group",
        "is_new",
        "is_featured",
        "is_active",
    )

    list_editable = (
        "price",
        "is_new",
        "is_featured",
        "is_active",
    )

    search_fields = (
        "name",
        "sku",
        "description",
    )

    prepopulated_fields = {"slug": ("name",)}

    inlines = [
        ProductImageInline,
        ProductVariantInline,
    ]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "display_order")


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "size",
        "color",
        "sku",
        "stock",
        "is_active",
    )

    list_editable = ("stock", "is_active")
    list_filter = ("is_active", "size")


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "customer",
        "rating",
        "is_verified_purchase",
        "is_approved",
        "created_at",
    )

    list_filter = (
        "rating",
        "is_approved",
        "created_at",
    )

    search_fields = (
        "product__name",
        "customer__username",
        "title",
        "comment",
    )

    readonly_fields = (
        "product",
        "customer",
        "rating",
        "title",
        "comment",
        "is_verified_purchase",
        "created_at",
        "updated_at",
    )
