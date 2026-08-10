import React, { useEffect, useState } from "react";
import { JobStatusBadge, PageHeader } from "../../Recruteur/components/RecruiterCards";
import { FaSpinner } from "react-icons/fa";
import { apiFetch, apiGetJSON } from "../../../lib/api";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/admin/jobs/");
        setJobs(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger les offres.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const closeJob = async (job) => {
    try {
      setUpdatingId(job.id);
      const response = await apiFetch(`/api/recruitment/admin/jobs/${job.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Mise a jour impossible.");
      setJobs((prev) => prev.map((j) => (j.id === job.id ? data : j)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Offres"
        title="Moderation des offres d'emploi"
        description="Fermez une offre inappropriee, quelle que soit l'entreprise qui l'a publiee."
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
          <FaSpinner className="animate-spin" /> Chargement...
        </div>
      ) : jobs.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
          Aucune offre pour le moment.
        </p>
      ) : (
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800 md:grid-cols-5"
            >
              <strong className="dark:text-white">{job.title}</strong>
              <span className="text-slate-600 dark:text-slate-400">{job.company?.name}</span>
              <span className="text-slate-600 dark:text-slate-400">{job.location}</span>
              <JobStatusBadge status={job.status} className="w-fit" />
              <button
                onClick={() => closeJob(job)}
                disabled={updatingId === job.id || job.status === "closed"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-500/10 dark:text-red-300"
              >
                {updatingId === job.id ? <FaSpinner className="animate-spin" /> : null}
                Fermer l'offre
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
