import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaColumns, FaList, FaSearch, FaSpinner } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiGetJSON } from "../../../lib/api";

const STAGES = [
  { value: "received", label: "Recue" },
  { value: "in_process", label: "En cours" },
  { value: "hired", label: "Acceptee" },
  { value: "declined", label: "Declinee" },
];

export default function RecruiterApplicationsPage() {
  const [view, setView] = useState("kanban");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/recruiter/applications/");
        setApplications(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger les candidatures.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return applications;
    return applications.filter(
      (app) =>
        app.candidate_name?.toLowerCase().includes(term) ||
        app.job_offer_title?.toLowerCase().includes(term)
    );
  }, [applications, search]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Candidatures"
        title="Pipeline candidats"
        description="Suivez les candidats par statut, offre et date de candidature."
        action={
          <div className="flex rounded-2xl bg-white dark:bg-slate-900 p-1 ring-1 ring-slate-200 dark:ring-slate-800">
            <button onClick={() => setView("kanban")} className={`rounded-xl px-3 py-2 ${view === "kanban" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400"}`}><FaColumns /></button>
            <button onClick={() => setView("table")} className={`rounded-xl px-3 py-2 ${view === "table" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400"}`}><FaList /></button>
          </div>
        }
      />

      <label className="flex items-center gap-3 rounded-[2rem] bg-white dark:bg-slate-900 px-5 py-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <FaSearch className="text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-transparent outline-none"
          placeholder="Rechercher candidat ou offre..."
        />
      </label>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
          <FaSpinner className="animate-spin" /> Chargement...
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-red-50 p-6 text-center text-red-700">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          Aucune candidature pour le moment.
        </p>
      ) : view === "kanban" ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {STAGES.map((stage) => (
            <div key={stage.value} className="rounded-[1.5rem] bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <h2 className="font-semibold">{stage.label}</h2>
              <div className="mt-4 space-y-3">
                {filtered.filter((app) => app.status === stage.value).map((app) => (
                  <CandidateCard key={app.id} application={app} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          {filtered.map((app) => (
            <Link key={app.id} to={`/recruteur/app/candidatures/${app.id}`} className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 md:grid-cols-4">
              <strong>{app.candidate_name}</strong>
              <span className="text-slate-600 dark:text-slate-400">{app.job_offer_title}</span>
              <span>{STAGES.find((s) => s.value === app.status)?.label || app.status}</span>
              <span>{new Date(app.created_at).toLocaleDateString("fr-FR")}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function CandidateCard({ application }) {
  return (
    <Link to={`/recruteur/app/candidatures/${application.id}`} className="block rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 hover:border-slate-400 dark:hover:border-slate-500">
      <p className="font-semibold">{application.candidate_name}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{application.job_offer_title}</p>
    </Link>
  );
}
