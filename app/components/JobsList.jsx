"use client";
import { useEffect, useState } from "react";
import JobCard from "./JobCard";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/`,
          { cache: "no-store" }
        );

        const data = await res.json();

        // ✅ IMPORTANT FIX
        if (Array.isArray(data)) {
          setJobs(data);
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