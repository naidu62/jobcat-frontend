"use client";
import Link from "next/link";

export default function JobCard({ job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block transition-transform hover:scale-[1.01]"
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-5 flex flex-col justify-between h-full">

        {/* ✅ Job Title */}
        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          {job.job_title}
        </h2>

        {/* ✅ Category */}
        {job.job_category && (
          <p className="text-sm text-gray-600 mb-1">
            {job.job_category}
          </p>
        )}

        {/* ✅ Dates */}
        <p className="text-xs text-gray-500">
          {job.application_start_date && `Starts: ${job.application_start_date}`}{" "}
          {job.application_end_date && `| Ends: ${job.application_end_date}`}
        </p>

        {/* ✅ Footer */}
        <div className="mt-3 border-t pt-2 text-xs text-gray-500 flex justify-between">
          <span>
            Vacancies:{" "}
            <strong className="text-gray-700">
              {job.details?.no_of_posts ?? "N/A"}
            </strong>
          </span>
          <span>{job.job_type}</span>
        </div>

      </div>
    </Link>
  );
}