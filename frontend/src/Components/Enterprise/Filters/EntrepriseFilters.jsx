import React from "react";
import { IoClose } from "react-icons/io5";

const SIZE_OPTIONS = [
  { value: "self", label: "Independant" },
  { value: "1-10", label: "1-10 employes" },
  { value: "11-50", label: "11-50 employes" },
  { value: "51-200", label: "51-200 employes" },
  { value: "201-500", label: "201-500 employes" },
  { value: "500+", label: "500+ employes" },
];

export default function EntrepriseFilters({
  filters,
  setFilters,
  isOpen,
  setIsOpen,
  sectors = ["Banque", "Tech", "Santé", "ONG", "Industrie"],
}) {
  return (
    <>
      {/* BACKDROP (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* FILTER PANEL */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full md:h-max w-72 md:w-64 bg-white 
          shadow-xl md:shadow-md p-6 rounded-none md:rounded-xl z-50 
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Close button mobile */}
        <div className="flex justify-between items-center mb-5 md:hidden">
          <h2 className="text-lg font-semibold">Filtres</h2>
          <button onClick={() => setIsOpen(false)}>
            <IoClose size={28} className="text-gray-700" />
          </button>
        </div>

        {/* Desktop Title */}
        <h2 className="hidden md:block font-semibold text-lg mb-4">Filtres</h2>

        {/* ---- SECTOR ---- */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Secteur</h3>

          {sectors.map((sector) => (
            <label key={sector} className="flex items-center gap-2 mb-2 text-gray-700">
              <input
                type="checkbox"
                checked={filters.sectors.includes(sector)}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sectors: prev.sectors.includes(sector)
                      ? prev.sectors.filter((s) => s !== sector)
                      : [...prev.sectors, sector],
                  }))
                }
              />
              <span>{sector}</span>
            </label>
          ))}
        </div>

        {/* ---- SIZE ---- */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Taille</h3>
          {SIZE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 mb-2 text-gray-700">
              <input
                type="checkbox"
                checked={filters.size.includes(option.value)}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    size: prev.size.includes(option.value)
                      ? prev.size.filter((s) => s !== option.value)
                      : [...prev.size, option.value],
                  }))
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {/* ---- OFFERS ---- */}
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Offres</h3>
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={filters.hasOffers}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  hasOffers: !prev.hasOffers,
                }))
              }
            />
            <span>Avec offres disponibles</span>
          </label>
        </div>
      </div>
    </>
  );
}
