import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaEye, FaPlay, FaSave, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiFetch } from "../../../lib/api";
import { resolveMediaUrl } from "../../../lib/jobAdapter";

const SIZE_OPTIONS = [
  { value: "self", label: "Independant" },
  { value: "1-10", label: "1-10 employes" },
  { value: "11-50", label: "11-50 employes" },
  { value: "51-200", label: "51-200 employes" },
  { value: "201-500", label: "201-500 employes" },
  { value: "500+", label: "500+ employes" },
];

const emptyForm = {
  employer_type: "organization",
  name: "",
  sector: "",
  location: "",
  size: "1-10",
  website: "",
  video_url: "",
  description: "",
};

export default function RecruiterCompanyProfilePage() {
  const { company, companyLoading, refreshCompany } = useOutletContext();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  useEffect(() => {
    if (company) {
      setForm({
        employer_type: company.employer_type || "organization",
        name: company.name || "",
        sector: company.sector || "",
        location: company.location || "",
        size: company.size || "1-10",
        website: company.website || "",
        video_url: company.video_url || "",
        description: company.description || "",
      });
    }
  }, [company]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));

      const response = await apiFetch("/api/recruitment/recruiter/company/", {
        method: company ? "PUT" : "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Impossible de sauvegarder l'entreprise.");
      }

      await refreshCompany();
      setMessage({ type: "success", text: "Profil entreprise sauvegarde avec succes." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiFetch("/api/recruitment/recruiter/company/photos/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Import impossible.");

      await refreshCompany();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (photoId) => {
    try {
      setDeletingPhotoId(photoId);
      await apiFetch(`/api/recruitment/recruiter/company/photos/${photoId}/`, { method: "DELETE" });
      await refreshCompany();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600 dark:text-slate-400">
        <FaSpinner className="animate-spin" /> Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profil employeur"
        title={company ? "Page entreprise publique" : "Configurez votre entreprise"}
        description="Presentez votre organisation, culture, avantages et localisation aux candidats."
        action={
          company ? (
            <Link
              to={`/entreprises/${company.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FaEye /> Apercu public
            </Link>
          ) : null
        }
      />

      {message && (
        <div
          className={`rounded-2xl px-5 py-3 text-sm font-medium ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nom entreprise / recruteur" name="name" value={form.name} onChange={handleChange} required />
          <SelectField
            label="Type"
            name="employer_type"
            value={form.employer_type}
            onChange={handleChange}
            options={[
              { value: "organization", label: "Institution" },
              { value: "individual", label: "Personne physique" },
            ]}
          />
          <Field label="Secteur" name="sector" value={form.sector} onChange={handleChange} required />
          <Field label="Localisation" name="location" value={form.location} onChange={handleChange} required />
          <SelectField label="Taille" name="size" value={form.size} onChange={handleChange} options={SIZE_OPTIONS} />
          <Field label="Site web" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
        </div>
        <Area label="Description" name="description" value={form.description} onChange={handleChange} />
        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          {company ? "Sauvegarder" : "Creer mon entreprise"}
        </button>
      </form>

      {company && (
        <section className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Medias</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ajoutez des photos de votre equipe/locaux et un lien vers une video de presentation
            (YouTube, Vimeo...).
          </p>

          <div className="mt-5 max-w-md">
            <Field
              label="Lien video de presentation"
              name="video_url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {form.video_url && (
              <a
                href={form.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                <FaPlay size={12} /> Verifier le lien
              </a>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Enregistre avec le formulaire ci-dessus (bouton "Sauvegarder").
            </p>
          </div>

          <div className="mt-6">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400">
              {uploadingPhoto ? <FaSpinner className="animate-spin" /> : <FaUpload />}
              Ajouter une photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>

            {company.photos?.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {company.photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl">
                    <img
                      src={resolveMediaUrl(photo.image)}
                      alt={photo.caption || "Photo entreprise"}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoDelete(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      {deletingPhotoId === photo.id ? <FaSpinner className="animate-spin" size={12} /> : <FaTrash size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Aucune photo pour le moment.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required }) {
  return (
    <label>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
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

function Area({ label, name, value, onChange }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-600"
      />
    </label>
  );
}
