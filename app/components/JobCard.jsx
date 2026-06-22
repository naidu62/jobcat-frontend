"use client";

import Link from "next/link";

export default function JobCard({ job }) {
  return (
    <div className="bg-white border rounded-xl p-2 shadow-sm hover:shadow-md transition">

      {/* Top badges */}
      <div className="flex justify-between items-center mb-1">
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
          NEW
        </span>

        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
          {job.category || "General"}
        </span>
      </div>

      {/* Title */}
      <Link href={`/jobs/${job.id}`}>
        <h2 className="text-sm font-bold text-blue-700 leading-5 mb-1 hover:underline line-clamp-2">
          {job.title || "Untitled Job"}
        </h2>
      </Link>

      {/* Information */}
      <div className="mt-3 space-y-0.5 text-xs text-gray-700">

        {job.qualification && (
          <p>
            🎓 {job.qualification}
          </p>
        )}

        <p>
          📅 Last Date:
          <span className="font-medium text-red-600 ml-1">
            {job.end_date || "N/A"}
          </span>
        </p>

        <p>
          👥 Vacancies:
          <span className="font-medium ml-1">
            {job.total_vacancies ?? "N/A"}
          </span>
        </p>

      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-2">

        <Link
          href={`/jobs/${job.id}`}
          className="text-center border border-blue-600 text-blue-600 text-xs py-1.5 rounded-md hover:bg-blue-50"
        >
          Details
        </Link>

        {job.apply_online_link ? (
          <a
            href={job.apply_online_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700"
          >
            Apply
          </a>
        ) : (
          <div className="text-center bg-gray-200 text-gray-500 text-xs py-2 rounded-lg">
            Closed
          </div>
        )}

      </div>

    </div>
  );
}