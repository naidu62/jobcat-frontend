"use client";

import JobCard from "./JobCard";

export default function JobGrid({ jobs }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        😔 No jobs found.
        <br />
        Try another category or search term.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}