
import os

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from catalog.models import Category, Product, ProductVariant


class Command(BaseCommand):
    help = "Import initial Roseva Fashion catalog and website content"

    def handle(self, *args, **options):

        enabled = os.environ.get(
            "IMPORT_INITIAL_DATA", ""
        ).strip().lower()

        if enabled != "true":
            self.stdout.write(
                "Initial data import is disabled."
            )
            return

        fixture_path = settings.BASE_DIR / "production_data.json"

        if not fixture_path.is_file():
            raise CommandError(
                f"Fixture file not found: {fixture_path}"
            )

        existing_products = Product.objects.count()
        existing_categories = Category.objects.count()
        existing_variants = ProductVariant.objects.count()

        self.stdout.write(
            f"Existing products: {existing_products}"
        )
        self.stdout.write(
            f"Existing categories: {existing_categories}"
        )
        self.stdout.write(
            f"Existing variants: {existing_variants}"
        )

        # Prevent overwriting existing production catalog data.
        if any((
            existing_products,
            existing_categories,
            existing_variants,
        )):
            self.stdout.write(
                self.style.WARNING(
                    "Catalog already contains data. "
                    "Import skipped to protect existing records."
                )
            )
            return

        self.stdout.write(
            "Importing initial Roseva Fashion data..."
        )

        try:
            with transaction.atomic():
                call_command(
                    "loaddata",
                    str(fixture_path),
                    verbosity=1,
                )

        except Exception as exc:
            raise CommandError(
                f"Initial data import failed: {exc}"
            ) from exc

        self.stdout.write(
            self.style.SUCCESS(
                "Initial website data imported successfully."
            )
        )

        self.stdout.write(
            f"Products: {Product.objects.count()}"
        )
        self.stdout.write(
            f"Categories: {Category.objects.count()}"
        )
        self.stdout.write(
            f"Variants: {ProductVariant.objects.count()}"
        )
