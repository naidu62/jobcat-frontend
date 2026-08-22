// app/search/page.js
// Universal search results — queries Jobs + Schemes + Scholarships in
// parallel via lib/search.js (fan-out to existing APIs today, ready for
// a unified search endpoint tomorrow).

import HeroSearch from "../components/HeroSearch";
import JobCard from "../components/JobCard";
import SchemeCard from "../components/SchemeCard";
import ScholarshipCard from "../components/ScholarshipCard";
import { searchAll } from "@/lib/search";

export const metadata = {
  title: "Search",
  description:
    "Search government jobs, private jobs, schemes and scholarships in one place.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = String(params?.q ?? "").trim();
  const results = q ? await searchAll(q) : null;
  const total = results?.total ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Search box (prefilled with current query) */}
      <div className="mb-8">
        <HeroSearch defaultValue={q} />
      </div>

      {!q ? (
        <p className="text-center text-gray-500 py-12">
          Type something above to search jobs, schemes and scholarships.
        </p>
      ) : (
        <>
          <p
            className="text-sm text-gray-600 mb-8"
            role="status"
            aria-live="polite"
          >
            {total > 0 ? (
              <>
                {total} result{total === 1 ? "" : "s"} for{" "}
                <strong className="text-gray-900">“{q}”</strong>
              </>
            ) : (
              <>
                No results for <strong className="text-gray-900">“{q}”</strong>
                {" "}— try a different keyword like “Railway” or “scholarship”.
              </>
            )}
          </p>

          <div className="space-y-12">
            {/* Jobs */}
            {results.jobs.length > 0 && (
              <section aria-labelledby="search-jobs-heading">
                <h2
                  id="search-jobs-heading"
                  className="text-lg sm:text-xl font-bold text-gray-900 mb-4"
                >
                  Jobs
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {results.jobs.length} result
                    {results.jobs.length === 1 ? "" : "s"}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.jobs.map((job) => (
                    <JobCard key={job.slug || job.id} job={job} />
                  ))}
                </div>
              </section>
            )}

            {/* Schemes */}
            {results.schemes.length > 0 && (
              <section aria-labelledby="search-schemes-heading">
                <h2
                  id="search-schemes-heading"
                  className="text-lg sm:text-xl font-bold text-gray-900 mb-4"
                >
                  Government Schemes
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {results.schemes.length} result
                    {results.schemes.length === 1 ? "" : "s"}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.schemes.map((scheme) => (
                    <SchemeCard
                      key={scheme.slug || scheme.id}
                      scheme={scheme}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Scholarships */}
            {results.scholarships.length > 0 && (
              <section aria-labelledby="search-scholarships-heading">
                <h2
                  id="search-scholarships-heading"
                  className="text-lg sm:text-xl font-bold text-gray-900 mb-4"
                >
                  Scholarships
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {results.scholarships.length} result
                    {results.scholarships.length === 1 ? "" : "s"}
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.scholarships.map((item) => (
                    <ScholarshipCard key={item.slug || item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
