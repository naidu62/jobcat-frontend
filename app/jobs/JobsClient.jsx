"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JobCard from "../components/JobCard";
import FilterPanel, { ActiveFilterChips } from "../components/FilterPanel";
import {
  buildJobsQuery,
  countActiveFilters,
  fetchJobFilters,
  filtersFromSearchParams,
  ORDER_OPTIONS,
} from "@/lib/jobs";
import { getJobs, unwrapList } from "@/lib/api";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- State derived from the URL (shareable / back-button friendly) ----
  const [filters, setFilters] = useState(() =>
    filtersFromSearchParams(searchParams)
  );
  const [ordering, setOrdering] = useState(
    () => searchParams?.get("ordering") || "latest"
  );
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams?.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isFirstRender = useRef(true);
  const activeFilterCount = countActiveFilters(filters);

  // ---- Load facet options once ------------------------------------------
  useEffect(() => {
    fetchJobFilters().then(setOptions);
  }, []);

  // ---- Push state into the URL (no scroll jump) -------------------------
  const syncUrl = useCallback(
    (nextFilters, nextOrdering, nextPage) => {
      const qs = buildJobsQuery(nextFilters, {
        ordering: nextOrdering,
        page: nextPage,
      });
      router.replace(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
    },
    [router]
  );

  // ---- Fetch jobs whenever filters / ordering / page change -------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const query = buildJobsQuery(filters, { ordering, page });
        const data = await getJobs(query ? Object.fromEntries(new URLSearchParams(query)) : {});
        if (cancelled) return;
        const list = unwrapList(data);
        setJobs(list);
        setCount(typeof data?.count === "number" ? data.count : list.length);
      } catch (err) {
        if (!cancelled) {
          console.error("Jobs fetch error:", err);
          setError("Failed to load jobs. Please try again later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, ordering, page, reloadKey]);

  // ---- Debounced URL sync for the search box -----------------------------
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      syncUrl(filters, ordering, 1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ---- Adopt URL state on back / forward navigation ----------------------
  useEffect(() => {
    const urlFilters = filtersFromSearchParams(searchParams);
    const urlOrdering = searchParams?.get("ordering") || "latest";
    const urlPage =
      parseInt(searchParams?.get("page") || "1", 10) || 1;

    const currentQs = buildJobsQuery(filters, { ordering, page });
    const nextQs = buildJobsQuery(urlFilters, {
      ordering: urlOrdering,
      page: urlPage,
    });

    if (currentQs !== nextQs) {
      setFilters(urlFilters);
      setOrdering(urlOrdering);
      setPage(urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const changeOrdering = (value) => {
    setOrdering(value);
    setPage(1);
    syncUrl(filters, value, 1);
  };

  const goToPage = (p) => {
    setPage(p);
    syncUrl(filters, ordering, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFilter = (key) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: "" };
      setPage(1);
      syncUrl(next, ordering, 1);
      return next;
    });
  };

  const clearAll = () => {
    const cleared = { ...filters };
    for (const key of Object.keys(cleared)) cleared[key] = "";
    setFilters(cleared);
    setPage(1);
    syncUrl(cleared, ordering, 1);
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  /* ⏳ Loading state */
  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        Loading jobs...
      </div>
    );
  }

  /* ❌ API error state */
  if (error && jobs.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 🔍 Search bar */}
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex justify-center mb-6"
      >
        <input
          type="search"
          name="q"
          placeholder="Search by title, organization, or company…"
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          className="w-full sm:max-w-xl px-4 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          aria-label="Search jobs by title, organization, or company"
        />
      </form>

      <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* 🎛️ Desktop filters sidebar */}
      <aside className="hidden lg:block w-64 shrink-0" aria-label="Job filters">
        <div className="sticky top-24 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Filters</h2>
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            options={options}
          />
        </div>
      </aside>

      {/* 📱 Mobile filter drawer */}
      <div className="lg:hidden mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 min-h-[44px] text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition"
        >
          <span aria-hidden>⚙</span> Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-blue-600 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={ordering}
          onChange={(e) => changeOrdering(e.target.value)}
          className="ml-auto max-w-[52vw] truncate px-2 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Sort jobs"
        >
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Drawer overlay + panel */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-800 transition"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                options={options}
                onApply={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 📋 Results column */}
      <section className="flex-1 min-w-0">
        {/* Result summary + desktop ordering */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {count} job{count === 1 ? "" : "s"} found
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Sort by
            <select
              value={ordering}
              onChange={(e) => changeOrdering(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ORDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ActiveFilterChips
          filters={filters}
          removeFilter={removeFilter}
          clearAll={clearAll}
        />

        {/* 🗂️ Job grid */}
        <div
          className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-4 transition-opacity ${
            loading ? "opacity-50" : ""
          }`}
        >
          {jobs.map((job) => (
            <JobCard key={job.slug || job.id} job={job} />
          ))}
        </div>

        {/* 📭 Empty state */}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No matching jobs
            </h2>
            <p className="text-gray-500 mb-4">
              Try changing your search or removing some filters.
            </p>
            <button
              onClick={clearAll}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* 📄 Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4 pt-6" aria-label="Pagination">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="px-4 py-2 text-sm border rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-gray-100"
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 text-sm border rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:bg-gray-100"
            >
              Next →
            </button>
          </nav>
        )}
      </section>
      </div>
    </div>
  );
}
