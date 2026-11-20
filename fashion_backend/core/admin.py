
from django.contrib import admin
from django.utils.html import format_html

from .models import (
    WebsiteSettings,
    NavigationLink,
    HeroBanner,
    BenefitItem,
    HomepageSection,
    PromoBanner,
    PageContent,
    FooterGroup,
    FooterLink,
)


# ============================================
# WEBSITE SETTINGS
# ============================================

@admin.register(WebsiteSettings)
class WebsiteSettingsAdmin(admin.ModelAdmin):

    list_display = (
        "site_name",
        "email",
        "phone",
    )

    fieldsets = (
        ("Website Branding", {
            "fields": (
                "site_name",
                "brand_tagline",
                "logo",
                "favicon",
                "currency_symbol",
            )
        }),

        ("Header Settings", {
            "fields": (
                "top_bar_message",
                "search_placeholder",
            )
        }),

        ("Contact Details", {
            "fields": (
                "email",
                "phone",
                "whatsapp",
                "address",
            )
        }),

        ("Social Media", {
            "fields": (
                "instagram_url",
                "facebook_url",
            )
        }),

        ("Footer Settings", {
            "fields": (
                "footer_description",
                "footer_bottom_text",
            )
        }),
    )


# ============================================
# NAVIGATION LINKS
# ============================================

@admin.register(NavigationLink)
class NavigationLinkAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "url",
        "display_order",
        "is_active",
    )

    list_editable = (
        "display_order",
        "is_active",
    )

    search_fields = ("title",)

    ordering = ("display_order",)


# ============================================
# HERO BANNERS
# ============================================

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):

    list_display = (
        "image_preview",
        "title",
        "button_text",
        "display_order",
        "is_active",
    )

    list_display_links = ("title",)

    list_editable = (
        "display_order",
        "is_active",
    )

    search_fields = (
        "title",
        "subtitle",
    )

    readonly_fields = ("image_preview",)

    fieldsets = (
        ("Banner Text", {
            "fields": (
                "eyebrow",
                "title",
                "subtitle",
            )
        }),

        ("Banner Image", {
            "fields": (
                "image",
                "image_preview",
            )
        }),

        ("Button Settings", {
            "fields": (
                "button_text",
                "button_link",
            )
        }),

        ("Appearance", {
            "fields": (
                "overlay_opacity",
                "text_alignment",
            )
        }),

        ("Display Settings", {
            "fields": (
                "display_order",
                "is_active",
            )
        }),
    )

    def image_preview(self, obj):
        if obj.pk and obj.image:
            return format_html(
                '<img src="{}" style="width:180px;'
                'height:90px;object-fit:cover;'
                'border-radius:8px;" />',
                obj.image.url
            )

        return "No image uploaded"

    image_preview.short_description = "Image Preview"


# ============================================
# BENEFITS BAR
# ============================================

@admin.register(BenefitItem)
class BenefitItemAdmin(admin.ModelAdmin):

    list_display = (
        "text",
        "icon",
        "display_order",
        "is_active",
    )

    list_editable = (
        "display_order",
        "is_active",
    )

    search_fields = ("text",)

    ordering = ("display_order",)


# ============================================
# HOMEPAGE SECTIONS
# ============================================

@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):

    list_display = (
        "section_key",
        "title",
        "is_active",
    )

    list_editable = ("is_active",)

    search_fields = (
        "title",
        "description",
    )


# ============================================
# PROMOTIONAL BANNERS
# ============================================

@admin.register(PromoBanner)
class PromoBannerAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "is_active",
    )

    list_editable = ("is_active",)

    search_fields = (
        "title",
        "description",
    )


# ============================================
# PAGE CONTENT MANAGEMENT
# ============================================

@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):

    list_display = (
        "page",
        "section_key",
        "title",
        "display_order",
        "is_active",
    )

    list_filter = (
        "page",
        "is_active",
    )

    list_editable = (
        "display_order",
        "is_active",
    )

    search_fields = (
        "section_key",
        "title",
        "subtitle",
        "description",
    )

    list_per_page = 25

    fieldsets = (
        ("Page Information", {
            "fields": (
                "page",
                "section_key",
            )
        }),

        ("Editable Text Content", {
            "fields": (
                "eyebrow",
                "title",
                "subtitle",
                "description",
            )
        }),

        ("Image Management", {
            "fields": (
                "image",
            )
        }),

        ("Button Settings", {
            "fields": (
                "button_text",
                "button_link",
            )
        }),

        ("Display Settings", {
            "fields": (
                "display_order",
                "is_active",
            )
        }),
    )


# ============================================
# FOOTER LINKS INLINE
# ============================================

class FooterLinkInline(admin.TabularInline):

    model = FooterLink

    extra = 1

    fields = (
        "title",
        "url",
        "display_order",
        "is_active",
    )


# ============================================
# FOOTER GROUPS
# ============================================

@admin.register(FooterGroup)
class FooterGroupAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "display_order",
        "is_active",
    )

    list_editable = (
        "display_order",
        "is_active",
    )

    ordering = ("display_order",)

    inlines = [FooterLinkInline]


# ============================================
# FOOTER LINKS
# ============================================

@admin.register(FooterLink)
class FooterLinkAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "group",
        "url",
        "display_order",
        "is_active",
    )

    list_filter = (
        "group",
        "is_active",
    )

    list_editable = (
        "display_order",
        "is_active",
    )

    search_fields = (
        "title",
        "url",
    )
