
import os

from django.core.management import call_command
from django.core.management.base import (
    BaseCommand,
    CommandError,
)


class Command(BaseCommand):
    help = "Import initial catalog and website content."

    def handle(self, *args, **options):

        if os.environ.get("IMPORT_INITIAL_DATA") != "true":
            self.stdout.write(
                "Import skipped."
            )
            return

        fixture_path = os.path.join(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(__file__)
                    )
                )
            ),
            "production_data.json",
        )

        if not os.path.exists(fixture_path):
            raise CommandError(
                "production_data.json was not found."
            )

        self.stdout.write(
            "Importing initial website data..."
        )

        call_command(
            "loaddata",
            fixture_path,
            verbosity=1,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Initial website data imported successfully."
            )
        )
