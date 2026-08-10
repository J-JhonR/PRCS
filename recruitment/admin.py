from django.contrib import admin

from .models import CandidateProfile, Company, JobApplication, JobOffer, RecruiterProfile, SavedJob


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "sector", "location", "size", "is_active")
    list_filter = ("sector", "size", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "sector", "location")


@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "company", "employment_type", "status", "published_at")
    list_filter = ("employment_type", "workplace_type", "status")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "company__name", "location")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "candidate", "job_offer", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("candidate__username", "candidate__email", "job_offer__title")


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "location", "availability_status")
    list_filter = ("availability_status",)
    search_fields = ("user__username", "user__email", "headline")


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "company", "job_title")
    search_fields = ("user__username", "user__email", "company__name")


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "job_offer", "created_at")
    search_fields = ("user__username", "job_offer__title")
