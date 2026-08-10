import React, { useEffect, useState } from "react";
import { FaBan, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { PageHeader } from "../../Recruteur/components/RecruiterCards";
import { apiFetch, apiGetJSON } from "../../../lib/api";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/admin/companies/");
        setCompanies(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger les entreprises.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const toggleActive = async (company) => {
    try {
      setUpdatingId(company.id);
      const response = await apiFetch(`/api/recruitment/admin/companies/${company.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !company.is_active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || "Mise a jour impossible.");
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? data : c)));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Entreprises"
        title="Moderation des entreprises"
        description="Desactivez une fiche entreprise pour la retirer de la liste publique et de la recherche."
      />

      {error && <p className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-600 dark:text-slate-400">
          <FaSpinner className="animate-spin" /> Chargement...
        </div>
      ) : companies.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
          Aucune entreprise pour le moment.
        </p>
      ) : (
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          {companies.map((company) => (
            <div
              key={company.id}
              className="grid grid-cols-1 items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800 md:grid-cols-5"
            >
              <strong className="dark:text-white">{company.name}</strong>
              <span className="text-slate-600 dark:text-slate-400">{company.sector}</span>
              <span className="text-slate-600 dark:text-slate-400">{company.location}</span>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  company.is_active
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                }`}
              >
                {company.is_active ? "Active" : "Desactivee"}
              </span>
              <button
                onClick={() => toggleActive(company)}
                disabled={updatingId === company.id}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                  company.is_active
                    ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}
              >
                {updatingId === company.id ? (
                  <FaSpinner className="animate-spin" />
                ) : company.is_active ? (
                  <FaBan />
                ) : (
                  <FaCheckCircle />
                )}
                {company.is_active ? "Desactiver" : "Activer"}
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
