from rest_framework import permissions


def get_recruiter_company(user):
    if not user or not user.is_authenticated or user.role != "recruteur":
        return None
    profile = getattr(user, "recruiter_profile", None)
    return profile.company if profile else None


class IsRecruiter(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "recruteur")


class IsPlatformAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsRecruiterOfCompany(permissions.BasePermission):
    """Object-level permission scoping recruiter access to their own company's data."""

    def has_permission(self, request, view):
        return get_recruiter_company(request.user) is not None

    def has_object_permission(self, request, view, obj):
        company = get_recruiter_company(request.user)
        if company is None:
            return False

        obj_company = resolve_object_company(obj)
        return obj_company is not None and obj_company.id == company.id


def resolve_object_company(obj):
    company = getattr(obj, "company", None)
    if company is not None:
        return company

    job_offer = getattr(obj, "job_offer", None)
    if job_offer is not None:
        return job_offer.company

    job_application = getattr(obj, "job_application", None)
    if job_application is not None:
        return job_application.job_offer.company

    return None
