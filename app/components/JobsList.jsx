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
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.jobcat.in";

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

  // 🔍 Filter logic
  useEffect(() => {
    let result = jobs;

    // 🔎 Search filter
    if (search.trim() !== "") {
      result = result.filter((job) =>
        job.job_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 📦 Category filter (SAFE matching)
    if (category !== "all") {
      result = result.filter((job) => {
        const cat = job.job_category?.toLowerCase() || "";

        if (category === "government") return cat.includes("gov");
        if (category === "private") return cat.includes("private");
        if (category === "railway") return cat.includes("railway");
        if (category === "defence") return cat.includes("defence");
        if (category === "bank") return cat.includes("bank");

        return true;
      });
    }

    setFilteredJobs(result);
  }, [search, category, jobs]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading jobs...</p>;
  }

  return (
    <div className="space-y-6">

      {/* 🔍 Search Bar */}
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 📦 Category Blocks (CENTERED) */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {[
          { label: "All", value: "all" },
          { label: "Govt Jobs", value: "government" },
          { label: "Railway", value: "railway" },
          { label: "Police/Defence", value: "defence" },
          { label: "Bank", value: "bank" },
          { label: "Private", value: "private" },
        ].map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              category === cat.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
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