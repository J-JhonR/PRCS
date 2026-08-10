from rest_framework import serializers

from .models import Candidate, Project, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class CandidateSerializer(serializers.ModelSerializer):
    """Infos candidat imbriquees dans un projet (lecture seule cote projet)."""

    class Meta:
        model = Candidate
        fields = ["id", "name", "title", "avatar", "status", "linkedin_url", "github_url"]


class ProjectSerializer(serializers.ModelSerializer):
    # Lecture: candidat et competences en objets complets (nested)
    candidate = CandidateSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)

    # Ecriture: on assigne le candidat et les competences par id
    candidate_id = serializers.PrimaryKeyRelatedField(
        source="candidate", queryset=Candidate.objects.all(), write_only=True
    )
    skill_ids = serializers.PrimaryKeyRelatedField(
        source="skills", queryset=Skill.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "image",
            "candidate",
            "candidate_id",
            "skills",
            "skill_ids",
            "published_at",
        ]
        read_only_fields = ["published_at"]
