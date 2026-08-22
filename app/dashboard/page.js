"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "../components/JobCard";
import {
  authFetch,
  isAuthenticated,
  resolveMediaUrl,
} from "@/lib/auth";
import {
  fetchActivity,
  fetchRecommendations,
  listAlerts,
  listApplications,
  listSavedJobs,
} from "@/lib/platform";

function StatCard({ href, label, value, accent = "text-gray-900" }) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition min-h-[88px] flex flex-col justify-center"
    >
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold mt-1 ${accent}`}>{value}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const [state, setState] = useState({ phase: "checking", me: null });

  const [savedCount, setSavedCount] = useState(0);
  const [recentSaved, setRecentSaved] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [recs, setRecs] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setState({ phase: "anon", me: null });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await authFetch("auth/me/");
        if (cancelled) return;
        setState({ phase: "ready", me });
        localStorage.setItem("jobcat_user", JSON.stringify(me));
        window.dispatchEvent(new Event("jobcat-auth-sync"));

        // Parallel non-critical loads; each failure stays isolated.
        listSavedJobs()
          .then((rows) => {
            if (!cancelled) {
              setSavedCount(rows.length);
              setRecentSaved(rows.slice(0, 3));
            }
          })
          .catch(() => {});
        listAlerts()
          .then((alerts) => {
            if (!cancelled) {
              setActiveAlerts(alerts.filter((a) => a.is_active).length);
              const sent = alerts
                .map((a) => a.last_sent_at)
                .filter(Boolean)
                .sort()
                .reverse()[0];
              setLastSentAt(sent);
            }
          })
          .catch(() => {});
        fetchRecommendations(6)
          .then((r) => !cancelled && setRecs(r))
          .catch(() => {});
        fetchActivity(8)
          .then((a) => !cancelled && setActivity(a))
          .catch(() => {});
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load dashboard.");
          setState({ phase: isAuthenticated() ? "ready" : "anon", me: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.phase === "anon") {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to open your JobCat dashboard.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/login?next=/dashboard" className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase !== "ready" || !state.me) {
    return (
      <div className="max-w-7xl mx-auto mt-10 mb-16 px-4 space-y-4">
        <div className="h-28 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const me = state.me;
  const avatarUrl = resolveMediaUrl(me.profile?.avatar_url);
  const initial = (me.first_name || me.email || "?").trim().charAt(0).toUpperCase();
  const memberSince = me.date_joined
    ? new Date(me.date_joined).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "";
  const isGoogle = me.auth_provider === "google";
  const appliedCount = new Set(
    activity.filter((a) => a.type?.startsWith("application")).map((a) => a.job_id)
  ).size;

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-16 px-4 sm:px-6">
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {/* 1. Profile summary */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
            {initial}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-lg font-bold text-gray-900">
            Hi {me.first_name || "there"} 👋
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-sm text-gray-600">
            <span>{me.email}</span>
            {me.email_verified ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">Verified</span>
            ) : (
              <Link href="/verify-email" className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                Verify email →
              </Link>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {isGoogle ? "Google account" : "Email login"}
            </span>
            <span className="text-xs text-gray-400">Member since {memberSince}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="min-h-[44px] inline-flex items-center px-3 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition">
            Profile
          </Link>
          <Link href="/settings" className="min-h-[44px] inline-flex items-center px-3 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition">
            Settings
          </Link>
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard href="/saved-jobs" label="Saved jobs" value={savedCount} accent="text-blue-600" />
        <StatCard href="/applications" label="Tracking" value={appliedCount} />
        <StatCard href="/alerts" label="Active alerts" value={activeAlerts} />
        <StatCard href="/recommendations" label="Recommended" value={recs.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 4. Recommended jobs */}
          <section>
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recommended for you</h2>
              <Link href="/recommendations" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </header>
            {recs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recs.slice(0, 4).map((job) => (
                  <JobCard key={job.slug || job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-4">
                No recommendations yet — save jobs and complete your profile to
                improve matches.
              </p>
            )}
          </section>

          {/* 2. Saved jobs summary */}
          <section>
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recently saved</h2>
              <Link href="/saved-jobs" className="text-sm text-blue-600 hover:underline">
                View all →
              </Link>
            </header>
            {recentSaved.length > 0 ? (
              <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {recentSaved.map((row) => (
                  <li key={row.id}>
                    <Link
                      href={`/jobs/${row.job?.slug || row.job?.id}`}
                      className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                    >
                      <span className="line-clamp-1">{row.job?.title}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(row.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-4">
                Nothing saved yet.{" "}
                <Link href="/jobs" className="text-blue-600 hover:underline">Browse jobs →</Link>
              </p>
            )}
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* 3. Alerts summary */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <header className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Job alerts</h2>
              <Link href="/alerts" className="text-sm text-blue-600 hover:underline">
                Manage →
              </Link>
            </header>
            <p className="text-sm text-gray-700">
              {activeAlerts} active alert{activeAlerts === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {lastSentAt
                ? `Last notification: ${new Date(lastSentAt).toLocaleDateString("en-IN")}`
                : "No notifications sent yet"}
            </p>
          </section>

          {/* 5. Recent activity */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Recent activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-500">Your activity will appear here.</p>
            ) : (
              <ol className="space-y-2 max-h-80 overflow-hidden">
                {activity.map((e, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span aria-hidden="true">
                      {e.type === "job_saved" ? "🔖" : e.type === "job_viewed" ? "👁️" : e.type?.startsWith("application") ? "📋" : "🔔"}
                    </span>
                    <span className="text-gray-700 line-clamp-1">{e.label}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
