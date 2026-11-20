
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )
    confirm_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        if User.objects.filter(
            email__iexact=attrs["email"]
        ).exists():
            raise serializers.ValidationError({
                "email": "This email is already registered."
            })

        return attrs

    def create(self, validated_data):
        full_name = validated_data["full_name"].strip()
        email = validated_data["email"].strip().lower()

        try:
            with transaction.atomic():
                if User.objects.filter(
                    email__iexact=email
                ).exists():
                    raise serializers.ValidationError({
                        "email": "This email is already registered."
                    })

                user = User.objects.create_user(
                    username=f"customer_{uuid4().hex}",
                    email=email,
                    password=validated_data["password"],
                    first_name=full_name,
                )
        except IntegrityError:
            raise serializers.ValidationError({
                "email": "Unable to register this account."
            })

        return user


class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(
        source="first_name",
        read_only=True,
    )

    class Meta:
        model = User
        fields = ("id", "full_name", "email")
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

