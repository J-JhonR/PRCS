import React, { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaChartPie,
  FaCog,
  FaComments,
  FaExclamationTriangle,
  FaHome,
  FaLayerGroup,
  FaPlus,
} from "react-icons/fa";
import { useAuth } from "../../../context/useAuth";
import { apiFetch } from "../../../lib/api";
import ThemeToggle from "../../../Components/UI/ThemeToggle";

const navItems = [
  { to: "/recruteur/app", label: "Dashboard", icon: FaHome, end: true },
  { to: "/recruteur/app/offres", label: "Offres", icon: FaBriefcase },
  { to: "/recruteur/app/candidatures", label: "Candidatures", icon: FaLayerGroup },
  { to: "/recruteur/app/messages", label: "Messages", icon: FaComments },
  { to: "/recruteur/app/entretiens", label: "Entretiens", icon: FaCalendarAlt },
  { to: "/recruteur/app/entreprise", label: "Entreprise", icon: FaBuilding },
  { to: "/recruteur/app/analytics", label: "Analytics", icon: FaChartPie },
  { to: "/recruteur/app/parametres", label: "Parametres", icon: FaCog },
];

export default function RecruiterAppLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const refreshCompany = useCallback(async () => {
    try {
      setCompanyLoading(true);
      const response = await apiFetch("/api/recruitment/recruiter/company/");
      if (response.status === 404) {
        setCompany(null);
        return;
      }
      const data = await response.json();
      setCompany(response.ok ? data : null);
    } catch {
      setCompany(null);
    } finally {
      setCompanyLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompany();
  }, [refreshCompany]);

  const companyName = company?.name || user?.company_name || user?.full_name || "Espace employeur";
  const initial = companyName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-blue-50/40 text-slate-950 dark:bg-slate-950 dark:text-slate-100 font-poppins">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-blue-900/30 bg-gradient-to-b from-blue-800 to-blue-950 px-4 py-5 text-white lg:block">
        <div className="flex items-center gap-3 px-2">
          <img src="/logo.png" alt="PRCS" className="h-10 rounded-xl bg-white p-1" />
          <div>
            <p className="font-bold">PRCS Recruit</p>
            <p className="text-xs text-slate-500">Espace employeur</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/recruteur/app/offres/new")}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
        >
          <FaPlus /> Nouvelle offre
        </button>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur-xl lg:px-8 dark:border-slate-800 dark:bg-slate-950/85">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{companyName}</p>
              <p className="font-bold text-slate-950 dark:text-white">Bonjour, equipe recrutement</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                  {initial}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold dark:text-white">{companyName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Admin recruteur</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <MobileLink key={item.to} {...item} />
            ))}
          </nav>
        </header>

        <main className="px-5 py-8 lg:px-8">
          {!companyLoading && !company && (
            <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="mt-1 text-amber-500" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Configurez le profil de votre entreprise</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300/80">
                    Vous devez completer votre profil employeur avant de pouvoir publier des offres.
                  </p>
                </div>
              </div>
              <Link
                to="/recruteur/app/entreprise"
                className="whitespace-nowrap rounded-2xl bg-amber-500 px-5 py-2.5 font-semibold text-white hover:bg-amber-600"
              >
                Completer maintenant
              </Link>
            </div>
          )}
          <Outlet context={{ company, companyLoading, refreshCompany }} />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl border-l-2 px-4 py-2.5 text-sm font-semibold transition ${
          isActive
            ? "border-white bg-white/10 text-white"
            : "border-transparent text-blue-100/80 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon /> {label}
    </NavLink>
  );
}

function MobileLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
          isActive ? "bg-blue-600 text-white" : "bg-blue-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`
      }
    >
      <Icon /> {label}
    </NavLink>
  );
}
