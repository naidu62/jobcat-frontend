"use client";
import { useEffect, useState } from "react";
import JobCard from "./JobCard";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);

  // 🌍 Fetch Jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://app.jobcat.in";
        const res = await fetch(`${API_BASE}/api/jobs/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("❌ Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // 🔍 Filter & Search
  useEffect(() => {
    let updated = [...jobs];

    if (category !== "All") {
      updated = updated.filter(
        (job) => job.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (query.trim()) {
  const q = query.toLowerCase();
  updated = updated.filter((job) =>
    (job.title && job.title.toLowerCase().includes(q)) ||
    (job.category && job.category.toLowerCase().includes(q)) ||
    (job.qualification && job.qualification.toLowerCase().includes(q))
  );
}

    setFilteredJobs(updated);
    setVisibleCount(6);
  }, [category, query, jobs]);

  const loadMore = () => setVisibleCount((prev) => prev + 6);

  // 🧩 Loading State
  if (loading)
    return (
      <p className="text-center text-gray-500 py-10 animate-pulse">
        Loading jobs...
      </p>
    );

  return (
    <div className="mt-6">
      {/* 🔍 Search bar */}
      <SearchBar query={query} setQuery={setQuery} />

      {/* 🧭 Category Filter */}
      <CategoryFilter selectedCategory={category} onSelect={setCategory} />

      {/* 🧾 Job List */}
      {filteredJobs.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredJobs.slice(0, visibleCount).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* 🔘 Load More */}
          {visibleCount < filteredJobs.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No jobs found for this search or category.
        </p>
      )}
    </div>
  );
}