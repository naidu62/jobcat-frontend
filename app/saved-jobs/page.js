"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "../components/JobCard";
import { isAuthenticated } from "@/lib/auth";
import { listSavedJobs, onSavedSync } from "@/lib/saved";

export default function SavedJobsPage() {
  const [authState, setAuthState] = useState("checking"); // checking|anon|ready
  const [rows, setRows] = useState(null); // [{ id, job, created_at }]
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthState("anon");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await listSavedJobs();
        if (cancelled) return;
        setRows(data);
        setAuthState("ready");
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load your saved jobs.");
          setRows([]);
          setAuthState("ready");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep in step when a job is saved/unsaved from any card on this page
  useEffect(() => {
    if (authState !== "ready") return undefined;
    return onSavedSync(() => {
      listSavedJobs()
        .then(setRows)
        .catch(() => {});
    });
  }, [authState]);

  if (authState === "anon") {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to keep track of the jobs you care about.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href="/login?next=/saved-jobs"
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (authState !== "ready" || rows === null) {
    return (
      <div className="max-w-7xl mx-auto mt-10 mb-16 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const jobs = rows.map((r) => r?.job).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto mt-10 mb-16 px-4 sm:px-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-sm text-gray-600 mt-1">
            {jobs.length === 0
              ? "Your bookmarked jobs will appear here."
              : `${jobs.length} job${jobs.length === 1 ? "" : "s"} saved`}
          </p>
        </div>
        <Link
          href="/jobs"
          className="min-h-[44px] inline-flex items-center px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          Browse Jobs
        </Link>
      </div>

      {error && (
        <p className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-12 h-12 mx-auto text-gray-300"
            aria-hidden="true"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No saved jobs yet
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
            Tap the bookmark icon on any job card to save it here for later.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-[44px] items-center px-5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            Find Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.slug || job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
