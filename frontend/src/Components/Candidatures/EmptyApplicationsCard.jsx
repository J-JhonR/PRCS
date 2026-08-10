import React from "react";
import { useNavigate } from "react-router-dom";
import { BsBriefcase } from "react-icons/bs";
import { FiPlus } from "react-icons/fi";
import PropTypes from "prop-types";

export default function EmptyApplicationsCard({
  onFindJobClick,
  onAddApplicationClick,
}) {
  const navigate = useNavigate();

  const handleFindJob = () => {
    if (onFindJobClick) {
      onFindJobClick();
    } else {
      navigate("/jobs");
    }
  };

  const handleAddApplication = () => {
    if (onAddApplicationClick) {
      onAddApplicationClick();
    }
    // Par défaut, aucune action si non fourni (le parent peut gérer)
  };

  return (
    <section
      className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-6 flex flex-col items-start gap-4 max-w-md"
      aria-labelledby="empty-applications-title"
    >
      <div
        className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center"
        aria-hidden="true"
      >
        <BsBriefcase className="text-[#2563eb]" size={26} />
      </div>

      <div>
        <h3 id="empty-applications-title" className="font-semibold text-gray-900">
          Vous n’avez pas encore de job
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Sauvegardez un job ou postulez depuis la page{" "}
          <span className="font-medium">Trouver un job</span> pour commencer à
          suivre vos candidatures.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <button
          onClick={handleFindJob}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Accéder à la page Trouver un job"
        >
          <BsBriefcase size={16} aria-hidden="true" />
          Trouver un job
        </button>

        <button
          type="button"
          onClick={handleAddApplication}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          aria-label="Ajouter une candidature manuellement"
        >
          <FiPlus size={16} aria-hidden="true" />
          Ajouter une candidature
        </button>
      </div>
    </section>
  );
}

EmptyApplicationsCard.propTypes = {
  onFindJobClick: PropTypes.func,
  onAddApplicationClick: PropTypes.func,
};