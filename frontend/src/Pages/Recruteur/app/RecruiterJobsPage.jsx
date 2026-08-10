import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaSpinner } from "react-icons/fa";
import { JobStatusBadge, PageHeader } from "../components/RecruiterCards";
import { apiGetJSON } from "../../../lib/api";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/recruiter/jobs/");
        setJobs(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger vos offres.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchStatus = status === "all" || job.status === status;
      const matchSearch = search === "" || job.title.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [jobs, status, search]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Offres"
        title="Gerer les offres d'emploi"
        description="Creez, modifiez, publiez ou fermez les offres de votre organisation."
        action={
          <Link to="/recruteur/app/offres/new" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            <FaPlus /> Creer une offre
          </Link>
        }
      />

      <div className="flex flex-col gap-3 rounded-[2rem] bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
          <FaSearch className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une offre..."
            className="w-full bg-transparent outline-none"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 font-bold outline-none"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiees</option>
          <option value="draft">Brouillons</option>
          <option value="closed">Fermees</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
          <FaSpinner className="animate-spin" /> Chargement...
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-red-50 p-6 text-center text-red-700">{error}</p>
      ) : filteredJobs.length === 0 ? (
        <p className="rounded-2xl bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          Aucune offre pour le moment.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Link key={job.id} to={`/recruteur/app/offres/${job.id}`} className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{job.location} · {job.employment_type?.toUpperCase()}</p>
                  <h2 className="mt-3 text-xl font-semibold">{job.title}</h2>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
