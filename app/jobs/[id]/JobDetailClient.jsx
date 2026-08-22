"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobDetails from "@/app/components/JobDetails";
import TrackApplicationPanel from "@/app/components/TrackApplicationPanel";
import { adaptJob } from "@/lib/jobAdapter";
import { getJobDetails } from "@/lib/api";

export default function JobDetailClient({ id }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        const raw = await getJobDetails(id);
        const adapted = adaptJob(raw);

        setJob(adapted);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10">Loading job...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  if (!job) {
    return <p className="text-center py-10">Job not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-block mb-6 px-4 py-2 border rounded"
      >
        ← Back
      </Link>

      <JobDetails job={job} />

      <TrackApplicationPanel jobId={id} />
    </div>
  );
}
