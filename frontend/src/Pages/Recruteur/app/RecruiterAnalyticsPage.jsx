import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { PageHeader } from "../components/RecruiterCards";
import { apiGetJSON } from "../../../lib/api";

const STAGES = [
  { value: "received", label: "Reçue" },
  { value: "in_process", label: "En cours" },
  { value: "hired", label: "Acceptée" },
  { value: "declined", label: "Déclinée" },
];

export default function RecruiterAnalyticsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [statsData, applicationsData] = await Promise.all([
          apiGetJSON("/api/recruitment/recruiter/stats/"),
          apiGetJSON("/api/recruitment/recruiter/applications/"),
        ]);
        setStats(statsData);
        setApplications(Array.isArray(applicationsData) ? applicationsData : applicationsData.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger les analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-20 text-slate-600 dark:text-slate-400">
        <FaSpinner className="animate-spin" /> Chargement...
      </div>
    );
  }

  if (error) {
    return <p className="rounded-2xl bg-red-50 p-6 text-center text-red-700">{error}</p>;
  }

  const total = applications.length;
  const hired = applications.filter((app) => app.status === "hired").length;
  const declined = applications.filter((app) => app.status === "declined").length;
  const conversionRate = total > 0 ? Math.round((hired / total) * 100) : 0;
  const responseRate = total > 0 ? Math.round(((hired + declined) / total) * 100) : 0;

  const analyticsCards = [
    { label: "Taux de conversion", value: `${conversionRate}%`, note: "Candidatures acceptées" },
    { label: "Candidatures totales", value: total, note: "Toutes offres confondues" },
    { label: "Offres publiées", value: stats.published_jobs, note: `${stats.draft_jobs} brouillon(s)` },
    { label: "Taux de réponse", value: `${responseRate}%`, note: "Candidatures traitées" },
  ];

  const maxCount = Math.max(1, ...STAGES.map((stage) => applications.filter((app) => app.status === stage.value).length));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Performance recrutement"
        description="Mesurez la conversion et la répartition des candidatures par statut."
      />
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map((card) => (
          <article key={card.label} className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{card.label}</p>
            <h2 className="mt-4 text-4xl font-semibold">{card.value}</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{card.note}</p>
          </article>
        ))}
      </section>
      <section className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <h2 className="text-xl font-semibold">Répartition des candidatures par statut</h2>
        <div className="mt-6 grid grid-cols-4 items-end gap-4">
          {STAGES.map((stage) => {
            const count = applications.filter((app) => app.status === stage.value).length;
            const height = Math.max(8, (count / maxCount) * 160);
            return (
              <div key={stage.value} className="flex flex-col items-center gap-3">
                <span className="text-sm font-semibold">{count}</span>
                <div className="w-full rounded-t-2xl bg-gradient-to-t from-blue-700 to-blue-400" style={{ height: `${height}px` }} />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
