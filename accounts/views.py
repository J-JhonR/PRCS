import json
import logging
import secrets
import urllib.error
import urllib.parse
import urllib.request

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core import signing
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.middleware.csrf import get_token
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .models import PasswordResetCode, User

GOOGLE_OAUTH_SALT = "google-oauth-state"
GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

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


def generate_otp():
    # secrets (CSPRNG) plutot que random (PRNG previsible, impropre a un
    # usage de securite) : un OTP genere avec `random` peut etre devine en
    # observant d'autres tirages du meme generateur.
    return f"{secrets.randbelow(1_000_000):06d}"


def send_verification_code(user):
    PasswordResetCode.objects.filter(
        user=user, purpose=PasswordResetCode.PURPOSE_EMAIL_VERIFICATION
    ).delete()
    otp = generate_otp()
    PasswordResetCode.objects.create(
        user=user, code=otp, purpose=PasswordResetCode.PURPOSE_EMAIL_VERIFICATION
    )
    try:
        send_mail(
            subject="Vérifiez votre adresse email - PRCS",
            message=f"Votre code de vérification est : {otp}\nIl expire dans 15 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Echec d'envoi de l'email de verification")


def is_verification_exempt(user):
    # Comptes crees hors auto-inscription (createsuperuser, admin Django) :
    # jamais passes par le flux d'inscription, donc pas de code a verifier.
    return user.is_superuser or user.role == "admin"


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
                    {"error": "Un compte existe déjà avec cet email"},
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
                        {"error": "La photo de profil doit être une image"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if photo.size > 2 * 1024 * 1024:
                    return Response(
                        {"error": "La photo de profil ne doit pas dépasser 2 MB"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            cv = request.FILES.get("cv")
            if cv:
                if cv.content_type not in ALLOWED_CV_CONTENT_TYPES:
                    return Response(
                        {"error": "Le CV doit être un PDF ou un document Word"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if cv.size > MAX_CV_SIZE:
                    return Response(
                        {"error": "Le CV ne doit pas dépasser 5 MB"},
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

            send_verification_code(user)
            return Response(
                {
                    "message": "Compte créé. Vérifiez votre email pour activer votre compte.",
                    "email": user.email,
                    "requires_verification": True,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            logger.exception("Echec de creation de compte")
            return Response(
                {"error": "Impossible de créer le compte. Réessayez plus tard."},
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

        if not user.email_verified and not is_verification_exempt(user):
            return Response(
                {
                    "error": "Vérifiez votre email avant de vous connecter.",
                    "requires_verification": True,
                    "email": user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        login(request, user)
        return Response(
            {
                "message": "Connexion réussie",
                "user": build_user_payload(user, request),
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Déconnecté avec succès"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    GENERIC_RESPONSE = {
        "message": "Si un compte existe avec cet email, un code de réinitialisation a été envoyé.",
    }

    def post(self, request):
        identifier = (request.data.get("identifier") or request.data.get("email") or "").strip().lower()

        if not identifier:
            return Response({"error": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first()
        if user:
            otp = generate_otp()
            PasswordResetCode.objects.filter(
                user=user, purpose=PasswordResetCode.PURPOSE_PASSWORD_RESET
            ).delete()
            PasswordResetCode.objects.create(
                user=user, code=otp, purpose=PasswordResetCode.PURPOSE_PASSWORD_RESET
            )

            try:
                send_mail(
                    subject="Votre code de réinitialisation PRCS",
                    message=f"Votre code de réinitialisation est : {otp}\nIl expire dans 15 minutes.",
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
            PasswordResetCode.objects.filter(
                user=user, purpose=PasswordResetCode.PURPOSE_PASSWORD_RESET
            ).order_by("-created_at").first()
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
            PasswordResetCode.objects.filter(
                user=user, purpose=PasswordResetCode.PURPOSE_PASSWORD_RESET
            ).order_by("-created_at").first()
            if user
            else None
        )
        if not user or not reset_code or reset_code.is_expired() or reset_code.code != code:
            return Response(
                {"error": "Code invalide ou expiré"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as exc:
            return Response({"error": " ".join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        PasswordResetCode.objects.filter(
            user=user, purpose=PasswordResetCode.PURPOSE_PASSWORD_RESET
        ).delete()

        return Response({"message": "Mot de passe réinitialisé"}, status=status.HTTP_200_OK)


class EmailVerificationRequestView(APIView):
    """Renvoie un nouveau code de verification (ex: code expire, email non recu)."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    GENERIC_RESPONSE = {
        "message": "Si un compte existe et n'est pas encore vérifié, un code a été envoyé.",
    }

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"error": "Email requis"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if user and not user.email_verified and not is_verification_exempt(user):
            send_verification_code(user)

        return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)


class EmailVerificationConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        code = (request.data.get("code") or "").strip()

        if not email or not code:
            return Response(
                {"error": "Email et code requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        verification_code = (
            PasswordResetCode.objects.filter(
                user=user, purpose=PasswordResetCode.PURPOSE_EMAIL_VERIFICATION
            ).order_by("-created_at").first()
            if user
            else None
        )
        if (
            not user
            or not verification_code
            or verification_code.is_expired()
            or verification_code.code != code
        ):
            return Response(
                {"error": "Code invalide ou expiré"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email_verified = True
        user.save(update_fields=["email_verified"])
        PasswordResetCode.objects.filter(
            user=user, purpose=PasswordResetCode.PURPOSE_EMAIL_VERIFICATION
        ).delete()

        login(request, user)
        return Response(
            {
                "message": "Email vérifié",
                "user": build_user_payload(user, request),
            },
            status=status.HTTP_200_OK,
        )


class GoogleLoginRedirectView(APIView):
    """Demarre le flux OAuth : redirige le navigateur vers l'ecran Google."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        role = request.GET.get("role", "candidat")
        if role not in ALLOWED_SELF_SERVICE_ROLES:
            role = "candidat"

        if not settings.GOOGLE_CLIENT_ID:
            logger.error("GOOGLE_CLIENT_ID absent : connexion Google non configuree")
            return redirect(f"{settings.FRONTEND_URL}/auth/google/complete?error=non_configure")

        # Le state signe protege contre le CSRF (un attaquant ne peut pas
        # forger une requete de callback valide) et transporte le role choisi
        # (candidat/recruteur) a travers l'aller-retour chez Google, sans
        # avoir besoin de stocker quoi que ce soit cote serveur.
        state = signing.dumps({"role": role, "n": secrets.token_urlsafe(16)}, salt=GOOGLE_OAUTH_SALT)

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
        return redirect(f"{GOOGLE_AUTHORIZE_URL}?{urllib.parse.urlencode(params)}")


class GoogleCallbackView(APIView):
    """Point de retour de Google : echange le code, cree/connecte le compte."""

    permission_classes = [permissions.AllowAny]

    def _error_redirect(self, reason):
        return redirect(f"{settings.FRONTEND_URL}/auth/google/complete?error={reason}")

    def get(self, request):
        if request.GET.get("error"):
            # L'utilisateur a refuse l'acces sur l'ecran de consentement Google.
            return self._error_redirect("access_denied")

        code = request.GET.get("code")
        state = request.GET.get("state")
        if not code or not state:
            return self._error_redirect("requete_invalide")

        try:
            payload = signing.loads(state, salt=GOOGLE_OAUTH_SALT, max_age=600)
        except signing.BadSignature:
            return self._error_redirect("state_invalide")

        role = payload.get("role")
        if role not in ALLOWED_SELF_SERVICE_ROLES:
            role = "candidat"

        try:
            token_body = urllib.parse.urlencode(
                {
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
                    "grant_type": "authorization_code",
                }
            ).encode()
            token_req = urllib.request.Request(GOOGLE_TOKEN_URL, data=token_body, method="POST")
            with urllib.request.urlopen(token_req, timeout=10) as resp:
                token_data = json.loads(resp.read().decode())

            access_token = token_data.get("access_token")
            if not access_token:
                raise ValueError("Reponse Google sans access_token")

            profile_req = urllib.request.Request(
                GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}
            )
            with urllib.request.urlopen(profile_req, timeout=10) as resp:
                profile = json.loads(resp.read().decode())
        except (urllib.error.URLError, ValueError, json.JSONDecodeError):
            logger.exception("Echec de l'echange OAuth Google")
            return self._error_redirect("echec_google")

        email = (profile.get("email") or "").strip().lower()
        if not email:
            return self._error_redirect("email_manquant")

        google_email_verified = bool(profile.get("email_verified"))

        user = User.objects.filter(email=email).first()
        if user is None:
            first_name = profile.get("given_name") or ""
            last_name = profile.get("family_name") or ""
            full_name = profile.get("name") or f"{first_name} {last_name}".strip()
            user = User(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name or None,
                role=role,
                email_verified=google_email_verified,
            )
            user.set_unusable_password()
            user.save()
        else:
            if google_email_verified and not user.email_verified:
                # Compte deja existant (inscrit par email/mdp) : Google vient
                # de reconfirmer la propriete de cette adresse.
                user.email_verified = True
                user.save(update_fields=["email_verified"])

            if user.role != role and not is_verification_exempt(user):
                # Ce compte Google existe deja avec un autre role (ex: cree
                # via l'espace recruteur, mais tente ici depuis l'espace
                # candidat). Les comptes candidat/recruteur sont volontairement
                # separes : on refuse plutot que de connecter silencieusement
                # la personne au mauvais espace.
                return redirect(
                    f"{settings.FRONTEND_URL}/auth/google/complete"
                    f"?error=role_mismatch&actual_role={user.role}"
                )

        if not user.email_verified and not is_verification_exempt(user):
            return self._error_redirect("email_non_verifie")

        login(request, user)
        return redirect(f"{settings.FRONTEND_URL}/auth/google/complete?role={user.role}")


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(build_user_payload(request.user, request), status=status.HTTP_200_OK)
