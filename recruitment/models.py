from django.conf import settings
from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Company(TimeStampedModel):
    EMPLOYER_TYPE_CHOICES = [
        ("individual", "Personne physique"),
        ("organization", "Institution"),
    ]
    SIZE_CHOICES = [
        ("self", "Indépendant"),
        ("1-10", "1-10"),
        ("11-50", "11-50"),
        ("51-200", "51-200"),
        ("201-500", "201-500"),
        ("500+", "500+"),
    ]

    employer_type = models.CharField(
        max_length=20,
        choices=EMPLOYER_TYPE_CHOICES,
        default="organization",
    )
    name = models.CharField(max_length=180, unique=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    sector = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    size = models.CharField(max_length=20, choices=SIZE_CHOICES, default="1-10")
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to="companies/logos/", blank=True, null=True)
    banner = models.ImageField(upload_to="companies/banners/", blank=True, null=True)
    video_url = models.URLField(
        blank=True, help_text="Lien YouTube/Vimeo de présentation de l'entreprise"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="companies_created",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "company"
            slug = base_slug
            index = 1
            while Company.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                index += 1
                slug = f"{base_slug}-{index}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class CompanyPhoto(TimeStampedModel):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="companies/photos/")
    caption = models.CharField(max_length=150, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Photo de {self.company.name}"


class CandidateProfile(TimeStampedModel):
    AVAILABILITY_CHOICES = [
        ("open", "Disponible"),
        ("interviewing", "En entretien"),
        ("closed", "Non disponible"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile",
    )
    headline = models.CharField(max_length=180, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)
    experiences = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    availability_status = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default="open",
    )
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    def __str__(self):
        return f"Profil candidat - {self.user.username}"


class RecruiterProfile(TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recruiter_profile",
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="recruiters",
    )
    job_title = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"Profil recruteur - {self.user.username}"


class JobOffer(TimeStampedModel):
    WORKPLACE_CHOICES = [
        ("remote", "Remote"),
        ("hybrid", "Hybride"),
        ("onsite", "Sur site"),
    ]
    EMPLOYMENT_CHOICES = [
        ("cdi", "CDI"),
        ("cdd", "CDD"),
        ("freelance", "Freelance"),
        ("internship", "Stage"),
    ]
    STATUS_CHOICES = [
        ("draft", "Brouillon"),
        ("published", "Publiée"),
        ("closed", "Fermée"),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="job_offers")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="job_offers_created",
    )
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    location = models.CharField(max_length=120)
    workplace_type = models.CharField(max_length=20, choices=WORKPLACE_CHOICES, default="onsite")
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES, default="cdi")
    experience_level = models.CharField(max_length=120, blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="HTG")
    description = models.TextField()
    requirements = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.company.name}-{self.title}") or "job-offer"
            slug = base_slug
            index = 1
            while JobOffer.objects.exclude(pk=self.pk).filter(slug=slug).exists():
                index += 1
                slug = f"{base_slug}-{index}"
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.company.name}"


class JobApplication(TimeStampedModel):
    STATUS_CHOICES = [
        ("received", "Reçue"),
        ("in_process", "En cours"),
        ("hired", "Acceptée"),
        ("declined", "Déclinée"),
    ]

    job_offer = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name="applications")
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    cover_letter = models.TextField(blank=True)
    cv_file = models.FileField(upload_to="applications/cvs/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received")

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["job_offer", "candidate"],
                name="unique_job_application_per_candidate",
            )
        ]

    def __str__(self):
        return f"{self.candidate.username} -> {self.job_offer.title}"


class Message(TimeStampedModel):
    job_application = models.ForeignKey(
        JobApplication, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    body = models.TextField()
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message de {self.sender.username} - candidature #{self.job_application_id}"


class Interview(TimeStampedModel):
    MODE_CHOICES = [
        ("remote", "Visio"),
        ("onsite", "Présentiel"),
    ]
    STATUS_CHOICES = [
        ("scheduled", "Planifié"),
        ("confirmed", "Confirmé"),
        ("done", "Terminé"),
        ("cancelled", "Annulé"),
    ]

    job_application = models.ForeignKey(
        JobApplication, on_delete=models.CASCADE, related_name="interviews"
    )
    scheduled_at = models.DateTimeField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="remote")
    location_or_link = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["scheduled_at"]

    def __str__(self):
        return f"Entretien {self.job_application_id} - {self.scheduled_at:%Y-%m-%d %H:%M}"


class SavedJob(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_jobs")
    job_offer = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name="saved_by")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "job_offer"], name="unique_saved_job")
        ]

    def __str__(self):
        return f"{self.user.username} saved {self.job_offer.title}"
