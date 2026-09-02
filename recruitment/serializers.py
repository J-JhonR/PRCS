import json

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    CandidateProfile,
    Company,
    CompanyPhoto,
    Interview,
    JobApplication,
    JobOffer,
    Message,
    RecruiterProfile,
    SavedJob,
)


class CompanyPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPhoto
        fields = ["id", "image", "caption", "created_at"]
        read_only_fields = ["created_at"]


class CompanySerializer(serializers.ModelSerializer):
    photos = CompanyPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "employer_type",
            "name",
            "slug",
            "sector",
            "location",
            "size",
            "description",
            "website",
            "video_url",
            "logo",
            "banner",
            "photos",
            "is_active",
        ]
        read_only_fields = ["is_active"]


class CandidateProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", required=False, allow_blank=True)
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    cv = serializers.FileField(source="user.cv", required=False, allow_null=True)
    photo_profil = serializers.ImageField(source="user.photo_profil", required=False, allow_null=True)
    remove_cv = serializers.BooleanField(write_only=True, required=False, default=False)
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "user",
            "full_name",
            "first_name",
            "last_name",
            "user_email",
            "headline",
            "phone",
            "location",
            "bio",
            "skills",
            "experiences",
            "education",
            "availability_status",
            "linkedin_url",
            "portfolio_url",
            "cv",
            "photo_profil",
            "remove_cv",
            "remove_photo",
        ]
        read_only_fields = ["user"]

    def validate_skills(self, value):
        return self._parse_json_field(value, expected_type=list, default=[])

    def validate_experiences(self, value):
        return self._parse_json_field(value, expected_type=list, default=[])

    def validate_education(self, value):
        return self._parse_json_field(value, expected_type=list, default=[])

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        remove_cv = validated_data.pop("remove_cv", False)
        remove_photo = validated_data.pop("remove_photo", False)
        user = instance.user
        full_name = user_data.pop("full_name", None)
        first_name = user_data.pop("first_name", None)
        last_name = user_data.pop("last_name", None)

        if first_name is not None:
            user.first_name = first_name.strip()
        if last_name is not None:
            user.last_name = last_name.strip()

        if first_name is not None or last_name is not None:
            user.full_name = f"{user.first_name} {user.last_name}".strip() or None
        elif full_name is not None:
            user.full_name = full_name.strip() or None

        if remove_cv and user.cv:
            user.cv.delete(save=False)
            user.cv = None
        if remove_photo and user.photo_profil:
            user.photo_profil.delete(save=False)
            user.photo_profil = None

        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        user = instance.user
        request = self.context.get("request")
        data["first_name"] = user.first_name
        data["last_name"] = user.last_name
        data["full_name"] = (
            user.full_name
            or f"{user.first_name} {user.last_name}".strip()
            or user.username
        )
        data["cv"] = self._file_url(user.cv, request)
        data["photo_profil"] = self._file_url(user.photo_profil, request)
        return data

    def _file_url(self, file_field, request):
        if not file_field:
            return None
        url = file_field.url
        return request.build_absolute_uri(url) if request else url

    def _parse_json_field(self, value, expected_type=list, default=None):
        if value in (None, "", []):
            return default if default is not None else expected_type()

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError("Format JSON invalide.") from exc

        if not isinstance(value, expected_type):
            raise serializers.ValidationError("Format de données invalide.")

        return value


class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ["id", "user", "company", "job_title", "phone"]
        read_only_fields = ["user"]


class JobOfferSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        source="company",
        queryset=Company.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = JobOffer
        fields = [
            "id",
            "company",
            "company_id",
            "title",
            "slug",
            "location",
            "workplace_type",
            "employment_type",
            "experience_level",
            "salary_min",
            "salary_max",
            "currency",
            "description",
            "requirements",
            "benefits",
            "status",
            "published_at",
            "created_at",
        ]
        read_only_fields = ["slug", "created_at"]


class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    job_offer_title = serializers.CharField(source="job_offer.title", read_only=True)
    job_offer_company = serializers.CharField(source="job_offer.company.name", read_only=True)
    job_offer_location = serializers.CharField(source="job_offer.location", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_offer",
            "job_offer_title",
            "job_offer_company",
            "job_offer_location",
            "candidate",
            "candidate_email",
            "cover_letter",
            "cv_file",
            "status",
            "created_at",
        ]
        read_only_fields = ["candidate", "status", "created_at"]


def _display_name(user):
    return user.full_name or f"{user.first_name} {user.last_name}".strip() or user.username


class RecruiterApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.EmailField(source="candidate.email", read_only=True)
    job_offer_title = serializers.CharField(source="job_offer.title", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_offer",
            "job_offer_title",
            "candidate",
            "candidate_name",
            "candidate_email",
            "cover_letter",
            "cv_file",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "job_offer",
            "candidate",
            "candidate_name",
            "candidate_email",
            "job_offer_title",
            "cover_letter",
            "cv_file",
            "created_at",
        ]

    def get_candidate_name(self, obj):
        return _display_name(obj.candidate)


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ["id", "job_application", "sender", "sender_name", "body", "read", "created_at"]
        read_only_fields = ["job_application", "sender", "read", "created_at"]

    def get_sender_name(self, obj):
        return _display_name(obj.sender)


class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodField()
    job_offer_title = serializers.CharField(source="job_application.job_offer.title", read_only=True)

    class Meta:
        model = Interview
        fields = [
            "id",
            "job_application",
            "candidate_name",
            "job_offer_title",
            "scheduled_at",
            "mode",
            "location_or_link",
            "status",
            "notes",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def get_candidate_name(self, obj):
        return _display_name(obj.job_application.candidate)


class SavedJobSerializer(serializers.ModelSerializer):
    job_offer_detail = JobOfferSerializer(source="job_offer", read_only=True)

    class Meta:
        model = SavedJob
        fields = ["id", "job_offer", "job_offer_detail", "created_at"]
        read_only_fields = ["created_at"]


User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "full_name",
            "first_name",
            "last_name",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["username", "email", "role", "first_name", "last_name", "date_joined"]

    def get_full_name(self, obj):
        return _display_name(obj)


class AdminCompanySerializer(CompanySerializer):
    class Meta(CompanySerializer.Meta):
        read_only_fields = []
