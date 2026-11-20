
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand

from core.models import (
    WebsiteSettings,
    NavigationLink,
    HeroBanner,
    BenefitItem,
    HomepageSection,
    PromoBanner,
    FooterGroup,
    FooterLink,
)

from catalog.models import (
    Category,
    Product,
    ProductVariant,
)


class Command(BaseCommand):
    help = "Populate Roséva Fashion Admin with existing website content"

    def handle(self, *args, **options):

        frontend_public = (
            Path(settings.BASE_DIR).parent
            / "fashion_frontend"
            / "public"
        )

        def attach_image(instance, field_name, relative_path):
            """
            Copy an existing React public image into Django media.
            Never replace an image already uploaded in Admin.
            """
            image_field = getattr(instance, field_name)

            if image_field:
                return

            source = frontend_public / relative_path.lstrip("/")

            if not source.is_file():
                self.stdout.write(
                    self.style.WARNING(
                        f"Image not found: {source}"
                    )
                )
                return

            with source.open("rb") as image_file:
                image_field.save(
                    source.name,
                    File(image_file),
                    save=True,
                )

        # ======================================
        # 1. WEBSITE SETTINGS
        # ======================================

        WebsiteSettings.objects.get_or_create(
            pk=1,
            defaults={
                "site_name": "ROSÉVA",
                "brand_tagline": "FASHION",
                "top_bar_message":
                    "Free shipping on orders above ₹1999",
                "search_placeholder":
                    "Search sarees, frocks, kurtis...",
                "email": "support@example.com",
                "address": "India",
                "instagram_url": "https://instagram.com",
                "facebook_url": "https://facebook.com",
                "footer_description": (
                    "Discover timeless elegance, beautiful "
                    "ethnic wear, and modern styles for "
                    "girls and women."
                ),
                "footer_bottom_text":
                    "Made with love for beautiful fashion.",
            },
        )

        # ======================================
        # 2. HEADER NAVIGATION
        # ======================================

        navigation = [
            ("New Arrivals", "/shop?sort=newest"),
            ("Sarees", "/shop?category=sarees"),
            ("Salwar Suits", "/shop?category=salwar"),
            ("Frocks", "/shop?category=frocks"),
            ("Kurtis", "/shop?category=kurtis"),
            ("Gowns", "/shop?category=gowns"),
            ("Lehengas", "/shop?category=lehengas"),
            ("Sale", "/shop?sort=discount"),
        ]

        for index, (title, url) in enumerate(navigation):
            NavigationLink.objects.get_or_create(
                title=title,
                defaults={
                    "url": url,
                    "display_order": index,
                    "is_active": True,
                },
            )

        # ======================================
        # 3. HERO SLIDER
        # ======================================

        banners = [
            {
                "eyebrow": "THE WEDDING EDIT",
                "title": "Celebrate Every Beautiful Moment",
                "subtitle":
                    "Elegant sarees and suits for every celebration.",
                "image": "images/banners/hero-wedding.jpeg",
                "link": "/shop?occasion=Wedding",
            },
            {
                "eyebrow": "TIMELESS ELEGANCE",
                "title": "Draped in Grace",
                "subtitle":
                    "Discover our exquisite saree collection.",
                "image": "images/banners/hero-saree.jpeg",
                "link": "/shop?category=sarees",
            },
            {
                "eyebrow": "LITTLE FASHION STORIES",
                "title": "Made for Little Princesses",
                "subtitle":
                    "Adorable frocks for every special occasion.",
                "image": "images/banners/hero-frocks.jpeg",
                "link": "/shop?category=frocks",
            },
        ]

        for index, data in enumerate(banners):
            banner, created = HeroBanner.objects.get_or_create(
                title=data["title"],
                defaults={
                    "eyebrow": data["eyebrow"],
                    "subtitle": data["subtitle"],
                    "button_text": "Shop Collection",
                    "button_link": data["link"],
                    "display_order": index,
                    "is_active": True,
                },
            )

            attach_image(banner, "image", data["image"])

        # ======================================
        # 4. MOVING BENEFITS BAR
        # ======================================

        benefits = [
            ("Free Shipping Above ₹1999", "truck"),
            ("Secure Shopping", "shield"),
            ("Easy Returns*", "refresh"),
            ("Curated Fashion", "sparkles"),
        ]

        for index, (message, icon) in enumerate(benefits):
            BenefitItem.objects.get_or_create(
                text=message,
                defaults={
                    "icon": icon,
                    "display_order": index,
                    "is_active": True,
                },
            )

        # ======================================
        # 5. HOMEPAGE SECTIONS
        # ======================================

        sections = [
            {
                "key": "categories",
                "eyebrow": "EXPLORE OUR COLLECTIONS",
                "title": "Shop by Category",
                "description":
                    "Beautiful styles for every age and every occasion.",
                "button_text": "Explore Collection",
                "button_link": "/shop",
            },
            {
                "key": "new_arrivals",
                "eyebrow": "FRESHLY CURATED",
                "title": "New Arrivals",
                "description":
                    "Discover the latest styles you'll fall in love with.",
                "button_text": "View All Products",
                "button_link": "/shop?sort=newest",
            },
            {
                "key": "featured",
                "eyebrow": "HANDPICKED FOR YOU",
                "title": "Our Featured Collection",
                "description":
                    "Discover timeless outfits and beautiful everyday styles.",
                "button_text": "",
                "button_link": "",
            },
            {
                "key": "newsletter",
                "eyebrow": "THE ROSÉVA EDIT",
                "title": "Style That Tells Your Story",
                "description": (
                    "Explore elegant ethnic fashion for women, "
                    "teens, and little girls."
                ),
                "button_text": "Shop All Collections",
                "button_link": "/shop",
            },
        ]

        for index, data in enumerate(sections):
            HomepageSection.objects.get_or_create(
                section_key=data["key"],
                defaults={
                    "eyebrow": data["eyebrow"],
                    "title": data["title"],
                    "description": data["description"],
                    "button_text": data["button_text"],
                    "button_link": data["button_link"],
                    "display_order": index,
                    "is_active": True,
                },
            )

        # ======================================
        # 6. PROMOTIONAL BANNER
        # ======================================

        promo, created = PromoBanner.objects.get_or_create(
            title="Elegance for Every Celebration",
            defaults={
                "eyebrow": "SPECIAL OCCASION EDIT",
                "description": (
                    "From wedding celebrations to festive "
                    "gatherings, discover outfits made for "
                    "unforgettable moments."
                ),
                "button_text": "Explore Wedding Edit",
                "button_link": "/shop?occasion=Wedding",
                "is_active": True,
            },
        )

        attach_image(
            promo,
            "image",
            "images/offers/festive-offer.jpg",
        )

        # ======================================
        # 7. CATEGORIES
        # ======================================

        categories = [
            ("Sarees", "sarees", "category-sarees.jpeg"),
            ("Salwar Suits", "salwar", "category-salwar.jpeg"),
            ("Frocks", "frocks", "category-frocks.jpeg"),
            ("Kurtis", "kurtis", "category-kurtis.jpeg"),
            ("Gowns", "gowns", "category-gowns.jpeg"),
            ("Lehengas", "lehengas", "category-lehengas.jpeg"),
        ]

        for index, (name, slug, image_name) in enumerate(categories):
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": f"Explore our {name} collection.",
                    "display_order": index,
                    "is_active": True,
                },
            )

            attach_image(
                category,
                "image",
                f"images/categories/{image_name}",
            )

        # ======================================
        # 8. PRODUCTS
        # ======================================

        products = [
            (
                "Rose Pink Silk Saree", "sarees",
                "RF-001", 3499, 4999,
                "Silk", "women", "Pink", "Wedding",
                True, "product-1.webp",
                ["Free Size"],
            ),
            (
                "Cream Embroidered Salwar Suit", "salwar",
                "RF-002", 2299, 3299,
                "Cotton", "women", "Cream", "Festive",
                True, "product-2.webp",
                ["S", "M", "L", "XL"],
            ),
            (
                "Girls Floral Party Frock", "frocks",
                "RF-003", 1299, 1999,
                "Net", "kids", "Pink", "Party",
                True, "product-3.avif",
                ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
            ),
            (
                "Cotton Printed Kurti", "kurtis",
                "RF-004", 899, 1499,
                "Cotton", "teens", "Blue", "Casual",
                False, "product-4.webp",
                ["XS", "S", "M", "L"],
            ),
            (
                "Maroon Festive Gown", "gowns",
                "RF-005", 2899, 3999,
                "Georgette", "women", "Maroon", "Festive",
                True, "product-5.jpg",
                ["S", "M", "L", "XL"],
            ),
            (
                "Rose Gold Designer Lehenga", "lehengas",
                "RF-006", 5999, 7999,
                "Silk", "women", "Rose Gold", "Wedding",
                False, "product-6.webp",
                ["S", "M", "L"],
            ),
            (
                "Georgette Designer Saree", "sarees",
                "RF-007", 2599, 3499,
                "Georgette", "women", "Purple", "Party",
                True, "product-7.webp",
                ["Free Size"],
            ),
            (
                "Girls Cotton Casual Frock", "frocks",
                "RF-008", 799, 1199,
                "Cotton", "kids", "Yellow", "Casual",
                False, "product-8.webp",
                ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
            ),
        ]

        for index, item in enumerate(products):
            (
                name, category_slug, sku,
                price, original_price, fabric,
                age_group, color, occasion,
                is_new, image_name, sizes,
            ) = item

            category = Category.objects.get(slug=category_slug)

            product, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "slug": sku.lower(),
                    "category": category,
                    "description": (
                        f"{name} - {fabric} fabric, "
                        f"perfect for {occasion.lower()} occasions."
                    ),
                    "price": price,
                    "original_price": original_price,
                    "fabric": fabric,
                    "occasion": occasion,
                    "age_group": age_group,
                    "is_new": is_new,
                    "is_featured": index >= 4,
                    "is_active": True,
                },
            )

            attach_image(
                product,
                "image",
                f"images/products/{image_name}",
            )

            for size_index, size in enumerate(sizes):
                ProductVariant.objects.get_or_create(
                    sku=f"{sku}-{size_index + 1}",
                    defaults={
                        "product": product,
                        "size": size,
                        "color": color,
                        "stock": 0,
                        "is_active": True,
                    },
                )

        # ======================================
        # 9. FOOTER GROUPS AND LINKS
        # ======================================

        footer_data = [
            (
                "Quick Links",
                [
                    ("Home", "/"),
                    ("Shop All", "/shop"),
                    ("Wishlist", "/wishlist"),
                    ("Shopping Cart", "/cart"),
                ],
            ),
            (
                "Collections",
                [
                    ("Sarees", "/shop?category=sarees"),
                    ("Salwar Suits", "/shop?category=salwar"),
                    ("Frocks", "/shop?category=frocks"),
                    ("Kurtis", "/shop?category=kurtis"),
                    ("Lehengas", "/shop?category=lehengas"),
                ],
            ),
            (
                "Customer Care",
                [
                    ("Track Order", "/track-order"),
                    ("Contact Support", "mailto:support@example.com"),
                ],
            ),
        ]

        for group_index, (group_title, links) in enumerate(footer_data):
            group, created = FooterGroup.objects.get_or_create(
                title=group_title,
                defaults={
                    "display_order": group_index,
                    "is_active": True,
                },
            )

            for link_index, (title, url) in enumerate(links):
                FooterLink.objects.get_or_create(
                    group=group,
                    title=title,
                    defaults={
                        "url": url,
                        "display_order": link_index,
                        "is_active": True,
                    },
                )

        self.stdout.write(
            self.style.SUCCESS(
                "Roséva Fashion Admin content populated successfully!"
            )
        )
