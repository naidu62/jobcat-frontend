// app/jobs/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const response = await fetch(`https://app.jobcat.in/api/jobs/${id}/`);
        const data = await response.json();
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch job details:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchJobDetails();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading job details...</p>;
  if (!job) return <p className="text-center mt-10">Job not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-3">{job.title}</h1>
      <p className="text-gray-600 mb-6">{job.category}</p>

      <div className="border p-4 rounded-md shadow-sm">
        <p><strong>Reference No:</strong> {job.advertisement_ref_no}</p>
        <p><strong>Total Vacancies:</strong> {job.total_vacancies}</p>
        <p><strong>Start Date:</strong> {job.start_date}</p>
        <p><strong>Last Date:</strong> {job.last_date}</p>
      </div>

      <p className="mt-6 text-gray-700">
        More details coming soon. Stay tuned!
      </p>

      <div className="mt-8">
        <a
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back to Jobs
        </a>
      </div>
    </div>
  );
}