from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet

# Genere automatiquement les routes standard DRF:
# GET/POST   /api/portfolio/projects/
# GET/PUT/PATCH/DELETE /api/portfolio/projects/<pk>/
router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = router.urls
