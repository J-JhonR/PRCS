import React from "react";
import { CiSearch } from "react-icons/ci";
import { FiMapPin } from "react-icons/fi";

export default function JobsSearchBar({
  q,
  setQ,
  location,
  setLocation,
  onSearch,
}) {
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Input principal */}
        <div className="flex items-center gap-3 flex-1 bg-gray-50 rounded-lg px-3 py-2">
          <CiSearch className="text-gray-500" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Job, mot-clé ou entreprise"
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>

        {/* Localisation */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 max-w-xs w-full md:w-auto">
          <FiMapPin className="text-gray-500" size={18} />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Localisation (ex: Haïti)"
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>

        <button
          onClick={onSearch}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-5 py-2 text-sm font-medium transition"
        >
          Rechercher
        </button>
      </div>

      {/* chips filter quick */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {["Télétravail", "CDI", "Temps plein", "Remote"].map((c) => (
          <button
            key={c}
            onClick={() => {
              setQ((prev) => (prev ? prev + " " + c : c));
            }}
            className="text-sm px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 transition"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
