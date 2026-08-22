"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "../components/JobCard";
import { isAuthenticated } from "@/lib/auth";
import { fetchRecommendations } from "@/lib/platform";

export default function RecommendationsPage() {
  const [authState, setAuthState] = useState("checking"); // checking|anon|ready
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthState("anon");
      return;
    }
    let cancelled = false;
    fetchRecommendations(18)
      .then((data) => {
        if (!cancelled) {
          setJobs(data);
          setAuthState("ready");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Could not load recommendations.");
          setJobs([]);
          setAuthState("ready");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "anon") {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to see jobs picked for you based on your profile, saves and
          applications.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/login?next=/recommendations" className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (authState !== "ready" || jobs === null) {
    return (
      <div className="max-w-7xl mx-auto mt-10 mb-16 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 mb-16 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Recommended for you</h1>
      <p className="mt-1 text-sm text-gray-600">
        Based on your profile, saved jobs, applications and activity.
      </p>

      {error && (
        <p className="mt-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {jobs.length === 0 ? (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">No recommendations yet</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            Complete your profile (education, skills, location) and save a few
            jobs — recommendations improve as we learn what you like.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link href="/profile" className="min-h-[44px] inline-flex items-center px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
              Complete profile
            </Link>
            <Link href="/jobs" className="min-h-[44px] inline-flex items-center px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Browse jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.slug || job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
