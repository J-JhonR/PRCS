import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaBriefcase, FaCalendarCheck, FaComments, FaPlus, FaSpinner, FaUsers } from "react-icons/fa";
import { MetricCard, PageHeader } from "../components/RecruiterCards";
import { apiGetJSON } from "../../../lib/api";

export default function RecruiterDashboardPage() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsData, applicationsData, jobsData] = await Promise.all([
          apiGetJSON("/api/recruitment/recruiter/stats/"),
          apiGetJSON("/api/recruitment/recruiter/applications/"),
          apiGetJSON("/api/recruitment/recruiter/jobs/"),
        ]);
        setStats(statsData);
        setApplications(Array.isArray(applicationsData) ? applicationsData : applicationsData.results || []);
        setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger le tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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
    { label: "Offres publiees", value: stats.published_jobs, trend: `${stats.draft_jobs} brouillon(s)`, icon: FaBriefcase },
    { label: "Candidatures recues", value: stats.total_applications, trend: `+${stats.applications_today} aujourd'hui`, icon: FaUsers },
    { label: "Entretiens a venir", value: stats.upcoming_interviews, trend: "Planifies", icon: FaCalendarCheck },
    { label: "Messages non lus", value: stats.unread_messages, trend: "A traiter", icon: FaComments },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Vue d'ensemble du recrutement"
        description="Suivez les offres, candidatures, messages et taches prioritaires de votre equipe."
        action={
          <Link to="/recruteur/app/offres/new" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            <FaPlus /> Nouvelle offre
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Candidatures recentes</h2>
            <Link to="/recruteur/app/candidatures" className="text-sm font-semibold text-blue-600">Tout voir</Link>
          </div>
          <div className="mt-5 space-y-3">
            {applications.length === 0 && <p className="text-slate-500 dark:text-slate-400">Aucune candidature pour le moment.</p>}
            {applications.slice(0, 4).map((application) => (
              <Link
                key={application.id}
                to={`/recruteur/app/candidatures/${application.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 transition hover:border-slate-400 dark:hover:border-slate-500"
              >
                <div>
                  <p className="font-semibold">{application.candidate_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{application.job_offer_title}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{application.status}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white shadow-sm">
          <h2 className="text-xl font-semibold">Vos offres</h2>
          <div className="mt-5 space-y-3">
            {jobs.length === 0 && <p className="text-blue-100">Aucune offre publiee.</p>}
            {jobs.slice(0, 4).map((job) => (
              <Link key={job.id} to={`/recruteur/app/offres/${job.id}`} className="block rounded-2xl bg-white/10 p-4 hover:bg-white/20">
                <p className="font-bold">{job.title}</p>
                <p className="mt-1 text-sm text-blue-100">{job.status}</p>
              </Link>
            ))}
          </div>
          <Link to="/recruteur/app/offres" className="mt-5 inline-flex items-center gap-2 font-semibold text-blue-100">
            Gerer les offres <FaArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
