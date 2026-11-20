
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    WebsiteSettings,
    NavigationLink,
    HeroBanner,
    BenefitItem,
    HomepageSection,
    PromoBanner,
    FooterGroup,
)

from .serializers import (
    WebsiteSettingsSerializer,
    NavigationLinkSerializer,
    HeroBannerSerializer,
    BenefitItemSerializer,
    HomepageSectionSerializer,
    PromoBannerSerializer,
    FooterGroupSerializer,
)


@api_view(["GET"])
def homepage_api(request):
    website = WebsiteSettings.objects.first()

    navigation = NavigationLink.objects.filter(
        is_active=True
    ).order_by("display_order", "id")

    banners = HeroBanner.objects.filter(
        is_active=True
    ).order_by("display_order", "id")

    benefits = BenefitItem.objects.filter(
        is_active=True
    ).order_by("display_order", "id")

    sections = HomepageSection.objects.filter(
        is_active=True
    )

    promotions = PromoBanner.objects.filter(
        is_active=True
    )

    footer_groups = FooterGroup.objects.filter(
        is_active=True
    ).order_by("display_order", "id")

    context = {"request": request}

    return Response({
        "website": (
            WebsiteSettingsSerializer(
                website,
                context=context
            ).data if website else None
        ),
        "navigation": NavigationLinkSerializer(
            navigation,
            many=True,
            context=context
        ).data,
        "banners": HeroBannerSerializer(
            banners,
            many=True,
            context=context
        ).data,
        "benefits": BenefitItemSerializer(
            benefits,
            many=True,
            context=context
        ).data,
        "sections": HomepageSectionSerializer(
            sections,
            many=True,
            context=context
        ).data,
        "promotions": PromoBannerSerializer(
            promotions,
            many=True,
            context=context
        ).data,
        "footer_groups": FooterGroupSerializer(
            footer_groups,
            many=True,
            context=context
        ).data,
    })
