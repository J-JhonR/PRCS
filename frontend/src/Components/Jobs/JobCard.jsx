import React from "react";
import { FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function JobCard({ job, mode = "grid" }) {
  return (
    <article
      className={`bg-white rounded-xl shadow-sm overflow-hidden transition hover:shadow-lg ${
        mode === "list" ? "flex flex-col md:flex-row items-stretch" : ""
      }`}
    >
      <div className={`${mode === "list" ? "md:w-1/3" : ""}`}>
        <img
          src={job.banner || job.logo}
          alt={job.title}
          className="w-full h-36 object-cover"
        />
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-blue-600 font-medium">{job.company}</p>
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{job.sector}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{job.type}</p>
            <p className="text-xs text-gray-400">{job.posted} ago</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <FiMapPin /> {job.location}
          </span>
          {job.salary && <span className="text-blue-700 font-medium">{job.salary}</span>}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{job.seniority}</div>
          <Link
            to={`/jobs/${job.id}`}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            Voir l'offre
          </Link>
        </div>
      </div>
    </article>
  );
}
