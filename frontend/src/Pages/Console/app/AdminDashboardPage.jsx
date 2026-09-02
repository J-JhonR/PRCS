import React, { useEffect, useState } from "react";
import { FaBan, FaBriefcase, FaBuilding, FaFileAlt, FaSpinner, FaUsers } from "react-icons/fa";
import { MetricCard, PageHeader } from "../../Recruteur/components/RecruiterCards";
import { apiGetJSON } from "../../../lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/admin/stats/");
        setStats(data);
      } catch (err) {
        setError(err.message || "Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
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

  const metrics = [
    { label: "Utilisateurs", value: stats.total_users, trend: `${stats.candidates} candidats · ${stats.recruiters} recruteurs`, icon: FaUsers },
    { label: "Comptes suspendus", value: stats.suspended_users, trend: "is_active=False", icon: FaBan },
    { label: "Entreprises", value: stats.companies_active, trend: `${stats.companies_inactive} désactivée(s)`, icon: FaBuilding },
    { label: "Offres publiees", value: stats.jobs_published, trend: `${stats.jobs_draft} brouillon(s) · ${stats.jobs_closed} fermée(s)`, icon: FaBriefcase },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Console"
        title="Vue d'ensemble de la plateforme"
        description="Suivez l'activité globale : utilisateurs, entreprises, offres et candidatures."
      />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <FaFileAlt className="text-blue-600" />
          <h2 className="text-xl font-semibold">Candidatures totales</h2>
        </div>
        <p className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">{stats.total_applications}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Toutes offres et entreprises confondues.</p>
      </section>
    </div>
  );
}
