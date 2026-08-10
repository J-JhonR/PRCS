// src/pages/Jobs/JobsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobsSearchBar from "../../Components/Jobs/JobsSearchBar";
import JobsFilters from "../../Components/Jobs/JobFilters";
import JobCard from "../../Components/Jobs/JobCard";
import { apiGetJSON } from "../../lib/api";
import { mapJobOffer } from "../../lib/jobAdapter";

import { BsGridFill } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    sectors: [],
    types: [],
    remote: false,
  });

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await apiGetJSON("/api/recruitment/jobs/");
        const list = Array.isArray(data) ? data : data.results || [];
        setJobs(list.map(mapJobOffer));
      } catch (err) {
        setError(err.message || "Impossible de charger les offres.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => {
      const matchQ = q === "" || j.title.toLowerCase().includes(q.toLowerCase());
      const matchLoc = location === "" || j.location.toLowerCase().includes(location.toLowerCase());

      const matchSector =
        filters.sectors.length === 0 ||
        filters.sectors.some((sector) => j.sector.toLowerCase().includes(sector.toLowerCase()));

      const matchType = filters.types.length === 0 || filters.types.includes(j.type);

      const matchRemote = !filters.remote || j.workplace_type === "remote";

      return matchQ && matchLoc && matchSector && matchType && matchRemote;
    });

    if (sort === "recent") {
      list = [...list].sort((a, b) => b.id - a.id);
    }

    if (sort === "random") {
      list = [...list].sort(() => Math.random() - 0.5);
    }

    return list;
  }, [jobs, q, location, filters, sort]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">
            Jobs <span className="text-blue-600">({filtered.length})</span>
          </h1>

          {/* Sort + View */}
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border px-3 py-2 rounded-lg"
            >
              <option value="recent">Trier par date</option>
              <option value="random">Au hasard</option>
            </select>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md border ${
                viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <BsGridFill size={18} />
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md border ${
                viewMode === "list" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              <FaListUl size={18} />
            </button>

            <button
              onClick={() => setFiltersOpen(true)}
              className="p-2 border rounded-md md:hidden"
            >
              Filtres
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <JobsSearchBar
          q={q}
          setQ={setQ}
          location={location}
          setLocation={setLocation}
        />

        <div className="flex gap-6">

          {/* DESKTOP FILTER */}
<div className="hidden md:block md:w-72">
  <JobsFilters filters={filters} setFilters={setFilters} />
</div>

{/* MOBILE FILTER (slide-in) */}
<div className="md:hidden">
  <JobsFilters
    filters={filters}
    setFilters={setFilters}
    open={filtersOpen}
    setOpen={setFiltersOpen}
  />
</div>


          <div className="flex-1">
            {loading ? (
              <div className="p-10 flex items-center justify-center gap-3 text-gray-600">
                <FaSpinner className="animate-spin" /> Chargement des offres...
              </div>
            ) : error ? (
              <p className="p-6 bg-white rounded-lg shadow text-center text-red-600">{error}</p>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filtered.length === 0 ? (
                  <p className="p-6 bg-white rounded-lg shadow text-center">Aucun job trouvé…</p>
                ) : (
                  filtered.map((job) => (
                    <JobCard key={job.id} job={job} mode={viewMode} />
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
