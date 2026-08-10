import React from "react";
import { FaUsers } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";

const DEFAULT_LOGO = "/logos/default.png";
const DEFAULT_BANNER = "/banners/default.JPG";

export default function EntrepriseCard({ item }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 max-w-sm">
      <div className="relative w-full h-32 overflow-hidden rounded-t-2xl">
        <img
          src={item.banner || DEFAULT_BANNER}
          onError={(e) => (e.target.src = DEFAULT_BANNER)}
          alt={item.name}
          className="w-full h-full object-cover scale-105 hover:scale-110 transition-all duration-500"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={item.logo || DEFAULT_LOGO}
            onError={(e) => (e.target.src = DEFAULT_LOGO)}
            alt={item.name}
            className="h-10 w-10 object-contain rounded-md p-1 bg-white shadow-sm"
          />

          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.sector}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mt-3">
          <FiMapPin className="text-gray-500" />
          {item.location}
        </div>

        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mt-1">
          <FaUsers className="text-blue-600" />
          {item.employees}
        </div>

        <Link
          to={`/entreprises/${item.id}`}
          className="block text-center w-full mt-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Voir profil {"->"}
        </Link>
      </div>
    </div>
  );
}
