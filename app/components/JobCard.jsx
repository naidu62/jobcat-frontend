"use client";
import Link from "next/link";

export default function JobCard({ job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block transition-transform hover:scale-[1.01]"
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-5 flex flex-col justify-between h-full">

        <h2 className="text-lg font-semibold text-blue-700 mb-2">
          {job.title}
        </h2>

        {job.category && (
          <p className="text-sm text-gray-600 mb-1">
            {job.category}
          </p>
        )}

        <p className="text-xs text-gray-500">
          {job.startDate && `Starts: ${job.startDate}`}{" "}
          {job.endDate && `| Ends: ${job.endDate}`}
        </p>

        <div className="mt-3 border-t pt-2 text-xs text-gray-500 flex justify-between">
          <span>
            Vacancies:{" "}
            <strong className="text-gray-700">
              {job.vacancies ?? "N/A"}
            </strong>
          </span>
          <span>{job.type}</span>
        </div>

      </div>
    </Link>
  );
}