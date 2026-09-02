from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ("candidat", "Candidat"),
        ("recruteur", "Recruteur"),
        ("admin", "Administrateur"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="candidat")

    # Recruteur : entreprise OU personne
    is_company = models.BooleanField(default=False)
    company_name = models.CharField(max_length=150, blank=True, null=True)
    full_name = models.CharField(max_length=150, blank=True, null=True)

    # Candidat : CV optionnel
    cv = models.FileField(upload_to="cvs/", blank=True, null=True)

    # Tous : photo de profil
    photo_profil = models.ImageField(upload_to="profiles/", blank=True, null=True)

    # Email verifie par OTP a l'inscription (voir OtpCode ci-dessous).
    # Les comptes crees hors auto-inscription (createsuperuser, admin Django)
    # sont exemptes de cette verification, voir LoginView.
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        if self.role == "recruteur":
            return self.company_name or self.full_name or self.username
        return f"{self.username} ({self.role})"


# 🔑 Modèle pour stocker les OTP (mot de passe oublié, vérification email, etc.)
class PasswordResetCode(models.Model):
    PURPOSE_PASSWORD_RESET = "password_reset"
    PURPOSE_EMAIL_VERIFICATION = "email_verification"
    PURPOSE_CHOICES = [
        (PURPOSE_PASSWORD_RESET, "Réinitialisation mot de passe"),
        (PURPOSE_EMAIL_VERIFICATION, "Vérification email"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_codes")
    code = models.CharField(max_length=6)  # ex: "123456"
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default=PURPOSE_PASSWORD_RESET)
    created_at = models.DateTimeField(default=timezone.now)

    def is_expired(self):
        """Vérifie si le code est expiré (15 minutes de validité)."""
        return (timezone.now() - self.created_at).total_seconds() > 900  # 900s = 15min

    def __str__(self):
        return f"Code {self.code} pour {self.user.username} ({self.purpose})"
