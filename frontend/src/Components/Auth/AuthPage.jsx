import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaCamera, FaLock, FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../lib/api";

const API = "/api/accounts";
const REDIRECT_DELAY = 900;

export default function AuthPage() {
  const { isLoggedIn, user, login: loginUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const MotionDiv = motion.div;
  const HOME_BY_ROLE = { admin: "/console/app", recruteur: "/recruteur/app", candidat: "/dashboard" };
  const resolveRedirect = (user) =>
    location.state?.from || HOME_BY_ROLE[user?.role] || "/dashboard";

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [authStep, setAuthStep] = useState("");
  const [errors, setErrors] = useState({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");

  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [regPhotoFile, setRegPhotoFile] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(resolveRedirect(user), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, navigate]);

  const postJSON = async (url, body) => {
    const res = await apiFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.detail || "Erreur de communication");
    }
    return data;
  };

  const postForm = async (url, formData) => {
    const res = await apiFetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.detail || "Erreur de communication");
    }
    return data;
  };

  const assertBackendSession = async () => {
    const res = await apiFetch(`${API}/profile/`);

    if (!res.ok) {
      throw new Error("La session backend n'a pas ete creee. Reessayez la connexion.");
    }
  };

  const showNotice = (type, message) => {
    setNotice({ type, message });
  };

  const validateReg = (name, value) => {
    let msg = "";

    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      msg = "Email invalide.";
    }

    if (name === "password" && value.length > 0 && value.length < 6) {
      msg = "Minimum 6 caractères.";
    }

    if (name === "confirmPassword" && value !== reg.password) {
      msg = "Les mots de passe ne correspondent pas.";
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleLoginChange = (e) =>
    setLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setReg((prev) => ({ ...prev, [name]: value }));
    validateReg(name, value);
  };

  const handleRegPhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setRegPhotoFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      showNotice("error", "La photo doit etre une image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice("error", "La photo ne doit pas depasser 2 MB.");
      event.target.value = "";
      return;
    }

    setRegPhotoFile(file);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setNotice(null);
      setAuthStep("Vérification de vos identifiants...");
      const data = await postJSON(`${API}/login/`, login);
      await assertBackendSession();
      setAuthStep("Connexion sécurisée. Préparation de votre espace...");
      showNotice("success", "Connexion réussie. Redirection en cours...");
      setTimeout(() => {
        loginUser(data.user, resolveRedirect(data.user));
      }, REDIRECT_DELAY);
    } catch (err) {
      setAuthStep("");
      showNotice("error", err.message || "Email ou mot de passe invalide.");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(errors).some(Boolean)) {
      showNotice("error", "Corrigez les erreurs du formulaire.");
      return;
    }

    if (reg.password !== reg.confirmPassword) {
      showNotice("error", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      setNotice(null);
      setAuthStep("Création de votre compte...");
      const full_name = `${reg.firstName} ${reg.lastName}`.trim();
      const formData = new FormData();
      formData.append("username", reg.email);
      formData.append("email", reg.email);
      formData.append("password", reg.password);
      formData.append("first_name", reg.firstName.trim());
      formData.append("last_name", reg.lastName.trim());
      formData.append("full_name", full_name);
      formData.append("role", "candidat");
      if (regPhotoFile) {
        formData.append("photo_profil", regPhotoFile);
      }

      const data = await postForm(`${API}/register/`, formData);
      await assertBackendSession();
      setAuthStep("Compte créé. Préparation de votre espace...");
      showNotice("success", "Inscription réussie. Redirection en cours...");
      setTimeout(() => {
        loginUser(data.user, resolveRedirect(data.user));
      }, REDIRECT_DELAY);
    } catch (err) {
      setAuthStep("");
      showNotice("error", err.message || "Impossible de créer le compte.");
      setLoading(false);
    }
  };

  const handleForgotRequest = async () => {
    if (!forgotEmail) {
      showNotice("error", "Veuillez saisir votre adresse email.");
      return;
    }

    try {
      setLoading(true);
      setNotice(null);
      await postJSON(`${API}/password-reset-request/`, { email: forgotEmail });
      setForgotStep("confirm");
      showNotice("success", "Code envoyé. Vérifiez votre boîte email.");
    } catch (err) {
      showNotice("error", err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotConfirm = async () => {
    if (!otpCode || newPwd.length < 6 || newPwd !== newPwd2) {
      showNotice("error", "Vérifiez les champs saisis.");
      return;
    }

    try {
      setLoading(true);
      await postJSON(`${API}/password-reset-confirm/`, {
        email: forgotEmail,
        code: otpCode,
        new_password: newPwd,
      });
      showNotice("success", "Mot de passe réinitialisé. Vous pouvez vous connecter.");
      setForgotOpen(false);
      setForgotStep("request");
      setOtpCode("");
      setNewPwd("");
      setNewPwd2("");
    } catch (err) {
      showNotice("error", err.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 relative overflow-hidden">
      <AnimatePresence>
        {loading && authStep && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center px-4"
          >
            <MotionDiv
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl border border-white/30 p-8 text-center"
            >
              <div className="relative mx-auto w-20 h-20 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100/60" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
                <div className="absolute inset-3 rounded-full bg-blue-500/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-1">
                {authStep.includes("Connexion") ? "Connexion en cours" : "Création du compte"}
              </h3>
              <p className="text-sm text-slate-500 mt-2 min-h-[2.5rem]">{authStep}</p>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#2563eb]/10">
        <img src="/logo.png" alt="logo" className="w-32 mb-4" />
        <h1 className="text-4xl font-bold text-[#2563eb] mb-2">Trouve ton job idéal</h1>
        <p className="text-gray-700 text-center max-w-md">
          Explore les meilleures opportunités et booste ta carrière dès aujourd'hui.
        </p>
        <p className="mt-8 text-sm text-gray-500">
          Vous êtes une entreprise ?{" "}
          <Link to="/recruteur/connexion" className="font-semibold text-[#2563eb] hover:underline">
            Accédez à l'espace employeur
          </Link>
        </p>
      </div>

      <div className="flex flex-1 justify-center items-center p-6">
        <AnimatePresence mode="wait">
          {!isRegister ? (
            <MotionDiv
              key="login"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
              className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Accédez à votre espace personnel
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Connectez-vous ou{" "}
                <span
                  onClick={() => setIsRegister(true)}
                  className="text-[#2563eb] underline cursor-pointer"
                >
                  inscrivez-vous gratuitement.
                </span>
              </p>

              <AnimatePresence>
                {notice && (
                  <MotionDiv
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                      notice.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {notice.message}
                  </MotionDiv>
                )}
              </AnimatePresence>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <MdEmail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Adresse email"
                    value={login.email}
                    onChange={handleLoginChange}
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    required
                  />
                </div>

                <div className="relative">
                  <FaLock className="absolute top-3 left-3 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={login.password}
                    onChange={handleLoginChange}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>

                <div className="text-right text-sm">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-[#2563eb] hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-semibold hover:bg-[#1741a6] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>
            </MotionDiv>
          ) : (
            <MotionDiv
              key="register"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.4 }}
              className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Créez votre compte
              </h2>

              <AnimatePresence>
                {notice && (
                  <MotionDiv
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
                      notice.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {notice.message}
                  </MotionDiv>
                )}
              </AnimatePresence>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
	                <div className="grid grid-cols-2 gap-4">
	                  <div className="relative">
	                    <FaUser className="absolute top-3 left-3 text-gray-400" />
                    <input
                      name="firstName"
                      type="text"
                      placeholder="Prénom"
                      value={reg.firstName}
                      onChange={handleRegChange}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      required
                    />
                  </div>

                  <div className="relative">
                    <FaUser className="absolute top-3 left-3 text-gray-400" />
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Nom"
                      value={reg.lastName}
                      onChange={handleRegChange}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                      required
	                    />
	                  </div>
	                </div>

                <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-[#2563eb] hover:bg-blue-50/40 transition">
                  <span className="w-10 h-10 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center">
                    <FaCamera />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-gray-800">
                      Photo de profil optionnelle
                    </span>
                    <span className="block text-xs text-gray-500 truncate">
                      {regPhotoFile ? regPhotoFile.name : "Vous pourrez aussi l'ajouter plus tard."}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRegPhotoChange}
                  />
                </label>

	                <div className="relative">
	                  <MdEmail className="absolute top-3 left-3 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={reg.email}
                    onChange={handleRegChange}
                    className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="relative">
                  <FaLock className="absolute top-3 left-3 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    value={reg.password}
                    onChange={handleRegChange}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <FaLock className="absolute top-3 left-3 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez le mot de passe"
                    value={reg.confirmPassword}
                    onChange={handleRegChange}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563eb] text-white py-3 rounded-lg font-semibold hover:bg-[#1741a6] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Création...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600">
                Déjà inscrit ?{" "}
                <span
                  onClick={() => setIsRegister(false)}
                  className="text-[#2563eb] underline cursor-pointer"
                >
                  Se connecter
                </span>
              </p>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {forgotOpen && (
          <MotionDiv
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionDiv
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {forgotStep === "request" ? (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Réinitialiser le mot de passe
                  </h2>
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border px-3 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-[#2563eb]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleForgotRequest}
                      className="flex-1 bg-[#2563eb] text-white py-2 rounded-lg hover:bg-[#1741a6]"
                    >
                      {loading ? "Envoi..." : "Envoyer le code"}
                    </button>
                    <button
                      onClick={() => setForgotOpen(false)}
                      className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Entrez le code reçu</h2>
                  <div className="space-y-3 mb-4">
                    <input
                      type="text"
                      placeholder="Code à 6 chiffres"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    />
                    <input
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={newPwd2}
                      onChange={(e) => setNewPwd2(e.target.value)}
                      className="w-full border px-3 py-3 rounded-lg focus:ring-2 focus:ring-[#2563eb]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleForgotConfirm}
                      className="flex-1 bg-[#2563eb] text-white py-2 rounded-lg hover:bg-[#1741a6]"
                    >
                      {loading ? "Validation..." : "Valider"}
                    </button>
                    <button
                      onClick={() => setForgotOpen(false)}
                      className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Fermer
                    </button>
                  </div>
                </>
              )}
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
}
