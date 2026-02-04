"use client";

import { useEffect, useState } from "react";
import JobCard from "./JobCard";
import { adaptJob } from "@/lib/jobAdapter";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.jobcat.in";

      try {
        const res = await fetch(`${API_BASE}/api/jobs/`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // ✅ STEP 7.3 FIX (THIS IS THE KEY)
        if (Array.isArray(data)) {
          const adapted = data.map(adaptJob);
          setJobs(adapted);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error("Jobs fetch error:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading jobs...</p>;
  }

  if (jobs.length === 0) {
    return <p className="text-center text-gray-500">No jobs found</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}