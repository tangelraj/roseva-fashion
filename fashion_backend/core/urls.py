
from django.urls import path

from . import views
from . import content_views


urlpatterns = [
    # =====================================
    # HOMEPAGE API
    # =====================================
    path(
        "homepage/",
        views.homepage_api,
        name="homepage",
    ),

    # =====================================
    # ABOUT US API
    # =====================================
    path(
        "about/",
        content_views.about_page,
        name="about-page",
    ),

    # =====================================
    # FAQ API
    # =====================================
    path(
        "faqs/",
        content_views.faq_list,
        name="faq-list",
    ),

    # =====================================
    # CONTACT SETTINGS API
    # =====================================
    path(
        "contact-settings/",
        content_views.contact_settings,
        name="contact-settings",
    ),

    # =====================================
    # CONTACT FORM SUBMISSION API
    # =====================================
    path(
        "contact-submit/",
        content_views.submit_contact,
        name="contact-submit",
    ),

    # =====================================
    # WHY CHOOSE US API
    # =====================================
    path(
        "why-choose-us/",
        content_views.why_choose_us,
        name="why-choose-us",
    ),
]
