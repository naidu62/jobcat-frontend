// app/jobs/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import JobDetails from "@/app/components/JobDetails";

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

        if (res.status === 404) {
          setJob(null);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error("❌ Error fetching job:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ⏳ Loading
  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500">
        Loading job details...
      </p>
    );
  }

  // 🚫 Not Found
  if (!job) {
    return (
      <p className="text-center py-10 text-red-500">
        Job not found.
      </p>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        {error}
      </p>
    );
  }

  // ✅ Success
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 🔙 Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-block px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          ← Back to Jobs
        </Link>
      </div>

      {/* 🧾 Job Details */}
      <JobDetails job={job} />
    </div>
  );
}