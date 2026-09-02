import logging

from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

DECISION_STATUSES = {"hired", "declined"}
DECISION_TOKEN_SALT = "application-decision"
DECISION_TOKEN_MAX_AGE = 60 * 60 * 24 * 14  # 14 jours

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
from .permissions import IsRecruiter, IsRecruiterOfCompany, get_recruiter_company
from .serializers import (
    CandidateProfileSerializer,
    CompanyPhotoSerializer,
    CompanySerializer,
    InterviewSerializer,
    JobApplicationSerializer,
    JobOfferSerializer,
    MessageSerializer,
    RecruiterApplicationSerializer,
    SavedJobSerializer,
)


# ---------------------------------------------------------------------------
# Public / candidat
# ---------------------------------------------------------------------------

class CompanyListView(generics.ListAPIView):
    queryset = Company.objects.filter(is_active=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]


class CompanyDetailView(generics.RetrieveAPIView):
    queryset = Company.objects.filter(is_active=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]


class JobOfferListView(generics.ListAPIView):
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = JobOffer.objects.select_related("company").filter(status="published")
        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset


class JobOfferDetailView(generics.RetrieveAPIView):
    queryset = JobOffer.objects.select_related("company")
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        obj = super().get_object()
        if obj.status != "published":
            company = get_recruiter_company(self.request.user)
            if not company or obj.company_id != company.id:
                raise NotFound()
        return obj


class JobApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.select_related("job_offer", "candidate").filter(
            candidate=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)


class CandidateProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile


class SavedJobListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.select_related("job_offer__company").filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedJobDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedJobSerializer

    def get_object(self):
        return get_object_or_404(
            SavedJob, user=self.request.user, job_offer_id=self.kwargs["job_offer_id"]
        )


# ---------------------------------------------------------------------------
# Recruteur
# ---------------------------------------------------------------------------

class RecruiterCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        company = get_recruiter_company(request.user)
        if not company:
            return Response({"detail": "Aucune entreprise associée."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CompanySerializer(company, context={"request": request}).data)

    def post(self, request):
        if get_recruiter_company(request.user):
            return Response(
                {"error": "Une entreprise est déjà associée à ce compte."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save(created_by=request.user)
        RecruiterProfile.objects.create(user=request.user, company=company)
        return Response(
            CompanySerializer(company, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def put(self, request):
        company = get_recruiter_company(request.user)
        if not company:
            return Response({"detail": "Aucune entreprise associée."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CompanyPhotoListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanyPhotoSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        company = get_recruiter_company(self.request.user)
        if not company:
            return CompanyPhoto.objects.none()
        return CompanyPhoto.objects.filter(company=company)

    def perform_create(self, serializer):
        company = get_recruiter_company(self.request.user)
        if not company:
            raise PermissionDenied("Configurez d'abord le profil de votre entreprise.")
        serializer.save(company=company)


class CompanyPhotoDeleteView(generics.DestroyAPIView):
    serializer_class = CompanyPhotoSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterOfCompany]
    queryset = CompanyPhoto.objects.all()


class RecruiterJobOfferListCreateView(generics.ListCreateAPIView):
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        company = get_recruiter_company(self.request.user)
        if not company:
            return JobOffer.objects.none()
        return JobOffer.objects.select_related("company").filter(company=company)

    def perform_create(self, serializer):
        company = get_recruiter_company(self.request.user)
        if not company:
            raise PermissionDenied("Configurez d'abord le profil de votre entreprise.")
        instance = serializer.save(company=company, created_by=self.request.user)
        if instance.status == "published" and not instance.published_at:
            instance.published_at = timezone.now()
            instance.save(update_fields=["published_at"])


class RecruiterJobOfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterOfCompany]
    queryset = JobOffer.objects.select_related("company")

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        instance = serializer.save()
        if instance.status == "published" and previous_status != "published" and not instance.published_at:
            instance.published_at = timezone.now()
            instance.save(update_fields=["published_at"])


class RecruiterApplicationListView(generics.ListAPIView):
    serializer_class = RecruiterApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        company = get_recruiter_company(self.request.user)
        if not company:
            return JobApplication.objects.none()
        queryset = JobApplication.objects.select_related("job_offer", "candidate").filter(
            job_offer__company=company
        )
        job_offer_id = self.request.query_params.get("job_offer")
        if job_offer_id:
            queryset = queryset.filter(job_offer_id=job_offer_id)
        return queryset


def _send_decision_email(application):
    token = signing.dumps(application.id, salt=DECISION_TOKEN_SALT)
    link = f"{settings.FRONTEND_URL}/candidatures/decision/{token}"

    try:
        send_mail(
            subject=f"Mise à jour de votre candidature - {application.job_offer.title}",
            message=(
                f"Bonjour {application.candidate.first_name or application.candidate.username},\n\n"
                f"Le statut de votre candidature pour le poste \"{application.job_offer.title}\" "
                f"chez {application.job_offer.company.name} a été mis à jour.\n\n"
                f"Consultez la décision ici : {link}\n\n"
                "Ce lien reste valable 14 jours."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.candidate.email],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Echec d'envoi de l'email de decision de candidature")


class RecruiterApplicationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RecruiterApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterOfCompany]
    queryset = JobApplication.objects.select_related("job_offer", "candidate", "job_offer__company")

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        instance = serializer.save()
        if instance.status in DECISION_STATUSES and instance.status != previous_status:
            _send_decision_email(instance)


class ApplicationDecisionView(APIView):
    """Vue publique consultee via le lien envoye par email (protegee par la signature du token)."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            application_id = signing.loads(
                token, salt=DECISION_TOKEN_SALT, max_age=DECISION_TOKEN_MAX_AGE
            )
        except signing.SignatureExpired:
            return Response({"error": "Ce lien a expiré."}, status=status.HTTP_400_BAD_REQUEST)
        except signing.BadSignature:
            return Response({"error": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)

        application = get_object_or_404(
            JobApplication.objects.select_related("job_offer", "job_offer__company", "candidate"),
            pk=application_id,
        )

        return Response(
            {
                "status": application.status,
                "job_offer_title": application.job_offer.title,
                "company_name": application.job_offer.company.name,
                "candidate_first_name": application.candidate.first_name or application.candidate.username,
            }
        )


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_application(self):
        application = get_object_or_404(
            JobApplication.objects.select_related("job_offer", "candidate"),
            pk=self.kwargs["application_id"],
        )
        user = self.request.user
        company = get_recruiter_company(user)
        is_recruiter_owner = company is not None and application.job_offer.company_id == company.id
        is_candidate_owner = application.candidate_id == user.id
        if not (is_recruiter_owner or is_candidate_owner):
            raise PermissionDenied("Accès refusé à cette conversation.")
        return application

    def get_queryset(self):
        application = self.get_application()
        return Message.objects.filter(job_application=application).select_related("sender")

    def perform_create(self, serializer):
        application = self.get_application()
        serializer.save(job_application=application, sender=self.request.user)


class InterviewListCreateView(generics.ListCreateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        company = get_recruiter_company(user)
        if company:
            return Interview.objects.select_related(
                "job_application__job_offer", "job_application__candidate"
            ).filter(job_application__job_offer__company=company)
        return Interview.objects.select_related("job_application__job_offer").filter(
            job_application__candidate=user
        )

    def perform_create(self, serializer):
        company = get_recruiter_company(self.request.user)
        if not company:
            raise PermissionDenied("Réservé aux recruteurs.")
        job_application = serializer.validated_data.get("job_application")
        if job_application.job_offer.company_id != company.id:
            raise PermissionDenied("Cette candidature n'appartient pas à votre entreprise.")
        serializer.save()


class InterviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiter, IsRecruiterOfCompany]
    queryset = Interview.objects.select_related("job_application__job_offer", "job_application__candidate")


class RecruiterDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiter]

    def get(self, request):
        company = get_recruiter_company(request.user)
        if not company:
            return Response(
                {
                    "has_company": False,
                    "published_jobs": 0,
                    "draft_jobs": 0,
                    "total_applications": 0,
                    "applications_today": 0,
                    "upcoming_interviews": 0,
                    "unread_messages": 0,
                }
            )

        jobs_qs = JobOffer.objects.filter(company=company)
        applications_qs = JobApplication.objects.filter(job_offer__company=company)
        interviews_qs = Interview.objects.filter(job_application__job_offer__company=company)
        messages_qs = Message.objects.filter(job_application__job_offer__company=company)

        return Response(
            {
                "has_company": True,
                "published_jobs": jobs_qs.filter(status="published").count(),
                "draft_jobs": jobs_qs.filter(status="draft").count(),
                "total_applications": applications_qs.count(),
                "applications_today": applications_qs.filter(
                    created_at__date=timezone.now().date()
                ).count(),
                "upcoming_interviews": interviews_qs.filter(
                    scheduled_at__gte=timezone.now(), status__in=["scheduled", "confirmed"]
                ).count(),
                "unread_messages": messages_qs.filter(read=False).exclude(sender=request.user).count(),
            }
        )
