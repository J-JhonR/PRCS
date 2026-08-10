from django.db.models import Q
from rest_framework import permissions, viewsets

from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD des projets du portfolio.

    Lecture publique (liste/detail), ecriture reservee aux utilisateurs connectes.

    Parametres de requete supportes sur la liste:
    - ?skill=react       -> filtre les projets ayant cette competence (nom exact, insensible a la casse)
    - ?search=dashboard  -> recherche dans le titre, la description et le nom du candidat
    """

    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Project.objects.select_related("candidate").prefetch_related("skills")

        skill = self.request.query_params.get("skill")
        if skill:
            queryset = queryset.filter(skills__name__iexact=skill)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(candidate__name__icontains=search)
            )

        return queryset.distinct()
