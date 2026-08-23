"use client";

// app/admin/moderation/_components.jsx
// Shared building blocks for the /admin/moderation pages.

import { useState } from "react";
import Link from "next/link";
import {
  MODERATION_STATUS_STYLES,
  REPORT_STATUS_STYLES,
  reportStatusLabel,
} from "@/lib/admin";

export function StatusPill({ status }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        REPORT_STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {reportStatusLabel(status)}
    </span>
  );
}

export function ActionModal({ title, confirmLabel, danger, onSubmit, onClose }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSubmit(text.trim());
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={
            danger
              ? "Reason (required, min 3 chars) — recorded in the audit log"
              : "Notes (optional)"
          }
          className="mt-3 w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || (danger && text.trim().length < 3)}
            className={`px-3 py-1.5 text-sm text-white rounded-lg disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReportCard({ report, onAction }) {
  const tp = report.target_preview || {};
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {report.target_type}
            </span>
            <StatusPill status={report.status} />
          </div>
          <p className="mt-1 font-medium text-gray-900 truncate">
            {tp.exists === false ? "(content deleted)" : tp.title || `#${report.target_id}`}
          </p>
          {tp.excerpt && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{tp.excerpt}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Reason: <span className="font-medium text-gray-700">{report.reason_display}</span>
            {" · "}Reported by <span className="font-medium">{report.reported_by_email}</span>
            {" · "}
            {new Date(report.created_at).toLocaleString()}
          </p>
          {report.description && (
            <p className="mt-1 text-sm italic text-gray-600">
              &ldquo;{report.description}&rdquo;
            </p>
          )}
        </div>
        {tp.url && (
          <Link
            href={tp.url}
            target="_blank"
            className="shrink-0 text-sm text-blue-600 hover:underline"
          >
            View ↗
          </Link>
        )}
      </div>

      {(report.status === "resolved" || report.status === "rejected") &&
        report.resolution_notes && (
          <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded p-2">
            Outcome: {report.resolution_notes}
          </p>
        )}

      {report.status !== "resolved" && report.status !== "rejected" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onAction(report, "remove_content")}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Remove content
          </button>
          <button
            onClick={() => onAction(report, "warn_user")}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Warn owner
          </button>
          <button
            onClick={() => onAction(report, "suspend_user")}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Suspend owner
          </button>
          <button
            onClick={() => onAction(report, "ban_user")}
            className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Ban owner
          </button>
          <button
            onClick={() => onAction(report, "dismiss")}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 ml-auto"
          >
            Ignore
          </button>
        </div>
      )}
    </div>
  );
}

export const RESOLVE_ACTION_LABELS = {
  remove_content: "Remove reported content?",
  warn_user: "Warn the content owner?",
  suspend_user: "Suspend the content owner's account?",
  ban_user: "Permanently ban the content owner's account?",
  dismiss: "Ignore this report?",
};

export function UserModStatus({ status }) {
  const value = status || "active";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        MODERATION_STATUS_STYLES[value] || "bg-gray-100 text-gray-600"
      }`}
    >
      {value}
    </span>
  );
}

/** Simple stat card matching the user dashboard design language. */
export function StatCard({ label, value, accent = "text-gray-900", hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 min-h-[88px] flex flex-col justify-center">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold mt-1 ${accent}`}>{value}</span>
      {hint && <span className="text-xs text-gray-400 mt-0.5">{hint}</span>}
    </div>
  );
}
