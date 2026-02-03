"use client";

import { useEffect, useState } from "react";
import JobCard from "./JobCard";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";

const API_BASE = "https://app.jobcat.in"; // 🔒 HARD LOCKED

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log("🚀 Fetching from:", `${API_BASE}/api/jobs/`);

        const res = await fetch(`${API_BASE}/api/jobs/`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("❌ Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let updated = [...jobs];

    if (category !== "All") {
      updated = updated.filter(
        (job) =>
          job.job_category &&
          job.job_category.toLowerCase() === category.toLowerCase()
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      updated = updated.filter(
        (job) =>
          job.job_title?.toLowerCase().includes(q) ||
          job.job_category?.toLowerCase().includes(q)
      );
    }

    setFilteredJobs(updated);
    setVisibleCount(6);
  }, [category, query, jobs]);

  if (loading) {
    return (
      <p className="text-center text-gray-500 py-10 animate-pulse">
        Loading jobs...
      </p>
    );
  }

  return (
    <div className="mt-6">
      <SearchBar query={query} setQuery={setQuery} />
      <CategoryFilter selectedCategory={category} onSelect={setCategory} />

      {filteredJobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredJobs.slice(0, visibleCount).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No jobs found for this search or category.
        </p>
      )}
    </div>
  );
}