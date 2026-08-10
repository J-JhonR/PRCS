import React from "react";
import { CiSearch } from "react-icons/ci";
import { FiMapPin } from "react-icons/fi";

export default function SearchBar({ onSearch, onLocationChange }) {
  return (
    <div className="w-full bg-white shadow-md p-3 rounded-xl flex gap-4 items-center">

      {/* Recherche entreprise */}
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg flex-1">
        <CiSearch size={20} className="text-gray-500" />
        <input
          type="text"
          placeholder="Recherchez une entreprise, un secteur..."
          className="bg-transparent w-full outline-none"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Localisation */}
      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg flex-1 max-w-xs">
        <FiMapPin size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Localisation (ex: Haïti)"
          className="bg-transparent w-full outline-none"
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
        Rechercher
      </button>
    </div>
  );
}
