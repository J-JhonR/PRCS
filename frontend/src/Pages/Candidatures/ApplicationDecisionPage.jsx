import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheckCircle, FaClock, FaSpinner, FaTimesCircle } from "react-icons/fa";

import { apiGetJSON } from "../../lib/api";

const STATUS_CONTENT = {
  hired: {
    icon: FaCheckCircle,
    color: "text-emerald-500",
    title: "Félicitations, votre candidature a été acceptée !",
  },
  declined: {
    icon: FaTimesCircle,
    color: "text-red-500",
    title: "Votre candidature n'a pas été retenue cette fois-ci.",
  },
  received: {
    icon: FaClock,
    color: "text-blue-500",
    title: "Votre candidature est en cours d'examen.",
  },
  in_process: {
    icon: FaClock,
    color: "text-amber-500",
    title: "Votre candidature est en cours de traitement.",
  },
};

export default function ApplicationDecisionPage() {
  const { token } = useParams();
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDecision = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON(`/api/recruitment/applications/decision/${token}/`);
        setDecision(data);
      } catch (err) {
        setError(err.message || "Ce lien est invalide ou a expiré.");
      } finally {
        setLoading(false);
      }
    };

    loadDecision();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-gray-600">
        <FaSpinner className="animate-spin" /> Vérification du lien...
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <FaTimesCircle className="text-4xl text-red-500" />
        <p className="text-lg font-semibold text-gray-800">{error}</p>
        <Link to="/candidatures" className="text-blue-700 hover:underline">
          Voir mes candidatures
        </Link>
      </div>
    );
  }

  const content = STATUS_CONTENT[decision.status] || STATUS_CONTENT.received;
  const Icon = content.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <Icon className={`mx-auto text-5xl ${content.color}`} />
        <h1 className="mt-5 text-xl font-bold text-gray-900">{content.title}</h1>
        <p className="mt-3 text-gray-600">
          Poste : <span className="font-semibold">{decision.job_offer_title}</span>
          <br />
          Entreprise : <span className="font-semibold">{decision.company_name}</span>
        </p>
        <Link
          to="/candidatures"
          className="mt-6 inline-block bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
        >
          Voir toutes mes candidatures
        </Link>
      </div>
    </div>
  );
}
