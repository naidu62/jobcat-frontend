"use client";

import Link from "next/link";

export default function JobCard({ job }) {
  return (
    <Link
      href={/jobs/${job.id}}
      className="block transition-transform hover:scale-[1.02]"
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-5 flex flex-col justify-between h-full transition-all duration-200">

        {/* 🧾 Job Title /}
        <h2 className="text-lg font-semibold text-blue-700 mb-2 leading-snug">
          {job.title || "Untitled Job"}
        </h2>

        {/ 🗂️ Category /}
        <p className="text-sm text-gray-600 mb-2 capitalize">
          {job.category || "General"}
        </p>

        {/ 🎓 Qualification /}
        {job.qualification && (
          <p className="text-sm text-gray-700 mb-2">
            🎓 {job.qualification}
          </p>
        )}

        {/ 📅 Last Date /}
        <p className="text-sm text-gray-600 mb-2">
          📅 Last Date:
          <span className="font-semibold text-red-600 ml-1">
            {job.end_date || "N/A"}
          </span>
        </p>

        {/ 👥 Footer */}
        <div className="mt-3 border-t pt-2 text-xs text-gray-500 flex justify-between items-center">
          <span>
            Vacancies:
            <strong className="text-gray-700 ml-1">
              {job.total_vacancies ?? "N/A"}
            </strong>
          </span>

          <span>{job.category || "General"}</span>
        </div>

      </div>
    </Link>
  );
}