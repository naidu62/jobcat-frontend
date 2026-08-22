"use client";

import { JOB_TYPE_OPTIONS } from "@/lib/jobs";

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

/**
 * Reusable job filter controls. Rendered inside both the desktop sidebar
 * and the mobile drawer.
 */
export default function FilterPanel({ filters, setFilters, options, onApply }) {
  const opts = options || {};
  const jobTypes = opts.job_types?.length
    ? opts.job_types
    : JOB_TYPE_OPTIONS;

  const update = (key) => (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <Field label="Job Type">
        <select value={filters.job_type} onChange={update("job_type")} className={inputClass}>
          <option value="">All Types</option>
          {jobTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Category">
        <select value={filters.category} onChange={update("category")} className={inputClass}>
          <option value="">All Categories</option>
          {(opts.categories || []).map((c) => (
            <option key={c} value={c} className="capitalize">
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="State">
        <select value={filters.state} onChange={update("state")} className={inputClass}>
          <option value="">All States</option>
          {(opts.states || []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Qualification">
        {opts.qualifications?.length ? (
          <select
            value={filters.qualification}
            onChange={update("qualification")}
            className={inputClass}
          >
            <option value="">Any Qualification</option>
            {opts.qualifications.map((q) => (
              <option key={q} value={q}>
                {q.length > 60 ? `${q.slice(0, 60)}…` : q}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="e.g. B.Tech, 10th pass…"
            value={filters.qualification}
            onChange={update("qualification")}
            className={inputClass}
          />
        )}
      </Field>

      <Field label="Salary (₹ per month)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.salary_gte}
            onChange={update("salary_gte")}
            className={inputClass}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.salary_lte}
            onChange={update("salary_lte")}
            className={inputClass}
          />
        </div>
      </Field>

      <Field label="Deadline (closing on or before)">
        <input
          type="date"
          value={filters.last_date_before}
          onChange={update("last_date_before")}
          className={inputClass}
        />
      </Field>

      <button
        type="button"
        onClick={onApply}
        className="w-full mt-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition lg:hidden"
      >
        Apply Filters
      </button>
    </div>
  );
}

export function ActiveFilterChips({ filters, removeFilter, clearAll }) {
  const labels = {
    search: "Search",
    job_type: "Job Type",
    category: "Category",
    state: "State",
    district: "District",
    qualification: "Qualification",
    salary_gte: "Salary ≥",
    salary_lte: "Salary ≤",
    last_date_before: "Deadline ≤",
  };

  const active = Object.entries(filters).filter(
    ([, v]) => String(v ?? "").trim() !== ""
  );

  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map(([key, value]) => (
        <button
          key={key}
          type="button"
          onClick={() => removeFilter(key)}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition capitalize"
          title="Remove filter"
        >
          {labels[key]}: <strong>{String(value).slice(0, 24)}</strong>
          <span aria-hidden>✕</span>
        </button>
      ))}

      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-gray-500 underline hover:text-gray-700 transition"
      >
        Clear all
      </button>
    </div>
  );
}
