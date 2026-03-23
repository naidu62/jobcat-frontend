"use client";
import Link from "next/link";

export default function JobCard({ job }) {
  const details = job.details || {};

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block transition-transform hover:scale-[1.02]"
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col justify-between h-full">

        {/* 🧾 Title */}
        <h2 className="text-lg font-bold text-blue-700 mb-2 line-clamp-2">
          {job.job_title}
        </h2>

        {/* 🏷 Category + Type */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
            {job.job_category || "General"}
          </span>

          <span className="text-xs font-semibold text-purple-600">
            {job.job_type?.toUpperCase()}
          </span>
        </div>

        {/* 🎓 Qualification */}
        {details.qualification_text && (
          <p className="text-sm text-gray-700 mb-2">
            🎓 {details.qualification_text}
          </p>
        )}

        {/* 📅 Last Date */}
        <p className="text-sm text-gray-600 mb-2">
          📅 Last Date:{" "}
          <span className="font-semibold text-red-600">
            {job.application_end_date || "N/A"}
          </span>
        </p>

        {/* 👥 Vacancies + Age */}
        <div className="flex justify-between text-xs text-gray-600 border-t pt-2 mt-2">
          <span>
            👥 Vacancies:{" "}
            <strong>{details.no_of_posts ?? "N/A"}</strong>
          </span>

          <span>
            🎂 Age: {details.age_limit_text || "N/A"}
          </span>
        </div>

        {/* 🚀 Apply Button */}
        {job.apply_url && (
          <div className="mt-3">
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Apply Now
            </a>
          </div>
        )}

      </div>
    </Link>
  );
}