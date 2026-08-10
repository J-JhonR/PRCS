from django.contrib import admin

from .models import Candidate, Project, Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ["name", "title", "status"]
    list_filter = ["status"]
    search_fields = ["name", "title"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "candidate", "published_at"]
    list_filter = ["skills"]
    search_fields = ["title", "description", "candidate__name"]
    autocomplete_fields = ["candidate"]
    filter_horizontal = ["skills"]
