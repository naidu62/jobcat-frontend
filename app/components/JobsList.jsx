"use client";
import React, { useEffect, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [sortOrder, setSortOrder] = useState("desc"); // 👈 New: Sort by latest first
  const router = useRouter();

  // 🧠 Fetch jobs from API
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("https://app.jobcat.in/api/jobs/");
        const data = await response.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      }
    }
    fetchJobs();
  }, []);

  // 🔍 Filter + Search + Sort
  useEffect(() => {
    let updated = [...jobs];

    if (category !== "All") {
      updated = updated.filter(
        (job) => job.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (query.trim()) {
      updated = updated.filter((job) =>
        job.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 🧭 Sort by date (descending = latest first)
    updated.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredJobs(updated);
    setVisibleCount(6);
  }, [category, query, sortOrder, jobs]);

  // 🚀 Load more jobs
  const loadMore = () => setVisibleCount((prev) => prev + 6);

  return (
    <div className="mt-6">
      {/* 🔍 Search bar */}
      <SearchBar query={query} setQuery={setQuery} />

      {/* 🧭 Category Filter */}
      <CategoryFilter selectedCategory={category} onSelect={setCategory} />

      {/* 🔽 Sort Dropdown */}
      <div className="flex justify-end mb-4">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* 🧾 Job List */}
      {filteredJobs.length > 0 ? (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredJobs.slice(0, visibleCount).map((job) => (
              <li
                key={job.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md bg-white hover:bg-gray-50 transition-all relative"
              >
                <h2
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="font-semibold text-lg cursor-pointer text-blue-700 hover:underline"
                >
                  {job.title}
                </h2>
                <p className="text-sm text-gray-600">{job.category}</p>
              </li>
            ))}
          </ul>

          {/* 🔘 Load More Button */}
          {visibleCount < filteredJobs.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Load More Jobs
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