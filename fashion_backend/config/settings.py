
import os
from pathlib import Path
from datetime import timedelta

import dj_database_url


# ==========================================
# BASE DIRECTORY
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================================
# ENVIRONMENT HELPERS
# ==========================================

def get_env_bool(name, default=False):
    value = os.environ.get(name, str(default))

    return value.strip().lower() in (
        "true",
        "1",
        "yes",
        "on",
    )


def get_env_list(name, default=""):
    value = os.environ.get(name, default)

    return [
        item.strip()
        for item in value.split(",")
        if item.strip()
    ]


# ==========================================
# SECURITY
# ==========================================

DEBUG = get_env_bool("DEBUG", True)

SECRET_KEY = os.environ.get(
    "SECRET_KEY", ""
).strip()

if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = (
            "django-insecure-"
            "local-development-only-change-me"
        )
    else:
        raise RuntimeError(
            "SECRET_KEY environment variable "
            "is required in production."
        )

if not DEBUG and SECRET_KEY.startswith(
    "django-insecure-"
):
    raise RuntimeError(
        "Use a secure SECRET_KEY in production."
    )


# ==========================================
# ALLOWED HOSTS
# ==========================================

ALLOWED_HOSTS = get_env_list(
    "ALLOWED_HOSTS",
    "127.0.0.1,localhost",
)

render_hostname = os.environ.get(
    "RENDER_EXTERNAL_HOSTNAME", ""
).strip()

if (
    render_hostname
    and render_hostname not in ALLOWED_HOSTS
):
    ALLOWED_HOSTS.append(render_hostname)


# ==========================================
# INSTALLED APPLICATIONS
# ==========================================

INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Project apps
    "core",
    "catalog",
    "customers",
    "orders",
    "payments",
    "promotions",
    "shipping",

    # Cloudinary
    "cloudinary_storage",
    "cloudinary",
]


# ==========================================
# MIDDLEWARE
# ==========================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ==========================================
# URL CONFIGURATION
# ==========================================

ROOT_URLCONF = "config.urls"


# ==========================================
# TEMPLATES
# ==========================================

TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends."
            "django.DjangoTemplates"
        ),
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ==========================================
# WSGI
# ==========================================

WSGI_APPLICATION = "config.wsgi.application"


# ==========================================
# DATABASE
# ==========================================

DATABASE_URL = os.environ.get(
    "DATABASE_URL", ""
).strip()

if not DEBUG and not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is required in production. "
        "Configure a persistent PostgreSQL database."
    )

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=(
            bool(DATABASE_URL)
            and get_env_bool(
                "DATABASE_SSL_REQUIRE",
                False,
            )
        ),
    )
}


# ==========================================
# PASSWORD VALIDATION
# ==========================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ==========================================
# INTERNATIONALIZATION
# ==========================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True
USE_TZ = True


# ==========================================
# STATIC FILES
# ==========================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


# ==========================================
# MEDIA FILES
# ==========================================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ==========================================
# CLOUDINARY / FILE STORAGE
# ==========================================

CLOUDINARY_CLOUD_NAME = os.environ.get(
    "CLOUDINARY_CLOUD_NAME", ""
)

CLOUDINARY_API_KEY = os.environ.get(
    "CLOUDINARY_API_KEY", ""
)

CLOUDINARY_API_SECRET = os.environ.get(
    "CLOUDINARY_API_SECRET", ""
)

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": CLOUDINARY_CLOUD_NAME,
    "API_KEY": CLOUDINARY_API_KEY,
    "API_SECRET": CLOUDINARY_API_SECRET,
}

STORAGES = {
    "default": {
        "BACKEND": (
            "cloudinary_storage.storage.MediaCloudinaryStorage"
            if CLOUDINARY_CLOUD_NAME
            else "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage."
            "CompressedManifestStaticFilesStorage"
        ),
    },
}


# ==========================================
# CORS
# ==========================================

CORS_ALLOWED_ORIGINS = get_env_list(
    "CORS_ALLOWED_ORIGINS",
    (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://roseva-fashion.vercel.app"
    ),
)

CSRF_TRUSTED_ORIGINS = get_env_list(
    "CSRF_TRUSTED_ORIGINS",
    (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://roseva-fashion.vercel.app,"
        "https://roseva-fashion.onrender.com"
    ),
)

CORS_ALLOW_CREDENTIALS = True


# ==========================================
# DJANGO REST FRAMEWORK
# ==========================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        (
            "rest_framework.authentication."
            "SessionAuthentication"
        ),
        (
            "rest_framework_simplejwt."
            "authentication.JWTAuthentication"
        ),
    ],

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}


# ==========================================
# JWT AUTHENTICATION
# ==========================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=30
    ),

    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=1
    ),

    "AUTH_HEADER_TYPES": (
        "Bearer",
    ),
}


# ==========================================
# EMAIL CONFIGURATION
# ==========================================

EMAIL_HOST = os.environ.get(
    "EMAIL_HOST",
    "smtp.gmail.com",
)

EMAIL_PORT = int(
    os.environ.get("EMAIL_PORT", "587")
)

EMAIL_USE_TLS = get_env_bool(
    "EMAIL_USE_TLS",
    True,
)

EMAIL_USE_SSL = get_env_bool(
    "EMAIL_USE_SSL",
    False,
)

EMAIL_HOST_USER = os.environ.get(
    "EMAIL_HOST_USER", ""
).strip()

EMAIL_HOST_PASSWORD = os.environ.get(
    "EMAIL_HOST_PASSWORD", ""
).strip()

EMAIL_TIMEOUT = 20

# Local development defaults to printing OTP emails
# in the Django terminal.
#
# To send real emails locally, set:
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
#
# Production defaults to SMTP.

DEFAULT_EMAIL_BACKEND = (
    "django.core.mail.backends.console.EmailBackend"
    if DEBUG
    else "django.core.mail.backends.smtp.EmailBackend"
)

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    DEFAULT_EMAIL_BACKEND,
)

DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL",
    EMAIL_HOST_USER or "no-reply@localhost",
)

CONTACT_RECEIVER_EMAIL = os.environ.get(
    "CONTACT_RECEIVER_EMAIL",
    "tangelraj@gmail.com",
)

# Require credentials when production SMTP is used.
if (
    not DEBUG
    and EMAIL_BACKEND
    == "django.core.mail.backends.smtp.EmailBackend"
    and (
        not EMAIL_HOST_USER
        or not EMAIL_HOST_PASSWORD
    )
):
    raise RuntimeError(
        "EMAIL_HOST_USER and EMAIL_HOST_PASSWORD "
        "are required for production SMTP email."
    )


# ==========================================
# PRODUCTION SECURITY
# ==========================================

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

SECURE_SSL_REDIRECT = (
    not DEBUG
    and get_env_bool(
        "SECURE_SSL_REDIRECT",
        True,
    )
)

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"


# ==========================================
# DEFAULT PRIMARY KEY
# ==========================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
