import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt, FaComments, FaFilePdf, FaSpinner } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiFetch, apiGetJSON } from "../../../lib/api";

const STATUS_OPTIONS = [
  { value: "received", label: "Reçue" },
  { value: "in_process", label: "En cours" },
  { value: "hired", label: "Acceptée" },
  { value: "declined", label: "Déclinée" },
];

export default function RecruiterCandidateDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON(`/api/recruitment/recruiter/applications/${id}/`);
        setApplication(data);
      } catch (err) {
        setError(err.message || "Candidature introuvable.");
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [id]);

  const changeStatus = async (status) => {
    try {
      setUpdating(true);
      const response = await apiFetch(`/api/recruitment/recruiter/applications/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Mise à jour impossible.");
      setApplication(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600 dark:text-slate-400">
        <FaSpinner className="animate-spin" /> Chargement...
      </div>
    );
  }

  if (error && !application) {
    return <p className="rounded-2xl bg-red-50 p-6 text-center text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fiche candidat"
        title={application.candidate_name}
        description={`${application.candidate_email} · candidature pour ${application.job_offer_title}`}
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.4fr]">
        <article className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <h2 className="text-xl font-semibold">Lettre de motivation</h2>
          <p className="mt-3 whitespace-pre-line leading-8 text-slate-600 dark:text-slate-400">
            {application.cover_letter || "Aucune lettre de motivation fournie."}
          </p>

          {application.cv_file ? (
            <a
              href={application.cv_file}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-5 hover:border-blue-400"
            >
              <FaFilePdf className="text-2xl text-red-500" />
              <div>
                <p className="font-semibold">CV candidat</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ouvrir / télécharger</p>
              </div>
            </a>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 p-5">
              <FaFilePdf className="text-2xl text-slate-300" />
              <p className="mt-2 font-semibold">Aucun CV joint</p>
            </div>
          )}
        </article>
        <aside className="space-y-4">
          <button
            onClick={() => navigate(`/recruteur/app/messages?application=${id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <FaComments /> Contacter
          </button>
          <button
            onClick={() => navigate(`/recruteur/app/entretiens?application=${id}`)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-100 px-5 py-3 font-semibold text-blue-800 hover:bg-blue-200"
          >
            <FaCalendarAlt /> Planifier entretien
          </button>
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 space-y-2">
            <h3 className="font-semibold">Statut de la candidature</h3>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                disabled={updating || application.status === option.value}
                onClick={() => changeStatus(option.value)}
                className={`w-full rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                  application.status === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 hover:bg-slate-200"
                } disabled:opacity-70`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
