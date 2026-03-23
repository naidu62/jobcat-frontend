"use client";
import { useEffect, useState } from "react";
import JobCard from "./JobCard";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // 🔄 Fetch jobs
  useEffect(() => {
    async function fetchJobs() {
      try {
        const API_BASE = "http://127.0.0.1:8001";

        const res = await fetch(`${API_BASE}/api/jobs/`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setJobs(data);
          setFilteredJobs(data);
        } else {
          setJobs([]);
          setFilteredJobs([]);
        }
      } catch (err) {
        console.error("Jobs fetch error:", err);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // 🔍 Filter logic (ONLY LOGIC HERE)
  useEffect(() => {
    let result = jobs;

    // 🔎 Search filter
    if (search) {
      result = result.filter((job) =>
        job.job_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 📦 Category filter
    if (category !== "all") {
      result = result.filter(
        (job) =>
          job.job_category &&
          job.job_category.toLowerCase().includes(category)
      );
    }

    setFilteredJobs(result);
  }, [search, category, jobs]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading jobs...</p>;
  }

  return (
    <div className="space-y-6">

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 📦 Category Cards */}
      <div className="mt-2 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {[
            { label: "All", value: "all" },
            { label: "Govt Jobs", value: "government" },
            { label: "Railway", value: "railway" },
            { label: "Defence", value: "defence" },
            { label: "Bank", value: "bank" },
            { label: "Private", value: "private" },
          ].map((cat) => (
            <div
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition ${
                category === cat.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:scale-105"
              }`}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </div>

      {/* 📊 Results */}
      {filteredJobs.length === 0 ? (
        <p className="text-center text-gray-500">No jobs found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
