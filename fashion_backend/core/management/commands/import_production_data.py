
import os

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from catalog.models import Category, Product, ProductVariant


class Command(BaseCommand):
    help = "Import initial Roseva Fashion data into production"

    def handle(self, *args, **options):

        if os.environ.get("IMPORT_INITIAL_DATA", "").lower() != "true":
            self.stdout.write("Initial import disabled.")
            return

        fixture_path = settings.BASE_DIR / "production_data.json"

        if not fixture_path.is_file():
            raise CommandError(
                f"Missing fixture: {fixture_path}"
            )

        self.stdout.write(
            f"Database engine: {connection.vendor}"
        )

        if connection.vendor != "postgresql":
            raise CommandError(
                "Production import requires PostgreSQL. "
                "Check the DATABASE_URL environment variable."
            )

        with transaction.atomic():

            product_count = Product.objects.count()
            category_count = Category.objects.count()
            variant_count = ProductVariant.objects.count()

            self.stdout.write(
                f"Before import: "
                f"{product_count} products, "
                f"{category_count} categories, "
                f"{variant_count} variants"
            )

            if (
                product_count > 0
                or category_count > 0
                or variant_count > 0
            ):
                self.stdout.write(
                    self.style.WARNING(
                        "Existing catalog found. Import skipped."
                    )
                )
                return

            self.stdout.write(
                "Importing Roseva Fashion fixture..."
            )

            call_command(
                "loaddata",
                str(fixture_path),
                verbosity=1,
            )

            self.stdout.write(
                f"After import: "
                f"{Product.objects.count()} products, "
                f"{Category.objects.count()} categories, "
                f"{ProductVariant.objects.count()} variants"
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Production data import completed."
            )
        )
