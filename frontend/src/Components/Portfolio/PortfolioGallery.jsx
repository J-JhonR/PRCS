import React, { useEffect, useMemo, useState } from "react";
import { FaGithub, FaLinkedin, FaSearch, FaTimes } from "react-icons/fa";

import { apiGetJSON, API_ORIGIN } from "../../lib/api";

// Resout une URL d'image relative renvoyee par Django (ex: /media/...) en URL absolue.
function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

const STATUS_LABELS = {
  available: "Disponible",
  employed: "En poste",
};

export default function PortfolioGallery() {
  // Donnees brutes recuperees de l'API
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Etat des filtres pilotes par l'utilisateur
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState(null);

  // Projet actuellement ouvert dans la modale (null = modale fermee)
  const [selectedProject, setSelectedProject] = useState(null);

  // Chargement initial des projets depuis l'API Django
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetJSON("/api/portfolio/projects/");
        setProjects(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message || "Impossible de charger les projets.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Liste des competences disponibles, deduite des projets charges (pas d'appel API dedie)
  const availableSkills = useMemo(() => {
    const names = new Set();
    projects.forEach((project) => project.skills?.forEach((skill) => names.add(skill.name)));
    return [...names].sort();
  }, [projects]);

  // Filtrage cote client : recherche texte + competence active
  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        term === "" ||
        project.title.toLowerCase().includes(term) ||
        project.candidate?.name.toLowerCase().includes(term);

      const matchesSkill =
        !activeSkill || project.skills?.some((skill) => skill.name === activeSkill);

      return matchesSearch && matchesSkill;
    });
  }, [projects, search, activeSkill]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        {/* En-tete */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Portfolio des talents
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Découvrez des candidats à travers leurs réalisations visuelles.
          </p>
        </div>

        {/* Barre de recherche + filtres par competence */}
        <div className="mt-8 space-y-4">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <FaSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un projet ou un candidat..."
              className="w-full bg-transparent text-sm outline-none dark:text-white"
            />
          </label>

          {availableSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <FilterChip active={!activeSkill} onClick={() => setActiveSkill(null)}>
                Tous
              </FilterChip>
              {availableSkills.map((skill) => (
                <FilterChip key={skill} active={activeSkill === skill} onClick={() => setActiveSkill(skill)}>
                  {skill}
                </FilterChip>
              ))}
            </div>
          )}
        </div>

        {/* Contenu : squelettes / erreur / vide / grille */}
        <div className="mt-8">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <p className="rounded-xl bg-red-50 p-6 text-center text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          ) : filteredProjects.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Aucun projet ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={() => setSelectedProject(project)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carte projet avec superposition au survol (avatar, statut, competences)
// ---------------------------------------------------------------------------
function ProjectCard({ project, onOpen }) {
  const candidate = project.candidate;
  const statusLabel = STATUS_LABELS[candidate?.status] || candidate?.status;
  const isAvailable = candidate?.status === "available";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {project.image ? (
          <img
            src={resolveImageUrl(project.image)}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Aucune image
          </div>
        )}

        {/* Superposition au survol */}
        <div className="absolute inset-0 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <Avatar candidate={candidate} size={32} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{candidate?.name}</p>
              <p className="truncate text-xs text-slate-200">{candidate?.title}</p>
            </div>
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isAvailable ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {project.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.skills.slice(0, 3).map((skill) => (
                <span key={skill.id} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white">
                  {skill.name}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={onOpen}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Voir le profil
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-slate-900 dark:text-white">{project.title}</h3>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{candidate?.name}</p>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Avatar du candidat (photo ou initiales de secours)
// ---------------------------------------------------------------------------
function Avatar({ candidate, size = 40 }) {
  const avatarUrl = resolveImageUrl(candidate?.avatar);
  const initial = candidate?.name?.charAt(0)?.toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={candidate.name}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white ring-2 ring-white"
    >
      {initial}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Boutons de filtre par competence
// ---------------------------------------------------------------------------
function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Squelettes de chargement
// ---------------------------------------------------------------------------
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modale : visuel en grand, description complete, contact du candidat
// ---------------------------------------------------------------------------
function ProjectModal({ project, onClose }) {
  const candidate = project.candidate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative">
          {project.image && (
            <img src={resolveImageUrl(project.image)} alt={project.title} className="w-full object-cover" />
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white"
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3">
            <Avatar candidate={candidate} size={44} />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{candidate?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{candidate?.title}</p>
            </div>
            <span
              className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
                candidate?.status === "available"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {STATUS_LABELS[candidate?.status] || candidate?.status}
            </span>
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{project.title}</h2>
          <p className="mt-2 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-400">
            {project.description || "Aucune description fournie."}
          </p>

          {project.skills?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <a
              href={`mailto:?subject=${encodeURIComponent(`Contact via PRCS - ${candidate?.name}`)}`}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Contacter {candidate?.name}
            </a>
            {candidate?.linkedin_url && (
              <a
                href={candidate.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <FaLinkedin /> LinkedIn
              </a>
            )}
            {candidate?.github_url && (
              <a
                href={candidate.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <FaGithub /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
