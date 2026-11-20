
from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    readonly_fields = (
        "product",
        "product_name",
        "size",
        "quantity",
        "price",
        "total",
    )

    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "order_number",
        "full_name",
        "email",
        "total",
        "payment_method",
        "payment_status",
        "status",
        "courier_name",
        "tracking_number",
        "created_at",
    )

    list_display_links = (
        "order_number",
        "full_name",
    )

    list_editable = (
        "status",
    )

    list_filter = (
        "status",
        "payment_method",
        "payment_status",
        "created_at",
    )

    search_fields = (
        "order_number",
        "full_name",
        "email",
        "phone",
        "tracking_number",
    )

    readonly_fields = (
        "customer",
        "order_number",
        "full_name",
        "email",
        "phone",
        "address",
        "city",
        "state",
        "postal_code",
        "subtotal",
        "shipping",
        "total",
        "payment_method",
        "payment_status",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Order Information",
            {
                "fields": (
                    "order_number",
                    "customer",
                    "status",
                    "created_at",
                    "updated_at",
                )
            },
        ),
        (
            "Customer Details",
            {
                "fields": (
                    "full_name",
                    "email",
                    "phone",
                )
            },
        ),
        (
            "Delivery Address",
            {
                "fields": (
                    "address",
                    "city",
                    "state",
                    "postal_code",
                )
            },
        ),
        (
            "Payment Details",
            {
                "fields": (
                    "subtotal",
                    "shipping",
                    "total",
                    "payment_method",
                    "payment_status",
                )
            },
        ),
        (
            "Courier Tracking",
            {
                "fields": (
                    "courier_name",
                    "tracking_number",
                )
            },
        ),
    )

    inlines = [OrderItemInline]

    list_per_page = 25

    ordering = ("-created_at",)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "product_name",
        "size",
        "quantity",
        "price",
        "total",
    )

    search_fields = (
        "order__order_number",
        "product_name",
    )

    readonly_fields = (
        "order",
        "product",
        "product_name",
        "size",
        "quantity",
        "price",
        "total",
    )

    def has_add_permission(self, request):
        return False
