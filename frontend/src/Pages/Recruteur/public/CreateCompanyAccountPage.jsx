import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaRocket, FaSpinner, FaUser } from "react-icons/fa";

import { useAuth } from "../../../context/useAuth";
import { apiFetch, apiJSON } from "../../../lib/api";

const SIZE_OPTIONS = [
  { value: "self", label: "Independant" },
  { value: "1-10", label: "1-10 employes" },
  { value: "11-50", label: "11-50 employes" },
  { value: "51-200", label: "51-200 employes" },
  { value: "201-500", label: "201-500 employes" },
  { value: "500+", label: "500+ employes" },
];

const emptyAccount = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };
const emptyCompany = {
  employer_type: "organization",
  name: "",
  sector: "",
  location: "",
  size: "1-10",
  website: "",
  description: "",
};

export default function CreateCompanyAccountPage() {
  const { login } = useAuth();
  const [account, setAccount] = useState(emptyAccount);
  const [company, setCompany] = useState(emptyCompany);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  // Le compte doit etre verifie par email avant qu'une session existe (voir
  // RegisterView cote backend) : on ne peut donc creer la fiche entreprise
  // (qui exige d'etre authentifie) qu'apres cette etape.
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleAccountChange = (event) => {
    const { name, value } = event.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  const createCompany = async (user) => {
    const formData = new FormData();
    Object.entries(company).forEach(([key, value]) => formData.append(key, value));

    const response = await apiFetch("/api/recruitment/recruiter/company/", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.detail || "Impossible de creer la fiche entreprise.");
    }

    login(user, "/recruteur/app");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!accountCreated) {
      if (account.password !== account.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
      if (!company.name.trim()) {
        setError("Le nom de l'entreprise est obligatoire.");
        return;
      }
    }

    try {
      setLoading(true);

      let user = createdUser;
      if (!accountCreated) {
        const data = await apiJSON("/api/accounts/register/", {
          method: "POST",
          body: {
            username: account.email,
            email: account.email,
            password: account.password,
            first_name: account.firstName,
            last_name: account.lastName,
            full_name: `${account.firstName} ${account.lastName}`.trim(),
            role: "recruteur",
          },
        });
        setAccountCreated(true);
        if (data.requires_verification) {
          setNeedsVerification(true);
          setLoading(false);
          return;
        }
        user = data.user;
        setCreatedUser(user);
      }

      await createCompany(user);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!verifyCode.trim()) {
      setError("Entrez le code recu par email.");
      return;
    }

    try {
      setLoading(true);
      const data = await apiJSON("/api/accounts/verify-email-confirm/", {
        method: "POST",
        body: { email: account.email, code: verifyCode.trim() },
      });
      setCreatedUser(data.user);
      setNeedsVerification(false);
      await createCompany(data.user);
    } catch (err) {
      setError(err.message || "Code invalide ou expire.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    try {
      setLoading(true);
      await apiJSON("/api/accounts/verify-email-request/", {
        method: "POST",
        body: { email: account.email },
      });
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
      setLoading(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-slate-950 py-16 px-4 font-poppins flex items-center justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="PRCS" className="mx-auto h-14 mb-4" />
            <h1 className="font-semibold text-3xl text-blue-800 dark:text-blue-300">Vérifiez votre email</h1>
            <p className="mt-3 text-gray-600 dark:text-slate-400">
              Un code à 6 chiffres a été envoyé à{" "}
              <span className="font-semibold text-gray-800 dark:text-white">{account.email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-4 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg sm:p-8">
            {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
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
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaRocket />}
              Valider et créer mon entreprise
            </button>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading || resendCooldown > 0}
              className="w-full text-center text-sm text-blue-700 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer le code"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 py-16 px-4 font-poppins">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <img src="/logo.png" alt="PRCS" className="mx-auto h-14 mb-4" />
          <h1 className="font-semibold text-3xl md:text-4xl text-blue-800 dark:text-blue-300">
            Créer un compte entreprise
          </h1>
          <p className="mt-3 text-gray-600 dark:text-slate-400">
            Un seul formulaire pour votre compte administrateur et le profil de votre organisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg sm:p-10">
          {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
          {accountCreated && (
            <p className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              Compte cree. Finalisez la fiche entreprise pour acceder a votre espace.
            </p>
          )}

          <fieldset disabled={accountCreated} className="space-y-4 disabled:opacity-60">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <FaUser className="text-blue-600" />
              <h2 className="text-lg font-bold">Compte administrateur</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Prenom" name="firstName" value={account.firstName} onChange={handleAccountChange} required />
              <Field label="Nom" name="lastName" value={account.lastName} onChange={handleAccountChange} required />
              <Field label="Email professionnel" name="email" type="email" value={account.email} onChange={handleAccountChange} required />
              <div />
              <Field label="Mot de passe" name="password" type="password" value={account.password} onChange={handleAccountChange} required />
              <Field label="Confirmer le mot de passe" name="confirmPassword" type="password" value={account.confirmPassword} onChange={handleAccountChange} required />
            </div>
          </fieldset>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <FaBuilding className="text-blue-600" />
              <h2 className="text-lg font-bold">Votre entreprise</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nom de l'entreprise" name="name" value={company.name} onChange={handleCompanyChange} required />
              <SelectField
                label="Type"
                name="employer_type"
                value={company.employer_type}
                onChange={handleCompanyChange}
                options={[
                  { value: "organization", label: "Institution" },
                  { value: "individual", label: "Personne physique" },
                ]}
              />
              <Field label="Secteur d'activite" name="sector" value={company.sector} onChange={handleCompanyChange} required />
              <Field label="Localisation" name="location" value={company.location} onChange={handleCompanyChange} required />
              <SelectField label="Taille" name="size" value={company.size} onChange={handleCompanyChange} options={SIZE_OPTIONS} />
              <Field label="Site web" name="website" value={company.website} onChange={handleCompanyChange} placeholder="https://..." />
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</span>
              <textarea
                name="description"
                value={company.description}
                onChange={handleCompanyChange}
                className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-70"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaRocket />}
            {accountCreated ? "Finaliser la creation de l'entreprise" : "Creer mon compte entreprise"}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Deja inscrit ?{" "}
            <Link to="/recruteur/connexion" className="font-bold text-blue-700 dark:text-blue-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required, type = "text" }) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
