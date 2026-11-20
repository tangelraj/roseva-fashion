
from rest_framework import serializers

from .models import (
    WebsiteSettings,
    NavigationLink,
    HeroBanner,
    BenefitItem,
    HomepageSection,
    PromoBanner,
    FooterGroup,
    FooterLink,
)


class WebsiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteSettings
        fields = "__all__"


class NavigationLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = NavigationLink
        fields = "__all__"


class HeroBannerSerializer(serializers.ModelSerializer):
    link = serializers.CharField(
        source="button_link",
        read_only=True
    )

    class Meta:
        model = HeroBanner
        fields = "__all__"


class BenefitItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitItem
        fields = "__all__"


class HomepageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageSection
        fields = "__all__"


class PromoBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoBanner
        fields = "__all__"


class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = "__all__"


class FooterGroupSerializer(serializers.ModelSerializer):
    links = serializers.SerializerMethodField()

    class Meta:
        model = FooterGroup
        fields = "__all__"

    def get_links(self, obj):
        links = obj.links.filter(
            is_active=True
        ).order_by("display_order", "id")

        return FooterLinkSerializer(
            links,
            many=True,
            context=self.context
        ).data
