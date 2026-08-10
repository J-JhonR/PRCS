from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company, JobApplication, JobOffer
from .permissions import IsPlatformAdmin
from .serializers import AdminCompanySerializer, AdminUserSerializer, JobOfferSerializer

User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        return Response(
            {
                "total_users": User.objects.count(),
                "candidates": User.objects.filter(role="candidat").count(),
                "recruiters": User.objects.filter(role="recruteur").count(),
                "admins": User.objects.filter(role="admin").count(),
                "suspended_users": User.objects.filter(is_active=False).count(),
                "companies_active": Company.objects.filter(is_active=True).count(),
                "companies_inactive": Company.objects.filter(is_active=False).count(),
                "jobs_published": JobOffer.objects.filter(status="published").count(),
                "jobs_draft": JobOffer.objects.filter(status="draft").count(),
                "jobs_closed": JobOffer.objects.filter(status="closed").count(),
                "total_applications": JobApplication.objects.count(),
            }
        )


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]

    def get_queryset(self):
        queryset = User.objects.all().order_by("-date_joined")
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(email__icontains=search)
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


class AdminCompanyListView(generics.ListAPIView):
    queryset = Company.objects.all().order_by("name")
    serializer_class = AdminCompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


class AdminCompanyDetailView(generics.RetrieveUpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = AdminCompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


class AdminJobOfferListView(generics.ListAPIView):
    queryset = JobOffer.objects.select_related("company").all().order_by("-created_at")
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]


class AdminJobOfferDetailView(generics.RetrieveUpdateAPIView):
    queryset = JobOffer.objects.select_related("company")
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformAdmin]
