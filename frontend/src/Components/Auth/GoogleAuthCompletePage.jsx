import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaSpinner } from "react-icons/fa6";

import { useAuth } from "../../context/useAuth";
import { apiGetJSON } from "../../lib/api";

const HOME_BY_ROLE = { admin: "/console/app", recruteur: "/recruteur/app", candidat: "/dashboard" };

const ERROR_MESSAGES = {
  access_denied: "Vous avez annulé la connexion avec Google.",
  state_invalide: "La demande a expiré, réessayez.",
  requete_invalide: "Réponse Google incomplète, réessayez.",
  echec_google: "Impossible de contacter Google. Réessayez dans un instant.",
  email_manquant: "Votre compte Google ne fournit pas d'adresse email.",
  email_non_verifie: "Google indique que cette adresse email n'est pas vérifiée.",
  non_configure: "La connexion Google n'est pas encore configurée sur ce site.",
};

// Point d'atterrissage apres la redirection navigateur renvoyee par
// accounts/views.py GoogleCallbackView. La session (cookie) est deja creee
// cote backend a ce stade : il suffit de recuperer le profil et de le
// propager dans le contexte d'auth frontend (localStorage + state React).
export default function GoogleAuthCompletePage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(searchParams.get("error") || "");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (error || ranOnce.current) return;
    ranOnce.current = true;

    const finish = async () => {
      try {
        const user = await apiGetJSON("/api/accounts/profile/");
        login(user, HOME_BY_ROLE[user.role] || "/dashboard");
      } catch {
        setError("echec_google");
      }
    };

    finish();
  }, [error, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 font-poppins">
      <div className="bg-white dark:bg-slate-900 shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Connexion impossible</h1>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              {ERROR_MESSAGES[error] || "Une erreur est survenue."}
            </p>
            <Link to="/auth" className="text-[#2563eb] font-semibold hover:underline">
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <FaSpinner className="animate-spin text-3xl text-[#2563eb] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-slate-400">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}
