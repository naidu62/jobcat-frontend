// app/components/JobCard.jsx
"use client";
import Link from "next/link";

export default function JobCard({ job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block transition-transform transform hover:scale-[1.01]"
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-5 flex flex-col justify-between h-full transition-all duration-200">
        {/* 🧾 Job Title */}
        <h2 className="text-lg font-semibold text-blue-700 mb-2 leading-snug">
          {job.title || "Untitled Job"}
        </h2>

        {/* 🗂️ Category */}
        {job.category && (
          <p className="text-sm text-gray-600 mb-1 capitalize">
            {job.category}
          </p>
        )}

        {/* 📅 Dates */}
        <p className="text-xs text-gray-500">
          {job.start_date && `Starts: ${job.start_date}`}{" "}
          {job.end_date && `| Ends: ${job.end_date}`}
        </p>

        {/* 🕓 Footer Info */}
        <div className="mt-3 border-t pt-2 text-xs text-gray-500 flex justify-between items-center">
          <span>
            Vacancies:{" "}
            <strong className="text-gray-700">
              {job.total_vacancies || "N/A"}
            </strong>
          </span>
          <span>{job.category || "General"}</span>
        </div>
      </div>
    </Link>
  );
}