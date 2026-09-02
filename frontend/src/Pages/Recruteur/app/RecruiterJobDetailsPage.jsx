import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaSpinner, FaTrash, FaUsers } from "react-icons/fa";
import { JobStatusBadge, PageHeader } from "../components/RecruiterCards";
import { apiFetch, apiGetJSON } from "../../../lib/api";

const STATUS_ACTIONS = {
  draft: [{ label: "Publier", value: "published" }],
  published: [{ label: "Fermer", value: "closed" }],
  closed: [{ label: "Republier", value: "published" }],
};

export default function RecruiterJobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await apiGetJSON(`/api/recruitment/recruiter/jobs/${id}/`);
      setJob(data);
      const applications = await apiGetJSON(`/api/recruitment/recruiter/applications/?job_offer=${id}`);
      const list = Array.isArray(applications) ? applications : applications.results || [];
      setApplicationsCount(list.length);
    } catch (err) {
      setError(err.message || "Offre introuvable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (status) => {
    try {
      setUpdating(true);
      const response = await apiFetch(`/api/recruitment/recruiter/jobs/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Mise à jour impossible.");
      setJob(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette offre ?")) return;
    try {
      setUpdating(true);
      await apiFetch(`/api/recruitment/recruiter/jobs/${id}/`, { method: "DELETE" });
      navigate("/recruteur/app/offres");
    } catch (err) {
      setError(err.message);
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

  if (error && !job) {
    return <p className="rounded-2xl bg-red-50 p-6 text-center text-red-700">{error}</p>;
  }

  const actions = STATUS_ACTIONS[job.status] || [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Détail offre"
        title={job.title}
        description={`${job.location} · ${job.employment_type?.toUpperCase()} · créée le ${new Date(job.created_at).toLocaleDateString("fr-FR")}`}
        action={<JobStatusBadge status={job.status} />}
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.35fr]">
        <article className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <h2 className="text-xl font-semibold">Description du poste</h2>
          <p className="mt-4 whitespace-pre-line leading-8 text-slate-600 dark:text-slate-400">{job.description}</p>
          {job.requirements && (
            <>
              <h3 className="mt-8 font-semibold">Compétences requises</h3>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-400">{job.requirements}</p>
            </>
          )}
          {job.benefits && (
            <>
              <h3 className="mt-8 font-semibold">Avantages</h3>
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-400">{job.benefits}</p>
            </>
          )}
        </article>
        <aside className="space-y-4">
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white shadow-sm">
            <FaUsers className="text-3xl text-blue-100" />
            <p className="mt-4 text-4xl font-semibold">{applicationsCount}</p>
            <p className="text-slate-300">candidatures associées</p>
            <Link to="/recruteur/app/candidatures" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-blue-800">
              Voir les candidats
            </Link>
          </div>

          <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 space-y-3">
            {actions.map((action) => (
              <button
                key={action.value}
                disabled={updating}
                onClick={() => changeStatus(action.value)}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {action.label}
              </button>
            ))}
            <button
              disabled={updating}
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-70"
            >
              <FaTrash size={14} /> Supprimer
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
