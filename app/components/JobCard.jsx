"use client";

import Link from "next/link";

export default function JobCard({ job }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col justify-between h-full transition-transform hover:scale-[1.02]">

      {/* Title */}
      <Link href={`/jobs/${job.id}`}>
        <h2 className="text-lg font-bold text-blue-700 mb-2 line-clamp-2 cursor-pointer hover:underline">
          {job.title || "Untitled Job"}
        </h2>
      </Link>

      {/* Category */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
          {job.category || "General"}
        </span>
      </div>

      {/* Qualification */}
      {job.qualification && (
        <p className="text-sm text-gray-700 mb-2">
          🎓 {job.qualification}
        </p>
      )}

      {/* Last Date */}
      <p className="text-sm text-gray-600 mb-2">
        📅 Last Date:{" "}
        <span className="font-semibold text-red-600">
          {job.end_date || "N/A"}
        </span>
      </p>

      {/* Vacancies */}
      <div className="flex justify-between text-xs text-gray-600 border-t pt-2 mt-2">
        <span>
          👥 Vacancies:{" "}
          <strong>{job.total_vacancies ?? "N/A"}</strong>
        </span>

        <span>
          📂 {job.category || "General"}
        </span>
      </div>

      {/* View Details Button */}
      <Link
        href={`/jobs/${job.id}`}
        className="mt-3 block text-center text-sm border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition"
      >
        View Details
      </Link>

      {/* Apply Button */}
      {job.apply_online_link && (
        <a
          href={job.apply_online_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-sm bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Apply Now
        </a>
      )}
    </div>
  );
}