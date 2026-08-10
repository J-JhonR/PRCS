import React, { useState, useEffect } from "react";
import {
  FaBookmark,
  FaBriefcase,
  FaFire,
  FaRegFileAlt,
  FaUserCircle,
  FaChevronRight,
  FaEdit,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "../../context/useAuth";
import { apiFetch } from "../../lib/api";

const API_BASE = "/api/recruitment/";

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.username || "Utilisateur";

  // États dynamiques (remplace stats statiques)
  const [stats, setStats] = useState({
    applications: 0,
    saved: 0, 
    opportunities: 0,
    documents: 0,
  });
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcul completion depuis profile (comme ProfilePage)
  const completionRate = profile ? Math.round(
    [
      !!profile.first_name, !!profile.last_name, !!profile.phone,
      !!profile.location, !!profile.headline, !!profile.bio,
      (profile.skills || []).length > 0,
      (profile.experiences || []).length > 0,
      (profile.education || []).length > 0
    ].filter(Boolean).length / 10 * 100
  ) : 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Applications du candidat
        const appsRes = await apiFetch(`${API_BASE}applications/`);
        const applications = await appsRes.json();
        const applicationsCount = Array.isArray(applications) ? applications.length : 0;

        // 2. Profil (statut, completion)
        const profileRes = await apiFetch(`${API_BASE}profile/`);
        const profileData = await profileRes.json();
        setProfile(profileData);
        setStatus(profileData.availability_status || "open");

        // 3. Opportunités (offres publiées)
        const oppsRes = await apiFetch(`${API_BASE}jobs/`);
        const opportunities = await oppsRes.json();
        const opportunitiesCount = Array.isArray(opportunities) ? opportunities.length : 0;

        // 4. Favoris
        const savedRes = await apiFetch(`${API_BASE}saved-jobs/`);
        const savedJobs = await savedRes.json();
        const savedCount = Array.isArray(savedJobs) ? savedJobs.length : 0;

        setStats({
          applications: applicationsCount,
          saved: savedCount,
          opportunities: opportunitiesCount,
          documents: profileData.cv ? 1 : 0,
        });

        console.log("✅ Dashboard data loaded:", { applicationsCount, opportunitiesCount });
      } catch (err) {
        console.error("❌ Dashboard load error:", err);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    // Sauvegarder dans profil
    try {
      const formData = new FormData();
      formData.append("availability_status", newStatus);

      await apiFetch(`${API_BASE}profile/`, {
        method: "PUT",
        body: formData,
      });
      console.log("✅ Statut mis à jour:", newStatus);
    } catch (err) {
      console.error("❌ Statut update failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600 gap-3">
        <FaSpinner className="animate-spin" />
        Chargement de votre tableau de bord...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête avec animation subtile */}
        <div className="text-center md:text-left animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Bienvenue,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Voici le récapitulatif de votre espace candidat.
          </p>
          {error && (
            <p className="mt-3 inline-block rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-100">
              {error}
            </p>
          )}
        </div>

        {/* Carte de profil enrichie */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold shadow-md">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors"
                    aria-label="Modifier la photo de profil"
                  >
                    <FaEdit size={14} />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Complétez votre profil candidat
                  </h2>
                  <p className="text-slate-500 mt-1 max-w-2xl">
                    Indiquez votre disponibilité, votre CV et vos informations
                    pour être contacté plus rapidement.
                  </p>
  {/* Barre de progression dynamique */}
                  <div className="mt-4 w-full max-w-xs">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Complétion du profil</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">
                    Mon statut actuel
                  </span>
                  <div className="relative">
                    <select
                      id="status"
                      value={status}
                      onChange={handleStatusChange}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-5 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-shadow cursor-pointer"
                    >
                      <option value="closed">Non disponible</option>
                      <option value="open">Disponible</option>
                      <option value="interviewing">En entretien</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Badge de statut visuel */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    status === "open"
                      ? "bg-green-100 text-green-800"
                      : status === "interviewing"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      status === "open"
                        ? "bg-green-500"
                        : status === "interviewing"
                        ? "bg-amber-500"
                        : "bg-slate-500"
                    }`}
                  ></span>
                  {status === "open"
                    ? "Ouvert aux opportunités"
                    : status === "interviewing"
                    ? "En processus"
                    : "Non disponible"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grille de cartes d'actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Carte Candidatures */}
          <DashboardCard
            icon={<FaBriefcase />}
            title="Candidatures en cours"
            description="Suivez les offres auxquelles vous avez postulé."
            buttonText="Voir mes candidatures"
            count={stats.applications}
            color="blue"
          />

          {/* Carte Jobs sauvegardés */}
          <DashboardCard
            icon={<FaBookmark />}
            title="Jobs sauvegardés"
            description="Retrouvez rapidement vos offres favorites."
            buttonText="Voir mes favoris"
            count={stats.saved}
            color="indigo"
          />

          {/* Carte Opportunités */}
          <DashboardCard
            icon={<FaFire />}
            title="Opportunités"
            description="Les meilleures pistes pour votre profil."
            buttonText="Voir mes opportunités"
            count={stats.opportunities}
            color="amber"
            highlight
          />

          {/* Carte Documents */}
          <DashboardCard
            icon={<FaRegFileAlt />}
            title="Documents"
            description="Centralisez votre CV et vos lettres de motivation."
            buttonText="Gérer mes documents"
            count={stats.documents}
            color="slate"
          />
        </div>

        {/* Section supplémentaire optionnelle pour montrer du contenu récent (facultatif) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Activité récente
            </h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Tout voir <FaChevronRight size={12} />
            </button>
          </div>
          <div className="text-slate-500 text-sm">
            <p>📄 Votre CV a été consulté par 3 recruteurs cette semaine.</p>
            <p className="mt-2">
              🔔 Nouvelle offre correspondant à votre profil : Développeur Frontend
            </p>
          </div>
        </div>
      </div>

      {/* Animation simple ajoutée via CSS global */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

// Composant réutilisable pour les cartes du dashboard
const DashboardCard = ({
  icon,
  title,
  description,
  buttonText,
  count,
  color = "blue",
  highlight = false,
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600",
    slate: "from-slate-500 to-slate-600",
  };

  const gradient = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        highlight ? "ring-2 ring-amber-200/50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        {count !== undefined && (
          <span className="text-3xl font-bold text-slate-700">{count}</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mt-5">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
      <button className="mt-5 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:gap-2 transition-all">
        {buttonText}
        <FaChevronRight
          size={12}
          className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
        />
      </button>
    </div>
  );
};
