"use client";

import { useEffect, useState } from "react";
import { AuthError } from "@/lib/auth";
import {
  createAlert,
  deleteAlert as deleteAlertApi,
  listAlerts,
  updateAlert,
} from "@/lib/platform";

const JOB_TYPES = [
  ["", "Any type"],
  ["government", "Government"],
  ["private", "Private"],
  ["psu", "PSU"],
  ["banking", "Banking"],
  ["railway", "Railway"],
  ["defence", "Defence"],
];

const EMPTY = {
  name: "",
  keywords: "",
  category: "",
  job_type: "",
  state: "",
  district: "",
  qualification: "",
  salary_min: "",
  salary_max: "",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listAlerts()
      .then(setAlerts)
      .catch((e) => setError(e.message));
  }, []);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
    };
    try {
      if (editingId) {
        await updateAlert(editingId, payload);
      } else {
        await createAlert(payload);
      }
      setAlerts(await listAlerts());
      resetForm();
    } catch (err) {
      setError(err instanceof AuthError ? err.message : err.message || "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this alert?")) return;
    await deleteAlertApi(id).catch(() => {});
    setAlerts(await listAlerts().catch(() => []));
  }

  function startEdit(alert) {
    setEditingId(alert.id);
    setForm({
      name: alert.name || "",
      keywords: alert.keywords || "",
      category: alert.category || "",
      job_type: alert.job_type || "",
      state: alert.state || "",
      district: alert.district || "",
      qualification: alert.qualification || "",
      salary_min: alert.salary_min ?? "",
      salary_max: alert.salary_max ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleActive(alert) {
    await updateAlert(alert.id, { is_active: !alert.is_active }).catch(() => {});
    setAlerts(await listAlerts().catch(() => []));
  }

  const inputCls =
    "w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-16 px-4">
      <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
      <p className="mt-1 text-sm text-gray-600">
        Get an email when new jobs match your filters.
      </p>

      {/* Create / edit form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {editingId ? "Edit alert" : "New alert"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-blue-600 hover:underline min-h-[44px]"
            >
              Cancel edit
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="al-name" className={labelCls}>Alert name *</label>
            <input
              id="al-name"
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Telangana Govt Jobs"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="al-kw" className={labelCls}>Keywords (comma separated)</label>
            <input
              id="al-kw"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="clerk, police, assistant"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="al-cat" className={labelCls}>Category</label>
            <input
              id="al-cat"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="government"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="al-type" className={labelCls}>Job type</label>
            <select
              id="al-type"
              value={form.job_type}
              onChange={(e) => setForm({ ...form, job_type: e.target.value })}
              className={inputCls}
            >
              {JOB_TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="al-state" className={labelCls}>State</label>
            <input
              id="al-state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="Telangana"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="al-dist" className={labelCls}>District</label>
            <input
              id="al-dist"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="al-qual" className={labelCls}>Qualification contains</label>
            <input
              id="al-qual"
              value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              placeholder="bachelor, ITI…"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="al-smin" className={labelCls}>Min salary</label>
              <input
                id="al-smin"
                type="number"
                min="0"
                value={form.salary_min}
                onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="al-smax" className={labelCls}>Max salary</label>
              <input
                id="al-smax"
                type="number"
                min="0"
                value={form.salary_max}
                onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="min-h-[44px] px-5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {busy ? "Saving…" : editingId ? "Update alert" : "Create alert"}
        </button>
      </form>

      {/* Alert list */}
      <div className="mt-8 space-y-4">
        {alerts === null && (
          <>
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          </>
        )}
        {Array.isArray(alerts) && alerts.length === 0 && (
          <p className="text-sm text-gray-500">No alerts yet — create your first one above.</p>
        )}
        {(alerts || []).map((a) => (
          <div
            key={a.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 truncate">{a.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    a.is_active
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {a.is_active ? "Active" : "Paused"}
                </span>
                {a.matched_jobs > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {a.matched_jobs} matching job{a.matched_jobs === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {[a.keywords, a.category, a.job_type, a.state, a.district, a.qualification]
                  .filter(Boolean)
                  .join(" · ") || "No filters"}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toggleActive(a)}
                className="min-h-[44px] px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                {a.is_active ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => startEdit(a)}
                className="min-h-[44px] px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="min-h-[44px] px-3 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
