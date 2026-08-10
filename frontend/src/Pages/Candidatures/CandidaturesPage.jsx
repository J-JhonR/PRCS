import React, { useMemo, useState, useCallback, useDeferredValue, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FaSpinner } from "react-icons/fa6";
import { APPLICATION_STATUS } from "../../data/applicationsData";
import ApplicationCard from "../../Components/Candidatures/ApplicationCard";
import EmptyApplicationsCard from "../../Components/Candidatures/EmptyApplicationsCard";
import StatusFilterMenu from "../../Components/Candidatures/StatusFilterMenu";
import { useAuth } from "../../context/useAuth";
import { apiGetJSON } from "../../lib/api";

function formatAppliedAt(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Il y a 1 jour";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`;
  const diffMonths = Math.floor(diffDays / 30);
  return `Il y a ${diffMonths} mois`;
}

function mapApplication(item) {
  return {
    id: item.id,
    title: item.job_offer_title,
    company: item.job_offer_company,
    location: item.job_offer_location,
    status: item.status,
    appliedAt: formatAppliedAt(item.created_at),
    appliedAtISO: item.created_at,
  };
}

// Constantes pour les onglets
const TABS = {
  CURRENT: "current",
  PAST: "past",
};

// Fonctions pures pour déterminer le type de candidature
const isCurrentApplication = (status) =>
  status === APPLICATION_STATUS.RECEIVED || status === APPLICATION_STATUS.IN_PROCESS;

const isPastApplication = (status) =>
  status === APPLICATION_STATUS.HIRED || status === APPLICATION_STATUS.DECLINED;

export default function CandidaturesPage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0] || user?.username || "Utilisateur";

  const [applicationsData, setApplicationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/applications/");
        const list = Array.isArray(data) ? data : data.results || [];
        setApplicationsData(list.map(mapApplication));
      } catch (err) {
        setError(err.message || "Impossible de charger vos candidatures.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const [activeTab, setActiveTab] = useState(TABS.CURRENT);
  const [search, setSearch] = useState("");
  // useDeferredValue évite les ralentissements lors de la saisie rapide
  const deferredSearch = useDeferredValue(search);
  const [selectedStatuses, setSelectedStatuses] = useState([
    APPLICATION_STATUS.RECEIVED,
    APPLICATION_STATUS.IN_PROCESS,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.DECLINED,
  ]);

  // Gestionnaires d'événements mémoïsés
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  // Filtrage mémoïsé des candidatures
  const filteredApplications = useMemo(() => {
    // Filtrage par onglet
    const tabFiltered = applicationsData.filter((app) => {
      if (activeTab === TABS.CURRENT) {
        return isCurrentApplication(app.status);
      }
      return isPastApplication(app.status);
    });

    // Filtrage par statuts sélectionnés et recherche
    const searchTerm = deferredSearch.trim().toLowerCase();
    return tabFiltered.filter((app) => {
      const matchStatus = selectedStatuses.includes(app.status);
      const matchSearch =
        searchTerm === "" ||
        app.title.toLowerCase().includes(searchTerm) ||
        app.company.toLowerCase().includes(searchTerm);
      return matchStatus && matchSearch;
    });
  }, [applicationsData, activeTab, deferredSearch, selectedStatuses]);

  const hasApplications = filteredApplications.length > 0;
  const totalApplications = filteredApplications.length;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 space-y-8">
        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {firstName}, bienvenue dans votre suivi de candidatures&nbsp;!
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl">
            Actualisez votre avancement, triez vos jobs et suivez les réponses
            des recruteurs. Vos candidatures évolueront automatiquement en
            fonction de leur statut (reçue, en cours, acceptée ou déclinée).
          </p>
        </header>

        {/* TABS + ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-2">
          <div role="tablist" className="flex gap-6 text-sm font-medium">
            <button
              role="tab"
              aria-selected={activeTab === TABS.CURRENT}
              aria-controls="current-applications-panel"
              id="tab-current"
              onClick={() => handleTabChange(TABS.CURRENT)}
              className={`pb-2 border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-t-sm ${
                activeTab === TABS.CURRENT
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Candidatures en cours
            </button>
            <button
              role="tab"
              aria-selected={activeTab === TABS.PAST}
              aria-controls="past-applications-panel"
              id="tab-past"
              onClick={() => handleTabChange(TABS.PAST)}
              className={`pb-2 border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-t-sm ${
                activeTab === TABS.PAST
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Candidatures passées
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Barre de recherche desktop */}
            <div className="hidden md:flex items-center bg-white border rounded-lg px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-blue-300">
              <CiSearch size={18} className="text-gray-500 mr-2" aria-hidden="true" />
              <label htmlFor="desktop-search" className="sr-only">
                Rechercher une candidature
              </label>
              <input
                id="desktop-search"
                type="text"
                placeholder="Rechercher une candidature"
                value={search}
                onChange={handleSearchChange}
                className="bg-transparent outline-none w-52"
                aria-label="Rechercher par titre ou entreprise"
              />
            </div>

            <StatusFilterMenu
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses}
            />
          </div>
        </div>

        {/* VERSION MOBILE du champ de recherche */}
        <div className="md:hidden">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-300">
            <CiSearch size={18} className="text-gray-500 mr-2" aria-hidden="true" />
            <label htmlFor="mobile-search" className="sr-only">
              Rechercher une candidature
            </label>
            <input
              id="mobile-search"
              type="text"
              placeholder="Rechercher une candidature"
              value={search}
              onChange={handleSearchChange}
              className="bg-transparent outline-none flex-1"
              aria-label="Rechercher par titre ou entreprise"
            />
          </div>
        </div>

        {/* Résumé des résultats (accessibilité et UX) */}
        {hasApplications && (
          <div className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
            {totalApplications} candidature{totalApplications > 1 ? "s" : ""} trouvée{totalApplications > 1 ? "s" : ""}
            {deferredSearch && ` pour "${deferredSearch}"`}
          </div>
        )}

        {/* CONTENU PRINCIPAL */}
        <main>
          {loading ? (
            <div className="p-10 flex items-center justify-center gap-3 text-gray-600">
              <FaSpinner className="animate-spin" /> Chargement de vos candidatures...
            </div>
          ) : error ? (
            <p className="p-6 bg-white rounded-lg shadow text-center text-red-600">{error}</p>
          ) : hasApplications ? (
            <section
              id={activeTab === TABS.CURRENT ? "current-applications-panel" : "past-applications-panel"}
              aria-labelledby={activeTab === TABS.CURRENT ? "tab-current" : "tab-past"}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredApplications.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </section>
          ) : (
            <EmptyApplicationsCard />
          )}
        </main>
      </div>
    </div>
  );
}