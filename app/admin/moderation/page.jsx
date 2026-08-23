"use client";

// app/admin/moderation/page.jsx — moderation dashboard overview.
// Authorization is enforced by app/admin/layout.js (staff-only shell);
// the backend re-verifies on every request (IsAdminUser).

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getAdminStats } from "@/lib/admin";
import { StatCard } from "./_components";

export default function ModerationOverviewPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
        Could not load stats: {error}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500 py-8">Loading stats…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Moderation overview</h1>
        <button
          onClick={load}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Pending reports"
          value={stats.reports?.pending ?? 0}
          accent={stats.reports?.pending ? "text-yellow-600" : "text-green-600"}
          hint={`${stats.reports?.open ?? 0} open incl. reviewing`}
        />
        <StatCard label="Total reports" value={stats.reports?.total ?? 0} />
        <StatCard
          label="Suspended users"
          value={stats.users?.suspended ?? 0}
          accent={stats.users?.suspended ? "text-orange-600" : "text-gray-900"}
        />
        <StatCard
          label="Banned users"
          value={stats.users?.banned ?? 0}
          accent={stats.users?.banned ? "text-red-600" : "text-gray-900"}
        />
        <StatCard
          label="Warned users"
          value={stats.users?.warned ?? 0}
          accent={stats.users?.warned ? "text-yellow-600" : "text-gray-900"}
        />
        <StatCard
          label="Active users"
          value={stats.users?.active ?? 0}
          accent="text-green-600"
        />
        <StatCard
          label="Pending jobs"
          value={stats.jobs?.pending_review ?? 0}
          accent={stats.jobs?.pending_review ? "text-blue-600" : "text-gray-900"}
          hint="draft / awaiting review"
        />
        <StatCard label="Published jobs" value={stats.jobs?.published ?? 0} />
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/moderation/reports"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Open reports queue{stats.reports?.pending ? ` (${stats.reports.pending})` : ""}
        </Link>
        <Link
          href="/admin/moderation/users"
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Manage users
        </Link>
      </div>
    </div>
  );
}
