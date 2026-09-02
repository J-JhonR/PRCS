import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBuilding, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { useAuth } from "../../../context/useAuth";
import { apiJSON } from "../../../lib/api";

const HOME_BY_ROLE = { admin: "/console/app", recruteur: "/recruteur/app", candidat: "/dashboard" };

export default function RecruiterLoginPage() {
  const { isLoggedIn, user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(location.state?.from || HOME_BY_ROLE[user?.role] || "/recruteur/app", { replace: true });
    }
  }, [isLoggedIn, user, navigate, location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      const data = await apiJSON("/api/accounts/login/", { method: "POST", body: form });
      login(data.user, location.state?.from || HOME_BY_ROLE[data.user?.role] || "/recruteur/app");
    } catch (err) {
      if (err.data?.requires_verification) {
        setVerifyEmail(err.data.email || form.email);
        setError("Votre email n'est pas encore vérifié. Entrez le code reçu ou demandez-en un nouveau.");
        return;
      }
      setError(err.message || "Email ou mot de passe invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    if (!verifyCode.trim()) {
      setError("Entrez le code reçu par email.");
      return;
    }
    try {
      setVerifyLoading(true);
      setError("");
      const data = await apiJSON("/api/accounts/verify-email-confirm/", {
        method: "POST",
        body: { email: verifyEmail, code: verifyCode.trim() },
      });
      login(data.user, "/recruteur/app");
    } catch (err) {
      setError(err.message || "Code invalide ou expiré.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      setVerifyLoading(true);
      await apiJSON("/api/accounts/verify-email-request/", { method: "POST", body: { email: verifyEmail } });
      setError("");
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Impossible d'envoyer le code.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleForgotRequest = async () => {
    if (!forgotEmail) return;
    try {
      setForgotStatus("loading");
      await apiJSON("/api/accounts/password-reset-request/", { method: "POST", body: { email: forgotEmail } });
      setForgotStatus("idle");
      setForgotStep("confirm");
    } catch {
      setForgotStatus("error");
    }
  };

  const handleForgotConfirm = async () => {
    if (!otpCode || newPassword.length < 8) return;
    try {
      setForgotStatus("loading");
      await apiJSON("/api/accounts/password-reset-confirm/", {
        method: "POST",
        body: { email: forgotEmail, code: otpCode, new_password: newPassword },
      });
      setForgotStatus("done");
    } catch (err) {
      setForgotStatus(err.message || "error");
    }
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotStep("request");
    setForgotStatus("");
    setForgotEmail("");
    setOtpCode("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-slate-950 relative overflow-hidden font-poppins">
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-blue-50 dark:bg-slate-900">
        <img src="/logo.png" alt="logo" className="w-32 mb-4" />
        <h1 className="text-4xl font-semibold text-blue-800 dark:text-blue-300 mb-2">Espace employeur</h1>
        <p className="text-gray-700 dark:text-slate-400 text-center max-w-md">
          Publiez vos offres, suivez vos candidatures et recrutez les meilleurs talents.
        </p>
        <p className="mt-8 text-sm text-gray-500 dark:text-slate-500">
          Vous cherchez un emploi ?{" "}
          <Link to="/auth" className="font-semibold text-blue-700 dark:text-blue-400 hover:underline">
            Espace candidat
          </Link>
        </p>
      </div>

      <div className="flex flex-1 justify-center items-center p-6">
        <div className="bg-white dark:bg-slate-900 shadow-lg rounded-2xl p-8 w-full max-w-md">
          {verifyEmail ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
                Vérifiez votre email
              </h2>
              <p className="text-center text-gray-600 dark:text-slate-400 mb-6">
                Code envoyé à <span className="font-semibold text-gray-800 dark:text-white">{verifyEmail}</span>
              </p>

              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Code à 6 chiffres"
                  value={verifyCode}
                  onChange={(event) => setVerifyCode(event.target.value)}
                  className="w-full text-center tracking-[0.5em] text-lg border rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#2563eb] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={verifyLoading}
                  className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-semibold hover:bg-[#1741a6] transition disabled:opacity-70"
                >
                  {verifyLoading ? "Vérification..." : "Valider le code"}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6 text-sm">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={verifyLoading || resendCooldown > 0}
                  className="text-[#2563eb] hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerifyEmail("");
                    setVerifyCode("");
                    setError("");
                  }}
                  className="text-gray-500 hover:underline"
                >
                  Retour
                </button>
              </div>
            </>
          ) : (
          <>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
            Connexion recruteur
          </h2>
          <p className="text-center text-gray-600 dark:text-slate-400 mb-6">
            Pas encore de compte entreprise ?{" "}
            <Link to="/recruteur/inscription" className="text-[#2563eb] underline">
              Créez-en un
            </Link>
          </p>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <MdEmail className="absolute top-3 left-3 text-gray-400" />
              <input
                name="email"
                type="email"
                placeholder="Email professionnel"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                required
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-gray-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>

            <div className="text-right text-sm">
              <button type="button" onClick={() => setForgotOpen(true)} className="text-[#2563eb] hover:underline">
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-semibold hover:bg-[#1741a6] transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-slate-800 p-4 text-sm text-gray-700 dark:text-slate-300">
            <FaBuilding className="shrink-0 text-blue-700 dark:text-blue-400" />
            <p>Réservé aux entreprises et recruteurs enregistrés sur PRCS.</p>
          </div>
          </>
          )}
        </div>
      </div>

      {forgotOpen && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            {forgotStatus === "done" ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Mot de passe mis à jour</h2>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-4">Vous pouvez maintenant vous connecter.</p>
                <button onClick={closeForgot} className="w-full bg-[#2563eb] text-white py-2 rounded-lg hover:bg-[#1741a6]">
                  Fermer
                </button>
              </>
            ) : forgotStep === "request" ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Réinitialiser le mot de passe</h2>
                <input
                  type="email"
                  placeholder="Votre email professionnel"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  className="w-full border px-3 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-[#2563eb] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleForgotRequest}
                    disabled={forgotStatus === "loading"}
                    className="flex-1 bg-[#2563eb] text-white py-2 rounded-lg hover:bg-[#1741a6]"
                  >
                    {forgotStatus === "loading" ? "Envoi..." : "Envoyer le code"}
                  </button>
                  <button onClick={closeForgot} className="flex-1 bg-gray-200 dark:bg-slate-700 dark:text-white py-2 rounded-lg hover:bg-gray-300">
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Entrez le code reçu</h2>
                <div className="space-y-3 mb-4">
                  <input
                    placeholder="Code à 6 chiffres"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-[#2563eb] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-[#2563eb] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                {forgotStatus && forgotStatus !== "idle" && forgotStatus !== "loading" && (
                  <p className="text-sm text-red-600 mb-2">{forgotStatus}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleForgotConfirm}
                    disabled={forgotStatus === "loading"}
                    className="flex-1 bg-[#2563eb] text-white py-2 rounded-lg hover:bg-[#1741a6]"
                  >
                    {forgotStatus === "loading" ? "Validation..." : "Valider"}
                  </button>
                  <button onClick={closeForgot} className="flex-1 bg-gray-200 dark:bg-slate-700 dark:text-white py-2 rounded-lg hover:bg-gray-300">
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
