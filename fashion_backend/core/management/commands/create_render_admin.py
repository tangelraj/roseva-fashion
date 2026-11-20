
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or update the Render admin account."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")

        if not username or not password:
            raise CommandError(
                "DJANGO_SUPERUSER_USERNAME and "
                "DJANGO_SUPERUSER_PASSWORD must be configured."
            )

        User = get_user_model()
        username_field = User.USERNAME_FIELD

        user, created = User.objects.get_or_create(
            **{username_field: username},
            defaults={"email": email} if username_field != "email" else {},
        )

        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                "Production admin account configured successfully."
            )
        )
