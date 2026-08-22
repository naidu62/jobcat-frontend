"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "../components/JobCard";
import { isAuthenticated } from "@/lib/auth";
import {
  APPLICATION_STATUSES,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "@/lib/platform";

const KANBAN_COLUMNS = ["saved", "applied", "interview", "selected", "rejected"];

const COLUMN_COLORS = {
  saved: "bg-gray-100 text-gray-700",
  applied: "bg-blue-50 text-blue-700",
  interview: "bg-purple-50 text-purple-700",
  selected: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    listApplications()
      .then(setApps)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (isAuthenticated()) load();
  }, [load]);

  async function moveStatus(app, status) {
    setApps((prev) =>
      prev ? prev.map((a) => (a.id === app.id ? { ...a, status } : a)) : prev
    );
    await updateApplication(app.id, { status }).catch(() => load());
    load();
  }

  async function remove(app) {
    if (!window.confirm(`Remove tracking for “${app.job?.title}”?`)) return;
    setApps((prev) => (prev ? prev.filter((a) => a.id !== app.id) : prev));
    await deleteApplication(app.id).catch(() => {});
    load();
  }

  if (!isAuthenticated()) {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to track your job applications.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/login?next=/applications" className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 mb-16 px-4 sm:px-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track every job you care about — from saved to selected.
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
        <p className="mt-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {apps === null ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">Nothing tracked yet</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
            Open any job and tap “Track Application” — or use the Apply button on
            job cards — to start tracking it here.
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex min-h-[44px] items-center px-5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            Find Jobs
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colApps = apps.filter((a) => a.status === col);
            const label =
              APPLICATION_STATUSES.find(([v]) => v === col)?.[1] || col;
            return (
              <section
                key={col}
                className="bg-gray-50 border border-gray-200 rounded-xl p-3"
              >
                <header className="flex items-center justify-between mb-3 px-1">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${COLUMN_COLORS[col]}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-gray-500">{colApps.length}</span>
                </header>

                {/* Status mover */}
                <div className="space-y-3">
                  {colApps.map((app) => (
                    <article
                      key={app.id}
                      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                    >
                      <Link
                        href={`/jobs/${app.job?.slug || app.job_id}`}
                        className="font-medium text-sm text-blue-700 hover:underline line-clamp-2"
                      >
                        {app.job?.title || `Job #${app.job_id}`}
                      </Link>
                      {app.job?.organization && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {app.job.organization}
                        </p>
                      )}
                      {app.notes && (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 whitespace-pre-line">
                          {app.notes}
                        </p>
                      )}
                      <label className="block mt-2">
                        <span className="sr-only">Status</span>
                        <select
                          value={app.status}
                          onChange={(e) => moveStatus(app, e.target.value)}
                          className="w-full min-h-[36px] text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {APPLICATION_STATUSES.map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() => remove(app)}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 min-h-[32px]"
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                  {colApps.length === 0 && (
                    <p className="text-xs text-gray-400 px-1 py-2">Empty</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
