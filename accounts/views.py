import logging
import random

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import PasswordResetCode, User

logger = logging.getLogger(__name__)

ALLOWED_SELF_SERVICE_ROLES = {"candidat", "recruteur"}
ALLOWED_CV_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_CV_SIZE = 5 * 1024 * 1024


class PasswordResetThrottle(AnonRateThrottle):
    scope = "password_reset"


def build_user_payload(user, request=None):
    full_name = (user.full_name or f"{user.first_name} {user.last_name}".strip() or user.username)

    def file_url(file_field):
        if not file_field:
            return None
        url = file_field.url
        return request.build_absolute_uri(url) if request else url

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": full_name,
        "company_name": user.company_name,
        "cv": file_url(user.cv),
        "photo_profil": file_url(user.photo_profil),
    }


@method_decorator(ensure_csrf_cookie, name="get")
class CsrfCookieView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Le cookie csrftoken pose par Django appartient au domaine du backend
        # (onrender.com) : en cross-domaine, le JS du frontend (vercel.app) ne
        # peut pas le lire via document.cookie. On renvoie donc le jeton dans
        # le corps JSON, que le frontend peut lire et renvoyer explicitement
        # dans l'en-tete X-CSRFToken.
        token = get_token(request)
        return Response({"detail": "CSRF cookie set", "csrfToken": token}, status=status.HTTP_200_OK)


class RegisterView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        data = request.data

        try:
            email = (data.get("email") or "").strip().lower()
            password = data.get("password")

            if not email or not password:
                return Response(
                    {"error": "Email et mot de passe obligatoires"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Un compte existe deja avec cet email"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                validate_password(password)
            except DjangoValidationError as exc:
                return Response({"error": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

            role = data.get("role", "candidat")
            if role not in ALLOWED_SELF_SERVICE_ROLES:
                return Response({"error": "Role invalide"}, status=status.HTTP_400_BAD_REQUEST)

            full_name = (data.get("full_name") or "").strip()
            first_name = (data.get("first_name") or "").strip()
            last_name = (data.get("last_name") or "").strip()

            if full_name and not first_name and not last_name:
                name_parts = full_name.split(" ", 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ""
            elif not full_name:
                full_name = f"{first_name} {last_name}".strip()

            photo = request.FILES.get("photo_profil")
            if photo:
                if not photo.content_type.startswith("image/"):
                    return Response(
                        {"error": "La photo de profil doit etre une image"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if photo.size > 2 * 1024 * 1024:
                    return Response(
                        {"error": "La photo de profil ne doit pas depasser 2 MB"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            cv = request.FILES.get("cv")
            if cv:
                if cv.content_type not in ALLOWED_CV_CONTENT_TYPES:
                    return Response(
                        {"error": "Le CV doit etre un PDF ou un document Word"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if cv.size > MAX_CV_SIZE:
                    return Response(
                        {"error": "Le CV ne doit pas depasser 5 MB"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            user = User.objects.create_user(
                username=data.get("username") or email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name or None,
                role=role,
                photo_profil=photo,
                cv=cv,
            )

            login(request, user)
            return Response(
                {
                    "message": "Utilisateur cree avec succes",
                    "user": build_user_payload(user, request),
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            logger.exception("Echec de creation de compte")
            return Response(
                {"error": "Impossible de creer le compte. Reessayez plus tard."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email et mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"error": "Identifiants invalides"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user)
        return Response(
            {
                "message": "Connexion reussie",
                "user": build_user_payload(user, request),
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Deconnecte avec succes"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    GENERIC_RESPONSE = {
        "message": "Si un compte existe avec cet email, un code de reinitialisation a ete envoye.",
    }

    def post(self, request):
        identifier = (request.data.get("identifier") or request.data.get("email") or "").strip().lower()

        if not identifier:
            return Response({"error": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first()
        if user:
            otp = str(random.randint(100000, 999999))
            PasswordResetCode.objects.filter(user=user).delete()
            PasswordResetCode.objects.create(user=user, code=otp)

            try:
                send_mail(
                    subject="Votre code de reinitialisation PRCS",
                    message=f"Votre code de reinitialisation est : {otp}\nIl expire dans 15 minutes.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception:
                logger.exception("Echec d'envoi de l'email de reinitialisation")

        return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)


class PasswordResetVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        otp = (request.data.get("otp") or "").strip()

        if not email or not otp:
            return Response(
                {"error": "Email et code requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        reset_code = (
            PasswordResetCode.objects.filter(user=user).order_by("-created_at").first()
            if user
            else None
        )
        if user and reset_code and not reset_code.is_expired() and reset_code.code == otp:
            return Response({"message": "OTP valide"}, status=status.HTTP_200_OK)

        return Response({"error": "OTP invalide"}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        code = (request.data.get("code") or "").strip()
        new_password = request.data.get("new_password")

        if not email or not code or not new_password:
            return Response(
                {"error": "Email, code et nouveau mot de passe requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        reset_code = (
            PasswordResetCode.objects.filter(user=user).order_by("-created_at").first()
            if user
            else None
        )
        if not user or not reset_code or reset_code.is_expired() or reset_code.code != code:
            return Response(
                {"error": "Code invalide ou expire"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            return Response({"error": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        PasswordResetCode.objects.filter(user=user).delete()

        return Response({"message": "Mot de passe reinitialise"}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(build_user_payload(request.user, request), status=status.HTTP_200_OK)
