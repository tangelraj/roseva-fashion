
from django.db import models


class WebsiteSettings(models.Model):
    site_name = models.CharField(
        max_length=150,
        default="Roséva Fashion"
    )
    logo = models.ImageField(
        upload_to="website/logos/",
        blank=True,
        null=True
    )
    favicon = models.ImageField(
        upload_to="website/favicons/",
        blank=True,
        null=True
    )
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    whatsapp = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)

    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)

    currency_symbol = models.CharField(
        max_length=10,
        default="₹"
    )

    brand_tagline = models.CharField(
    max_length=100,
    default="FASHION"
    )

    top_bar_message = models.CharField(
        max_length=250,
        default="Free shipping on orders above ₹1999"
    )

    footer_description = models.TextField(
        default=(
            "Discover timeless elegance, beautiful ethnic wear, "
            "and modern styles for girls and women."
        )
    )

    footer_bottom_text = models.CharField(
        max_length=250,
        default="Made with love for beautiful fashion."
    )

    search_placeholder = models.CharField(
        max_length=200,
        default="Search sarees, frocks, kurtis..."
    )

    def __str__(self):
        return self.site_name

    class Meta:
        verbose_name_plural = "Website Settings"


class NavigationLink(models.Model):
    title = models.CharField(max_length=100)
    url = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.title


class HeroBanner(models.Model):
    eyebrow = models.CharField(
        max_length=150,
        blank=True
    )
    title = models.CharField(max_length=250)
    subtitle = models.TextField(blank=True)

    image = models.ImageField(
        upload_to="banners/"
    )

    button_text = models.CharField(
        max_length=100,
        default="Shop Collection"
    )
    button_link = models.CharField(
        max_length=255,
        default="/shop"
    )

    overlay_opacity = models.FloatField(default=0.35)

    text_alignment = models.CharField(
        max_length=20,
        choices=[
            ("left", "Left"),
            ("center", "Center"),
            ("right", "Right"),
        ],
        default="left"
    )

    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.title


class BenefitItem(models.Model):
    ICON_CHOICES = [
        ("truck", "Free Shipping - Truck"),
        ("shield", "Secure Shopping - Shield"),
        ("refresh", "Easy Returns - Refresh"),
        ("sparkles", "Curated Fashion - Sparkles"),
        ("gift", "Gift"),
        ("heart", "Heart"),
        ("tag", "Discount Tag"),
        ("package", "Package"),
        ("credit_card", "Credit Card"),
        ("support", "Customer Support"),
        ("star", "Star"),
    ]

    text = models.CharField(max_length=200)
    icon = models.CharField(
        max_length=30,
        choices=ICON_CHOICES,
        default="truck"
    )
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.text


class HomepageSection(models.Model):
    SECTION_CHOICES = [
        ("categories", "Shop by Category"),
        ("new_arrivals", "New Arrivals"),
        ("featured", "Featured Collection"),
        ("newsletter", "Newsletter / CTA"),
    ]

    section_key = models.CharField(
        max_length=50,
        choices=SECTION_CHOICES,
        unique=True
    )

    display_order = models.PositiveIntegerField(default=0)
    eyebrow = models.CharField(max_length=150, blank=True)
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)

    button_text = models.CharField(max_length=100, blank=True)
    button_link = models.CharField(max_length=255, blank=True)

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.get_section_key_display()


class PromoBanner(models.Model):
    eyebrow = models.CharField(max_length=150, blank=True)
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)

    image = models.ImageField(
        upload_to="promotions/",
        blank=True,
        null=True
    )

    button_text = models.CharField(
        max_length=100,
        default="Explore Collection"
    )
    button_link = models.CharField(
        max_length=255,
        default="/shop"
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class PageContent(models.Model):
    PAGE_CHOICES = [
        ("home", "Home"),
        ("shop", "Shop"),
        ("product_details", "Product Details"),
        ("cart", "Cart"),
        ("wishlist", "Wishlist"),
        ("checkout", "Checkout"),
        ("payment", "Payment"),
        ("order_success", "Order Success"),
        ("my_orders", "My Orders"),
        ("track_order", "Track Order"),
        ("login", "Login"),
        ("register", "Register"),
        ("footer", "Footer"),
    ]

    page = models.CharField(
        max_length=50,
        choices=PAGE_CHOICES
    )

    section_key = models.SlugField(
        max_length=100
    )

    title = models.CharField(
        max_length=250,
        blank=True
    )

    subtitle = models.CharField(
        max_length=250,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    image = models.ImageField(
        upload_to="page_content/",
        blank=True,
        null=True
    )

    button_text = models.CharField(
        max_length=100,
        blank=True
    )

    button_link = models.CharField(
        max_length=255,
        blank=True
    )

    display_order = models.PositiveIntegerField(
        default=0
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        ordering = ["page", "display_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["page", "section_key"],
                name="unique_page_content_section"
            )
        ]

    def __str__(self):
        return f"{self.get_page_display()} - {self.section_key}"


class FooterGroup(models.Model):
    title = models.CharField(max_length=150)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.title


class FooterLink(models.Model):
    group = models.ForeignKey(
        FooterGroup,
        on_delete=models.CASCADE,
        related_name="links"
    )

    title = models.CharField(max_length=150)
    url = models.CharField(max_length=255)

    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.title


class PageContent(models.Model):
    PAGE_CHOICES = [
        ("home", "Home"),
        ("shop", "Shop"),
        ("product_details", "Product Details"),
        ("cart", "Cart"),
        ("wishlist", "Wishlist"),
        ("checkout", "Checkout"),
        ("payment", "Payment"),
        ("order_success", "Order Success"),
        ("my_orders", "My Orders"),
        ("track_order", "Track Order"),
        ("login", "Login"),
        ("register", "Register"),
    ]

    page = models.CharField(
        max_length=50,
        choices=PAGE_CHOICES
    )

    section_key = models.SlugField(max_length=100)

    eyebrow = models.CharField(
        max_length=150,
        blank=True
    )

    title = models.CharField(
        max_length=250,
        blank=True
    )

    subtitle = models.CharField(
        max_length=250,
        blank=True
    )

    description = models.TextField(blank=True)

    image = models.ImageField(
        upload_to="pages/",
        blank=True,
        null=True
    )

    button_text = models.CharField(
        max_length=150,
        blank=True
    )

    button_link = models.CharField(
        max_length=255,
        blank=True
    )

    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["page", "display_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["page", "section_key"],
                name="unique_roseva_page_section"
            )
        ]

    def __str__(self):
        return f"{self.get_page_display()} - {self.section_key}"


from django.db import models


class AboutPage(models.Model):
    title = models.CharField(
        max_length=200,
        default="About Roséva Fashion"
    )
    subtitle = models.CharField(
        max_length=250,
        blank=True
    )
    description = models.TextField()
    mission = models.TextField(blank=True)
    vision = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="about/",
        blank=True,
        null=True
    )

    def __str__(self):
        return self.title


class FAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.question


class ContactSettings(models.Model):
    title = models.CharField(
        max_length=200,
        default="Contact Us"
    )
    description = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(
        max_length=30,
        blank=True
    )
    address = models.TextField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(
        max_length=200,
        blank=True
    )
    message = models.TextField()
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.name} - {self.email}"


class WhyChooseUsItem(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(
        max_length=50,
        default="heart"
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title
