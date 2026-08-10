from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()

ALLOWED_SELF_SERVICE_ROLES = {"candidat", "recruteur"}


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "role")
        extra_kwargs = {"role": {"required": False}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_role(self, value):
        if value and value not in ALLOWED_SELF_SERVICE_ROLES:
            raise serializers.ValidationError("Role invalide.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Identifiants invalides.")
        user_auth = authenticate(username=user.username, password=password)
        if not user_auth:
            raise serializers.ValidationError("Identifiants invalides.")
        attrs["user"] = user_auth
        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)
