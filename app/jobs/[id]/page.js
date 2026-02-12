"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import JobDetails from "@/app/components/JobDetails";
import { adaptJob } from "@/lib/jobAdapter";

export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.jobcat.in";

        const res = await fetch(`${API_BASE}/api/jobs/${id}/`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch job");
        }

        const raw = await res.json();
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
    </div>
  );
}
