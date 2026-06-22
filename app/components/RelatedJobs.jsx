"use client";

import { useEffect, useState } from "react";
import JobGrid from "./JobGrid";

export default function RelatedJobs({ currentJob }) {
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://app.jobcat.in";

        const res = await fetch(
          `${API_BASE}/api/jobs/`
        );

        const data = await res.json();

        if (!Array.isArray(data)) return;

        const filtered = data
          .filter(
            (job) =>
              job.id !== currentJob.id &&
              job.category === currentJob.category
          )
          .slice(0, 3);

        setRelatedJobs(filtered);
      } catch (err) {
        console.error(err);
      }
    }

    fetchJobs();
  }, [currentJob]);

  if (relatedJobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">

      <h2 className="text-2xl font-bold">
        Related Jobs
      </h2>

      <JobGrid jobs={relatedJobs} />

    </div>
  );
}