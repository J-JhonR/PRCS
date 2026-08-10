import React from "react";
import { FiMapPin } from "react-icons/fi";
import { FaPeopleGroup } from "react-icons/fa6";
import { SiStatista } from "react-icons/si";

export default function CompanyCard({ name, sector, location, employees, offers, logo, onClick }) {
  const defaultLogo = "/logos/default.png";

  return (
    <div
      onClick={onClick}
      className="w-[300px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 cursor-pointer group overflow-hidden"
    >
      {/* LOGO */}
      <div className="relative w-full h-[160px] bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={logo || defaultLogo}
          onError={(e) => (e.target.src = defaultLogo)}
          alt={name}
          className="max-h-full max-w-full object-contain p-5 transition-transform duration-300 group-hover:scale-110"
        />

        {/* GRADIENT HOVER */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition bg-gradient-to-br from-blue-600 to-blue-400"></div>
      </div>

      {/* INFO */}
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-xl text-gray-900">{name}</h3>

        <p className="flex items-center gap-2 text-sm text-gray-600">
          <SiStatista className="text-blue-700" size={16} /> {sector}
        </p>

        <p className="flex items-center gap-2 text-sm text-gray-500">
          <FiMapPin className="text-blue-700" size={16} /> {location}
        </p>

        <p className="flex items-center gap-2 text-sm text-blue-700 font-medium">
          <FaPeopleGroup size={16} /> {employees}
        </p>

        <p className="text-sm text-green-600 font-semibold">
          {offers} offres disponibles
        </p>

        {/* BUTTON */}
        <button
          className="mt-3 w-full py-2 rounded-lg border border-blue-600 text-blue-600 font-medium
          hover:bg-blue-600 hover:text-white transition"
        >
          Voir profil entreprise
        </button>
      </div>
    </div>
  );
}
