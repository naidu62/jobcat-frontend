"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import {
  APPLICATION_STATUSES,
  createApplication,
  listApplications,
  trackJobView,
  updateApplication,
} from "@/lib/platform";

/**
 * "Track Application" panel on the job detail page.
 * Records the view (fire-and-forget), then lets signed-in users create or
 * update their personal application entry: status + notes.
 */
export default function TrackApplicationPanel({ jobId }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [app, setApp] = useState(null); // existing tracking row, if any
  const [status, setStatus] = useState("applied");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Fire-and-forget view tracking
  useEffect(() => {
    if (isAuthenticated() && jobId) trackJobView(jobId);
    setAuthed(isAuthenticated());
    setChecked(true);
  }, [jobId]);

  // Load existing tracking entry for this job
  useEffect(() => {
    if (!authed || !jobId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await listApplications();
        if (cancelled) return;
        const mine = rows.find((r) => r.job?.id === Number(jobId)) || null;
        if (mine) {
          setApp(mine);
          setStatus(mine.status);
          setNotes(mine.notes || "");
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [authed, jobId]);

  const submit = useCallback(
    async (e) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try {
        if (app) {
          const updated = await updateApplication(app.id, { status, notes });
          setApp(updated);
        } else {
          const created = await createApplication({
            jobId: Number(jobId),
            status,
            notes,
          });
          setApp(created);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError(err.message || "Could not save.");
      } finally {
        setBusy(false);
      }
    },
    [app, jobId, notes, status]
  );

  if (!checked) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mt-6">
      <h2 className="text-base font-semibold text-gray-900">Track this application</h2>

      {!authed ? (
        <p className="mt-2 text-sm text-gray-600">
          <Link href={`/login?next=/jobs/${jobId}`} className="text-blue-600 hover:underline">
            Sign in
          </Link>{" "}
          to track this job — save it to your pipeline, record the status and keep notes.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="sm:w-48">
              <span className="block text-xs font-medium text-gray-700 mb-1">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {APPLICATION_STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="self-end min-h-[44px] px-5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {busy ? "Saving…" : app ? "Update tracking" : saved ? "Tracked ✓" : "Start tracking"}
            </button>
          </div>
          <label className="block">
            <span className="block text-xs font-medium text-gray-700 mb-1">
              Private notes (dates, references…)
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Applied on 12 Aug via website. Ref no: …"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          {saved && <p className="text-sm text-green-600">Saved ✓</p>}
          {app && !saved && (
            <p className="text-xs text-gray-500">
              Tracking since{" "}
              {new Date(app.created_at).toLocaleDateString("en-IN")} · manage all in{" "}
              <Link href="/applications" className="text-blue-600 hover:underline">Applications</Link>
            </p>
          )}
        </form>
      )}
    </section>
  );
}
