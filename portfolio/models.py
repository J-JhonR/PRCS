from django.db import models


class Skill(models.Model):
    """Une competence technique ou creative (ex: React, Figma, Python)."""

    name = models.CharField(max_length=60, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Candidate(models.Model):
    """Profil d'un candidat presentant ses realisations visuelles."""

    STATUS_AVAILABLE = "available"
    STATUS_EMPLOYED = "employed"
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Disponible"),
        (STATUS_EMPLOYED, "En poste"),
    ]

    name = models.CharField(max_length=150)
    title = models.CharField(max_length=150, help_text="Role ou intitule de poste, ex: UI Designer")
    avatar = models.ImageField(upload_to="portfolio/avatars/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.title})"


class Project(models.Model):
    """Une realisation visuelle publiee par un candidat (image, case study...)."""

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="portfolio/projects/", blank=True, null=True)
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name="projects")
    skills = models.ManyToManyField(Skill, related_name="projects", blank=True)
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return f"{self.title} - {self.candidate.name}"
