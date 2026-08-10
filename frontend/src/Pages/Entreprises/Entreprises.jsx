import React, { useEffect, useMemo, useState } from "react";
import SearchBar from "../../Components/Enterprise/SearchBar/SearchBar";
import EntrepriseFilters from "../../Components/Enterprise/Filters/EntrepriseFilters";
import EntrepriseCard from "../../Components/Enterprise/Cards/EntrepriseCard";
import { apiGetJSON } from "../../lib/api";
import { countOffersByCompany, mapCompany } from "../../lib/companyAdapter";
import { FaBars, FaSpinner } from "react-icons/fa";

export default function Entreprises() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    sectors: [],
    size: [],
    hasOffers: false,
  });

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
      } catch (err) {
        setError(err.message || "Impossible de charger les entreprises.");
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const availableSectors = useMemo(
    () => [...new Set(companies.map((c) => c.sector).filter(Boolean))],
    [companies]
  );

  const filtered = companies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase());

    const matchLocation =
      location.trim() === "" ||
      c.location.toLowerCase().includes(location.toLowerCase());

    const matchSector =
      filters.sectors.length === 0 || filters.sectors.includes(c.sector);

    const matchSize =
      filters.size.length === 0 || filters.size.includes(c.sizeCode);

    const matchOffers = !filters.hasOffers || c.offers > 0;

    return matchSearch && matchLocation && matchSector && matchSize && matchOffers;
  });

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">

        {/* SearchBar */}
        <SearchBar
          onSearch={setSearch}
          onLocationChange={setLocation}
        />

        {/* Mobile filter button */}
        <button
          className="md:hidden mt-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setIsFiltersOpen(true)}
        >
          <FaBars /> Filtres
        </button>

        <div className="flex gap-6 mt-8">

          {/* FILTER PANEL */}
          <EntrepriseFilters
            filters={filters}
            setFilters={setFilters}
            isOpen={isFiltersOpen}
            setIsOpen={setIsFiltersOpen}
            sectors={availableSectors}
          />

          {/* GRID */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center gap-3 py-16 text-gray-600">
              <FaSpinner className="animate-spin" /> Chargement des entreprises...
            </div>
          ) : error ? (
            <p className="flex-1 p-6 bg-white rounded-lg shadow text-center text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="flex-1 p-6 bg-white rounded-lg shadow text-center">Aucune entreprise trouvée…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              {filtered.map((item) => (
                <EntrepriseCard key={item.id} item={item} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
