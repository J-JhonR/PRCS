from django.urls import path

from .views import (
    CsrfCookieView,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    RegisterView,
    UserProfileView,
)

urlpatterns = [
    path("csrf/", CsrfCookieView.as_view(), name="csrf"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("password-reset-request/", PasswordResetRequestView.as_view(), name="pwd_reset_request"),
    path("password-reset-verify/", PasswordResetVerifyView.as_view(), name="pwd_reset_verify"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="pwd_reset_confirm"),
]
