from django.urls import path

from .admin_views import (
    AdminCompanyDetailView,
    AdminCompanyListView,
    AdminJobOfferDetailView,
    AdminJobOfferListView,
    AdminStatsView,
    AdminUserDetailView,
    AdminUserListView,
)
from .views import (
    ApplicationDecisionView,
    CandidateProfileDetailView,
    CompanyDetailView,
    CompanyListView,
    CompanyPhotoDeleteView,
    CompanyPhotoListCreateView,
    InterviewDetailView,
    InterviewListCreateView,
    JobApplicationListCreateView,
    JobOfferDetailView,
    JobOfferListView,
    MessageListCreateView,
    RecruiterApplicationDetailView,
    RecruiterApplicationListView,
    RecruiterCompanyView,
    RecruiterDashboardStatsView,
    RecruiterJobOfferDetailView,
    RecruiterJobOfferListCreateView,
    SavedJobDeleteView,
    SavedJobListCreateView,
)

urlpatterns = [
    # Public / candidat
    path("companies/", CompanyListView.as_view(), name="company-list"),
    path("companies/<int:pk>/", CompanyDetailView.as_view(), name="company-detail"),
    path("jobs/", JobOfferListView.as_view(), name="job-list"),
    path("jobs/<int:pk>/", JobOfferDetailView.as_view(), name="job-detail"),
    path("applications/", JobApplicationListCreateView.as_view(), name="application-list-create"),
    path("applications/<int:application_id>/messages/", MessageListCreateView.as_view(), name="application-messages"),
    path("profile/", CandidateProfileDetailView.as_view(), name="candidate-profile"),
    path("saved-jobs/", SavedJobListCreateView.as_view(), name="saved-job-list-create"),
    path("saved-jobs/<int:job_offer_id>/", SavedJobDeleteView.as_view(), name="saved-job-delete"),
    path("applications/decision/<str:token>/", ApplicationDecisionView.as_view(), name="application-decision"),

    # Recruteur
    path("recruiter/company/", RecruiterCompanyView.as_view(), name="recruiter-company"),
    path("recruiter/company/photos/", CompanyPhotoListCreateView.as_view(), name="recruiter-company-photo-list-create"),
    path("recruiter/company/photos/<int:pk>/", CompanyPhotoDeleteView.as_view(), name="recruiter-company-photo-delete"),
    path("recruiter/jobs/", RecruiterJobOfferListCreateView.as_view(), name="recruiter-job-list-create"),
    path("recruiter/jobs/<int:pk>/", RecruiterJobOfferDetailView.as_view(), name="recruiter-job-detail"),
    path("recruiter/applications/", RecruiterApplicationListView.as_view(), name="recruiter-application-list"),
    path("recruiter/applications/<int:pk>/", RecruiterApplicationDetailView.as_view(), name="recruiter-application-detail"),
    path("recruiter/interviews/", InterviewListCreateView.as_view(), name="interview-list-create"),
    path("recruiter/interviews/<int:pk>/", InterviewDetailView.as_view(), name="interview-detail"),
    path("recruiter/stats/", RecruiterDashboardStatsView.as_view(), name="recruiter-stats"),

    # Administration plateforme
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("admin/companies/", AdminCompanyListView.as_view(), name="admin-company-list"),
    path("admin/companies/<int:pk>/", AdminCompanyDetailView.as_view(), name="admin-company-detail"),
    path("admin/jobs/", AdminJobOfferListView.as_view(), name="admin-job-list"),
    path("admin/jobs/<int:pk>/", AdminJobOfferDetailView.as_view(), name="admin-job-detail"),
]
