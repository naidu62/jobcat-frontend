"use client";

import JobsList from "../components/JobsList";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function JobsPage() {
  const searchParams = useSearchParams();

  const qualification =
    searchParams.get("qualification");

  const category =
    searchParams.get("category");

  const isFiltered = qualification || category;

  return (
    <div className="max-w-6xl mx-auto px-3 py-4">

      {/* Show title only on /jobs */}
      {!isFiltered && (
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold">
            Latest Jobs
          </h1>

          <p className="text-sm text-gray-600">
            Browse the latest verified jobs.
          </p>
        </header>
      )}

      {/* Filter Pages */}
      {isFiltered && (
        <div className="mb-4">

          <Link
            href="/"
            className="text-blue-600 text-sm hover:underline"
          >
            ← Back to Home
          </Link>

          <h1 className="text-xl font-bold mt-2">
            {qualification &&
              `🎓 ${qualification.toUpperCase()} Jobs`}

            {category &&
              `🏛 ${category.charAt(0).toUpperCase() + category.slice(1)} Jobs`}
          </h1>

        </div>
      )}

      <JobsList />

    </div>
  );
}