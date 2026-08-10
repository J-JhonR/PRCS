import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaSave, FaSpinner } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiFetch } from "../../../lib/api";

const emptyForm = {
  title: "",
  location: "",
  employment_type: "cdi",
  workplace_type: "onsite",
  experience_level: "",
  salary_min: "",
  salary_max: "",
  description: "",
  requirements: "",
  benefits: "",
};

export default function RecruiterJobFormPage() {
  const navigate = useNavigate();
  const { company } = useOutletContext();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitOffer = async (status) => {
    if (!company) {
      setError("Configurez d'abord le profil de votre entreprise.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiFetch("/api/recruitment/recruiter/jobs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary_min: form.salary_min || null,
          salary_max: form.salary_max || null,
          status,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Impossible de creer l'offre.");
      }

      navigate(`/recruteur/app/offres/${data.id}`);
    } catch (err) {
      setError(err.message || "Impossible de creer l'offre.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Nouvelle offre"
        title="Creer une offre d'emploi"
        description="Structurez clairement le poste pour attirer les bons candidats."
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitOffer("published");
        }}
        className="grid grid-cols-1 gap-5 rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 lg:grid-cols-2"
      >
        <Field label="Titre du poste" name="title" value={form.title} onChange={handleChange} placeholder="Ex: Developpeur Frontend React" required />
        <Field label="Localisation" name="location" value={form.location} onChange={handleChange} placeholder="Port-au-Prince, Hybride..." required />
        <SelectField
          label="Type de contrat"
          name="employment_type"
          value={form.employment_type}
          onChange={handleChange}
          options={[
            { value: "cdi", label: "CDI" },
            { value: "cdd", label: "CDD" },
            { value: "freelance", label: "Freelance" },
            { value: "internship", label: "Stage" },
          ]}
        />
        <SelectField
          label="Mode de travail"
          name="workplace_type"
          value={form.workplace_type}
          onChange={handleChange}
          options={[
            { value: "onsite", label: "Sur site" },
            { value: "hybrid", label: "Hybride" },
            { value: "remote", label: "Remote" },
          ]}
        />
        <Field label="Niveau d'experience" name="experience_level" value={form.experience_level} onChange={handleChange} placeholder="Junior, Senior..." />
        <Field label="Salaire minimum" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="Ex: 80000" type="number" />
        <Field label="Salaire maximum" name="salary_max" value={form.salary_max} onChange={handleChange} placeholder="Ex: 140000" type="number" />
        <Area label="Description du poste" name="description" value={form.description} onChange={handleChange} required />
        <Area label="Competences requises" name="requirements" value={form.requirements} onChange={handleChange} />
        <Area label="Avantages" name="benefits" value={form.benefits} onChange={handleChange} />
        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />} Publier l'offre
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => submitOffer("draft")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-600 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-70"
          >
            Enregistrer en brouillon
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required, type = "text" }) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
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

function Area({ label, name, value, onChange, required }) {
  return (
    <label className="lg:col-span-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
      />
    </label>
  );
}
