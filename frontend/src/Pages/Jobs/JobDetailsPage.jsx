import React, { useEffect, useState } from "react";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { FiMapPin } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";

import ApplyModal from "../../Components/Jobs/ApplyModal";
import FAQ from "../../Components/Jobs/FAQ";
import Gallery from "../../Components/Jobs/Gallery";
import { useAuth } from "../../context/useAuth";
import { apiFetch, apiGetJSON } from "../../lib/api";
import { mapJobOffer } from "../../lib/jobAdapter";

export default function JobDetailsPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openApply, setOpenApply] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiGetJSON(`/api/recruitment/jobs/${id}/`);
        setJob(mapJobOffer(data));
      } catch (err) {
        setError(err.message || "Offre introuvable.");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const toggleSave = async () => {
    if (!isLoggedIn || !job) return;
    try {
      setSavingJob(true);
      if (saved) {
        await apiFetch(`/api/recruitment/saved-jobs/${job.id}/`, { method: "DELETE" });
        setSaved(false);
      } else {
        await apiFetch("/api/recruitment/saved-jobs/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_offer: job.id }),
        });
        setSaved(true);
      }
    } catch {
      // silently ignore, UI stays in previous state
    } finally {
      setSavingJob(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center gap-3 text-gray-600 text-lg">
        <FaSpinner className="animate-spin" /> Chargement de l'offre...
      </div>
    );
  }

  if (error || !job) {
    return <div className="p-10 text-center text-gray-600 text-xl">{error || "Offre introuvable."}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-4">
        <Link to="/jobs" className="text-blue-700 hover:underline font-semibold">
          {"<-"} Retour aux offres
        </Link>
      </div>

      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={job.banner || job.logo}
              alt={job.title}
              className="w-full md:w-1/2 h-64 rounded-xl object-cover"
            />

            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-blue-700 font-medium text-lg">{job.company}</p>

              <div className="flex items-center gap-3 text-gray-600">
                <FiMapPin /> {job.location}
              </div>

              <p className="text-sm text-gray-500">{job.type}</p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setOpenApply(true)}
                  className="bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
                >
                  Postuler
                </button>

                <button
                  onClick={toggleSave}
                  disabled={!isLoggedIn || savingJob}
                  className="border px-5 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 disabled:opacity-60"
                  title={isLoggedIn ? "" : "Connectez-vous pour sauvegarder une offre"}
                >
                  {saved ? <BsBookmarkFill size={18} className="text-blue-700" /> : <BsBookmark size={18} />}
                  {saved ? "Sauvegardée" : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Le poste</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </section>

          {job.profile.length > 0 && (
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Profil recherche</h2>
              <ul className="space-y-2 text-gray-700">
                {job.profile.map((item, index) => (
                  <li key={index}>- {item}</li>
                ))}
              </ul>
            </section>
          )}

          <Gallery job={job} />
          <FAQ />
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-xl p-6 sticky top-10">
            <h3 className="font-bold text-lg mb-3">L'entreprise</h3>
            <p className="text-gray-700">{job.companyDescription || "Aucune description disponible."}</p>
          </div>

          {job.benefits.length > 0 && (
            <div className="bg-white shadow rounded-xl p-6 sticky top-64">
              <h3 className="font-bold text-lg mb-3">Avantages</h3>
              <ul className="space-y-1 text-gray-700">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>- {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ApplyModal open={openApply} setOpen={setOpenApply} job={job} />
    </div>
  );
}
