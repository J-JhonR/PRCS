import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaBriefcase, FaGlobe, FaMapMarkerAlt, FaSpinner, FaUsers } from "react-icons/fa";

import JobCard from "../../Components/Jobs/JobCard";
import { apiGetJSON } from "../../lib/api";
import { getVideoEmbedUrl, mapCompany, SIZE_LABELS } from "../../lib/companyAdapter";
import { mapJobOffer } from "../../lib/jobAdapter";

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        setError(null);
        const [companyData, jobsData] = await Promise.all([
          apiGetJSON(`/api/recruitment/companies/${id}/`),
          apiGetJSON(`/api/recruitment/jobs/?company=${id}`),
        ]);
        setCompany(mapCompany(companyData));
        const list = Array.isArray(jobsData) ? jobsData : jobsData.results || [];
        setJobs(list.map(mapJobOffer));
      } catch (err) {
        setError(err.message || "Entreprise introuvable.");
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center gap-3 text-gray-600 text-lg">
        <FaSpinner className="animate-spin" /> Chargement...
      </div>
    );
  }

  if (error || !company) {
    return <div className="p-16 text-center text-gray-600 text-xl">{error || "Entreprise introuvable."}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="h-56 w-full overflow-hidden bg-blue-100">
        <img src={company.banner || "/banners/default.JPG"} alt={company.name} className="h-full w-full object-cover" />
      </div>

      <div className="container mx-auto px-4">
        <div className="-mt-16 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <img
            src={company.logo || "/logos/default.png"}
            alt={company.name}
            className="h-28 w-28 rounded-2xl border-4 border-white bg-white object-contain p-2 shadow-lg"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-blue-700 font-medium">{company.sector}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">A propos</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {company.description || "Aucune description disponible pour le moment."}
              </p>
            </section>

            {(getVideoEmbedUrl(company.videoUrl) || company.photos.length > 0) && (
              <section className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Découvrir l'entreprise</h2>

                {getVideoEmbedUrl(company.videoUrl) && (
                  <div className="mb-6 aspect-video w-full overflow-hidden rounded-lg">
                    <iframe
                      src={getVideoEmbedUrl(company.videoUrl)}
                      title={`Video de presentation - ${company.name}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {company.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {company.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.caption || company.name}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Offres publiées ({jobs.length})</h2>
              {jobs.length === 0 ? (
                <p className="text-gray-500">Aucune offre active pour le moment.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} mode="grid" />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="bg-white shadow rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-blue-600" /> {company.location}
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FaUsers className="text-blue-600" /> {SIZE_LABELS[company.sizeCode] || company.employees}
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FaBriefcase className="text-blue-600" /> {jobs.length} offre(s) publiée(s)
              </div>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-700 hover:underline"
                >
                  <FaGlobe /> Site web
                </a>
              )}
            </div>
            <Link
              to="/entreprises"
              className="block text-center bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-800 transition"
            >
              Voir toutes les entreprises
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
