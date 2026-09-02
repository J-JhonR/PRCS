import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FaBars, FaRegLightbulb } from "react-icons/fa6";
import { IoMdClose, IoMdLogOut, IoMdPerson, IoMdSettings } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { BsBriefcase } from "react-icons/bs";

import { useAuth } from "../../context/useAuth";

const HOME_BY_ROLE = { admin: "/console/app", recruteur: "/recruteur/app", candidat: "/dashboard" };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const searchInputRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Un recruteur/admin connecte a son propre espace (/recruteur/app,
  // /console/app) ; cette navbar est celle du site public cote candidat, les
  // liens "Candidatures"/"Mon espace" n'ont donc de sens que pour un candidat.
  const isCandidat = !user?.role || user.role === "candidat";
  const spaceHref = HOME_BY_ROLE[user?.role] || "/dashboard";

  const runSearch = (term) => {
    const query = term.trim();
    if (!query) return;
    navigate(`/jobs?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    runSearch(searchInputRef.current?.value || "");
  };

  // Focus automatique sur l'input de recherche à l'ouverture
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [searchOpen]);

  // Empêche le défilement du body quand le menu mobile ou la recherche sont ouverts
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  // Gestion de la fermeture avec la touche Échap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (searchOpen) setSearchOpen(false);
        if (menuOpen) setMenuOpen(false);
        if (profileDropdownOpen) setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [searchOpen, menuOpen, profileDropdownOpen]);

  // Fermeture du dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  const activeClassName =
    "text-blue-600 dark:text-blue-400 font-semibold relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:rounded-full";
  const linkBase =
    "text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium";

  const displayName = user?.full_name || user?.username || "Connecté";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Header principal */}
      <header className="w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Bouton menu mobile */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <FaBars size={22} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 lg:h-11 w-auto object-contain"
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px]">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                isActive ? activeClassName : linkBase
              }
            >
              Trouver un job
            </NavLink>

            <NavLink
              to="/entreprises"
              className={({ isActive }) =>
                isActive ? activeClassName : linkBase
              }
            >
              Trouver une entreprise
            </NavLink>
          </nav>

          {/* Actions desktop */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Bouton recherche */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Rechercher"
            >
              <CiSearch size={22} />
            </button>

            {/* Lien Employeurs */}
            <Link
              to="/recruteur"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Employeurs
            </Link>

            {/* Lien Candidatures si connecté en tant que candidat */}
            {isLoggedIn && isCandidat && (
              <NavLink
                to="/candidatures"
                className={({ isActive }) =>
                  `${
                    isActive ? activeClassName : linkBase
                  } flex items-center gap-1.5`
                }
              >
                <BsBriefcase size={17} />
                <span>Candidatures</span>
              </NavLink>
            )}

            {/* Lien Mon espace si connecté (redirige vers l'espace du role) */}
            {isLoggedIn && (
              <NavLink
                to={spaceHref}
                className={({ isActive }) =>
                  `${
                    isActive ? activeClassName : linkBase
                  } flex items-center gap-1.5`
                }
              >
                <FaRegLightbulb size={17} />
                <span>Mon espace</span>
              </NavLink>
            )}

            {/* État connecté / non connecté */}
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-md hover:shadow-blue-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
              >
                <FaUserCircle size={18} />
                Se connecter
              </Link>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Menu utilisateur"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
                    {userInitial}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-slate-200 font-medium hidden xl:inline">
                    {displayName}
                  </span>
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 py-2 animate-in navbar-fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email || "Compte candidat"}</p>
                    </div>
                    <Link
                      to={spaceHref}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <FaRegLightbulb size={16} className="text-gray-500 dark:text-slate-400" />
                      Mon espace
                    </Link>
                    <Link
                      to="/profil"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <IoMdPerson size={16} className="text-gray-500 dark:text-slate-400" />
                      Mon profil
                    </Link>
                    <Link
                      to="/parametres"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <IoMdSettings size={16} className="text-gray-500 dark:text-slate-400" />
                      Paramètres
                    </Link>
                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <IoMdLogOut size={16} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions mobile */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Rechercher"
            >
              <CiSearch size={22} />
            </button>

            <Link
              to={isLoggedIn ? spaceHref : "/auth"}
              className="p-2 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-full"
              aria-label="Mon compte"
            >
              <FaUserCircle size={26} />
            </Link>
          </div>
        </div>
      </header>

      {/* Menu mobile (plein écran) */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Fermer le menu"
            >
              <IoMdClose size={26} />
            </button>

            <img src="/logo.png" alt="Logo" className="h-9" />

            <div className="w-8" />
          </div>

          <nav className="flex-1 overflow-y-auto py-8 px-6">
            <div className="flex flex-col gap-6 text-xl font-semibold text-gray-800 dark:text-white">
              <NavLink
                to="/"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 pl-4 -ml-4"
                    : "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                }
              >
                Accueil
              </NavLink>

              <NavLink
                to="/jobs"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 pl-4 -ml-4"
                    : "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                }
              >
                Trouver un job
              </NavLink>

              <NavLink
                to="/entreprises"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 pl-4 -ml-4"
                    : "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                }
              >
                Trouver une entreprise
              </NavLink>

              {isLoggedIn && (
                <>
                  {isCandidat && (
                    <NavLink
                      to="/candidatures"
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `${
                          isActive
                            ? "text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 pl-4 -ml-4"
                            : "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        } flex items-center gap-3`
                      }
                    >
                      <BsBriefcase size={22} />
                      Candidatures
                    </NavLink>
                  )}

                  <NavLink
                    to={spaceHref}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400 pl-4 -ml-4"
                          : "hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      } flex items-center gap-3`
                    }
                  >
                    <FaRegLightbulb size={22} />
                    Mon espace
                  </NavLink>
                </>
              )}
            </div>

            <div className="my-8 border-t border-gray-200 dark:border-slate-800" />

            <Link
              to="/recruteur"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="block w-full py-4 text-center text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Employeurs / Recruteurs
            </Link>
          </nav>

          <div className="p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-4 text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
              >
                Se connecter
              </Link>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {userInitial}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Connecté</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="block w-full py-3 text-center text-white bg-gray-800 dark:bg-slate-700 rounded-xl font-medium hover:bg-gray-900 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800/50 focus:ring-offset-2"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modale de recherche */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 animate-in navbar-fade-in duration-200"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <form className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-800" onSubmit={handleSearchSubmit}>
                <CiSearch size={24} className="text-gray-400 dark:text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Recherchez un job, une entreprise..."
                  className="flex-1 outline-none text-lg text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent"
                  aria-label="Recherche"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Fermer la recherche"
                >
                  <IoMdClose size={24} />
                </button>
              </form>

              <div className="pt-6">
                <h2 className="text-center text-xl font-semibold text-gray-800 dark:text-white">
                  Comment pouvons-nous vous aider aujourd'hui ?
                </h2>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {["Développeur", "Marketing", "Design", "Finance", "Remote"].map(
                    (term) => (
                      <button
                        key={term}
                        type="button"
                        className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        onClick={() => runSearch(term)}
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-950 px-6 py-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
              <span>Appuyez sur Échap pour fermer</span>
              <span>↵ pour rechercher</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
