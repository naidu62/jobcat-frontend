"use client";

// app/admin/moderation/page.js — moderation dashboard
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/lib/admin";

function StatCard({ label, value, tone = "", href }) {
  const body = (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${tone || "text-gray-900"}`}>{value}</p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}

export default function ModerationDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminStats()
      .then((data) => active && setStats(data))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Moderation overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live counters from the JobCat moderation queue.
        </p>
      </header>

      <section aria-label="Reports">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending reports"
            value={stats.reports.pending}
            tone={stats.reports.pending > 0 ? "text-amber-600" : "text-gray-900"}
            href="/admin/moderation/reports"
          />
          <StatCard label="Reviewing" value={stats.reports.reviewing} href="/admin/moderation/reports?status=reviewing" />
          <StatCard label="Open reports" value={stats.reports.open} href="/admin/moderation/reports" />
          <StatCard label="Total reports" value={stats.reports.total} href="/admin/moderation/reports" />
        </div>
      </section>

      <section aria-label="Users">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Users
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Suspended users"
            value={stats.users.suspended}
            tone={stats.users.suspended > 0 ? "text-orange-600" : ""}
            href="/admin/moderation/users?moderation_status=suspended"
          />
          <StatCard
            label="Banned users"
            value={stats.users.banned}
            tone={stats.users.banned > 0 ? "text-red-600" : ""}
            href="/admin/moderation/users?moderation_status=banned"
          />
          <StatCard label="Warned users" value={stats.users.warned} href="/admin/moderation/users?moderation_status=warning" />
          <StatCard label="Active users" value={stats.users.active} href="/admin/moderation/users" />
        </div>
      </section>

      <section aria-label="Content">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Content pipeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending jobs (drafts)"
            value={stats.jobs.pending_review}
            href="/admin"
          />
          <StatCard label="Published jobs" value={stats.jobs.published} href="/jobs" />
        </div>
      </section>
    </div>
  );
}
