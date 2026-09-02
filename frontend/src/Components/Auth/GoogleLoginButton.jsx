import { API_ORIGIN } from "../../lib/api";

// Icone officielle "G" multicolore (SVG inline, pas de dependance externe).
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.9-3.5z"
      />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12.5 24 12.5c3.1 0 5.8 1.1 8 3l6-6C34.5 5.5 29.6 3.5 24 3.5c-7.4 0-13.8 4.1-17.1 10.2z" />
      <path
        fill="#4CAF50"
        d="M24 44.5c5.5 0 10.4-1.9 14.1-5.1l-6.5-5.5c-2.1 1.5-4.7 2.4-7.6 2.4-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.9 39.7 16.4 44.5 24 44.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5C41.5 35.9 44.5 30.4 44.5 24c0-1.2-.1-2.4-.9-3.5z"
      />
    </svg>
  );
}

// Redirige le navigateur (navigation complete, pas un fetch) vers l'ecran de
// consentement Google. role="candidat" ou "recruteur" est transporte via le
// state signe cote backend (voir accounts/views.py GoogleLoginRedirectView).
export default function GoogleLoginButton({ role = "candidat", label = "Continuer avec Google" }) {
  const href = `${API_ORIGIN}/api/accounts/google/login/?role=${encodeURIComponent(role)}`;

  return (
    <a
      href={href}
      className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
    >
      <GoogleIcon />
      {label}
    </a>
  );
}
