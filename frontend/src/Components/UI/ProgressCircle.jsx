import React from "react";

export default function ProgressCircle({ progress }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const finished = progress >= 100;

  return (
    <svg width="60" height="60" className="transition-all">
      {/* Fond */}
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth="5"
        fill="transparent"
      />

      {/* Progression */}
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke={finished ? "#16a34a" : "#2563eb"}
        strokeWidth="5"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
        }}
      />

      {/* Texte */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        className="text-xs font-semibold fill-gray-700"
      >
        {finished ? "✓" : `${progress}%`}
      </text>
    </svg>
  );
}
