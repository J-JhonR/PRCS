import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaSpinner } from "react-icons/fa6";

import CompanyCard from "./CompanyCard";
import { apiGetJSON } from "../../lib/api";
import { countOffersByCompany, mapCompany } from "../../lib/companyAdapter";

export default function ExploreEntreprise() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const [companiesData, jobsData] = await Promise.all([
          apiGetJSON("/api/recruitment/companies/"),
          apiGetJSON("/api/recruitment/jobs/"),
        ]);
        const offerCounts = countOffersByCompany(Array.isArray(jobsData) ? jobsData : jobsData.results || []);
        const list = Array.isArray(companiesData) ? companiesData : companiesData.results || [];
        setCompanies(list.map((company) => mapCompany(company, offerCounts.get(company.id) || 0)));
      } catch {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const sectors = useMemo(() => {
    const unique = [...new Set(companies.map((company) => company.sector).filter(Boolean))];
    return unique.slice(0, 4);
  }, [companies]);

  const filters = [{ key: "all", label: "A decouvrir" }, ...sectors.map((sector) => ({ key: sector, label: sector }))];

  const filteredCompanies =
    activeFilter === "all" ? companies : companies.filter((company) => company.sector === activeFilter);

  return (
    <section className="w-full bg-gray-50 relative pt-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold md:text-4xl text-blue-800 text-center">
          Explorez les entreprises et organisations
        </h2>

        <p className="text-center text-gray-600 mt-3 mb-10 max-w-2xl mx-auto">
          Decouvrez les employeurs qui faconnent l'avenir et trouvez ceux qui vous correspondent vraiment.
        </p>

        {companies.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-5 py-2 rounded-full font-medium transition shadow-sm ${
                  activeFilter === filter.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white border text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-600">
            <FaSpinner className="animate-spin" /> Chargement des entreprises...
          </div>
        ) : companies.length === 0 ? (
          <p className="text-center text-gray-500 pb-16">Aucune entreprise a afficher pour le moment.</p>
        ) : (
          <div className="relative">
            <button
              onClick={() => sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 z-10"
            >
              <IoIosArrowBack size={24} />
            </button>

            <div ref={sliderRef} className="overflow-x-auto scroll-smooth scrollbar-hide pb-4">
              <div className="flex gap-6 w-max">
                {filteredCompanies.map((company) => (
                  <CompanyCard key={company.id} {...company} onClick={() => navigate(`/entreprises/${company.id}`)} />
                ))}
              </div>
            </div>

            <button
              onClick={() => sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 z-10"
            >
              <IoIosArrowForward size={24} />
            </button>
          </div>
        )}

        <div className="text-center mt-10 pb-12">
          <Link
            to="/entreprises"
            className="inline-block px-8 py-3 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-800 transition"
          >
            Acceder a toutes les entreprises {"->"}
          </Link>
        </div>
      </div>
    </section>
  );
}
