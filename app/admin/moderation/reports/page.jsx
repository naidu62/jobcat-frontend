"use client";

// app/admin/moderation/reports/page.jsx — reports queue.
// Cards show the reported content, reporter and reason; actions map to
// POST /api/admin/reports/{id}/resolve/ (audit-logged server-side).

import { useCallback, useEffect, useState } from "react";
import { getReports, resolveReport } from "@/lib/admin";
import {
  ActionModal,
  ReportCard,
  RESOLVE_ACTION_LABELS,
} from "../_components";

const PAGE_SIZE = 10;

export default function ModerationReportsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [reports, setReports] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { report, action }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports({ status: statusFilter, page });
      setReports(data?.results || []);
      setCount(data?.count || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitResolve = async (notes) => {
    await resolveReport(modal.report.id, modal.action, notes);
    setModal(null);
    await load();
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Reports queue</h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["pending", "reviewing", "resolved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize ${
              statusFilter === s
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">{count} report(s)</span>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading reports…</p>
      ) : error ? (
        <p className="text-center py-8 text-red-500">{error}</p>
      ) : reports.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No {statusFilter} reports. 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              onAction={(report, action) => setModal({ report, action })}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {modal && (
        <ActionModal
          title={RESOLVE_ACTION_LABELS[modal.action]}
          confirmLabel={modal.action === "dismiss" ? "Ignore" : modal.action.replace("_", " ")}
          danger={["remove_content", "ban_user", "suspend_user"].includes(modal.action)}
          onSubmit={submitResolve}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
