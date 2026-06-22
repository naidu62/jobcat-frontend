"use client";

import Link from "next/link";

export default function LatestJobsWidget({ jobs }) {
  const latestJobs = jobs.slice(0, 4);

  if (latestJobs.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">
          🔥 Latest Jobs
        </h2>

        <Link
          href="/jobs"
          className="text-xs text-blue-600"
        >
          View More →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {latestJobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="
              border
              rounded-md
              p-2
              text-xs
              hover:bg-gray-50
              line-clamp-2
            "
          >
            {job.title}
          </Link>
        ))}
      </div>
    </section>
  );
}