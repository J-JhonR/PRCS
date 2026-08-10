import React from "react";
import { FiMapPin } from "react-icons/fi";
import PropTypes from "prop-types";

const STATUS_LABELS = {
  received: "Candidature reçue",
  in_process: "Recrutement en cours",
  hired: "Vous avez le job !",
  declined: "Candidature déclinée",
};

const STATUS_COLORS = {
  received: "bg-blue-50 text-blue-700",
  in_process: "bg-amber-50 text-amber-700",
  hired: "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-600",
};

const FALLBACKS = {
  company: "Entreprise inconnue",
  title: "Poste non spécifié",
  location: "Lieu non précisé",
  appliedAt: "Date inconnue",
};

export default function ApplicationCard({ app, onDetailsClick }) {
  const company = app.company?.trim() || FALLBACKS.company;
  const title = app.title?.trim() || FALLBACKS.title;
  const location = app.location?.trim() || FALLBACKS.location;
  const appliedAt = app.appliedAt?.trim() || FALLBACKS.appliedAt;

  const status = app.status || "received";
  const label = STATUS_LABELS[status] || "Statut inconnu";
  const color = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";

  const handleDetailsClick = () => {
    if (onDetailsClick) {
      onDetailsClick(app);
    }
  };

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-300"
      aria-labelledby={`job-title-${app.id || "card"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs uppercase tracking-wide text-gray-400"
            aria-label="Entreprise"
          >
            {company}
          </p>
          <h3
            id={`job-title-${app.id || "card"}`}
            className="font-semibold text-gray-900"
          >
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
            <FiMapPin aria-hidden="true" />
            <span>{location}</span>
          </div>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${color}`}
          role="status"
          aria-label={`Statut : ${label}`}
        >
          {label}
        </span>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <time dateTime={app.appliedAtISO || undefined}>{appliedAt}</time>
        <button
          type="button"
          onClick={handleDetailsClick}
          className="text-[#2563eb] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-sm"
          aria-label={`Voir les détails de la candidature pour ${title} chez ${company}`}
        >
          Voir les détails
        </button>
      </div>
    </article>
  );
}

ApplicationCard.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    company: PropTypes.string,
    title: PropTypes.string,
    location: PropTypes.string,
    appliedAt: PropTypes.string,
    appliedAtISO: PropTypes.string,
    status: PropTypes.oneOf(["received", "in_process", "hired", "declined"]),
  }).isRequired,
  onDetailsClick: PropTypes.func,
};