"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import JobGrid from "./JobGrid";
import Fuse from "fuse.js";
import { useDebounce } from "use-debounce";

export default function JobsList({ query = "" }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const jobsPerPage = 25;

  const searchParams = useSearchParams();
  const qualificationParam = searchParams.get("qualification")?.toLowerCase() || "";
  const categoryParam = searchParams.get("category")?.toLowerCase() || "";

  const [debouncedQuery] = useDebounce(query, 300);
  const hasSearch = debouncedQuery?.trim();

  // Fetch jobs
  useEffect(() => {
    async function fetchJobs() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.jobcat.in";
        const res = await fetch(`${API_BASE}/api/jobs/`, { cache: "no-store" });
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

  // Filter jobs
  useEffect(() => {
    let result = jobs;

    if (qualificationParam) {
      result = result.filter((job) =>
        (job.qualification || "").toLowerCase().includes(qualificationParam)
      );
    }

    if (categoryParam) {
      result = result.filter((job) =>
        (job.category || "").toLowerCase().includes(categoryParam)
      );
    }

    if (hasSearch) {
      const fuse = new Fuse(result, {
        keys: [
          "title",
          "category",
          "qualification"
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: true,
      });
      result = fuse.search(debouncedQuery).map((item) => item.item);
    }

    setFilteredJobs(result);
  }, [jobs, debouncedQuery, qualificationParam, categoryParam]);

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, qualificationParam, categoryParam]);

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));

  if (loading) {
    return <p className="text-center text-gray-500">Loading jobs...</p>;
  }

  return (
    <div className="space-y-5">
      {hasSearch ? (
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-gray-800">
            Results for "{debouncedQuery}"
          </h2>
          <p className="text-sm text-gray-500">{filteredJobs.length} jobs found</p>
        </div>
      ) : (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
          </div>
          <div>
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>
        </div>
      )}

      <JobGrid jobs={currentJobs} />

      {!hasSearch && (
        <div className="flex flex-wrap justify-center items-center gap-2 pt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            ← Prev
          </button>

          {[...Array(totalPages)]
            .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
            .map((_, index) => {
              const pageNumber = Math.max(0, currentPage - 3) + index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNumber ? "bg-blue-600 text-white" : "border"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
