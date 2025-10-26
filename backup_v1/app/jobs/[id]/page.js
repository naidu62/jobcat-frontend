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

  // 🧠 Fetch single job from API
  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const res = await fetch(`https://app.jobcat.in/api/jobs/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch job");
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error("❌ Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ⏳ Loading state
  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading job details...</p>;

  // 🚫 Not found
  if (!job)
    return <p className="text-center py-10 text-red-500">Job not found.</p>;

  // ✅ Main render
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* 🔙 Back to Jobs Button */}
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