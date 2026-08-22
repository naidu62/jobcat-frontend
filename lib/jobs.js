// lib/jobs.js
// Shared helpers for job discovery: query building, filter options, slugs.

import { API_BASE } from "./api";

export const JOB_TYPE_OPTIONS = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "psu", label: "PSU" },
  { value: "banking", label: "Banking" },
  { value: "railway", label: "Railway" },
  { value: "defence", label: "Defence" },
];

export const ORDER_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "deadline", label: "Deadline (soonest)" },
  { value: "salary", label: "Salary (highest)" },
];

export const EMPTY_FILTERS = {
  search: "",
  job_type: "",
  category: "",
  state: "",
  district: "",
  qualification: "",
  salary_gte: "",
  salary_lte: "",
  last_date_before: "",
};

/**
 * Build a DRF query string from a filters object. Omits empty values,
 * always includes `ordering` and `page` when meaningful.
 */
export function buildJobsQuery(filters, { ordering = "latest", page = 1 } = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    const v = String(value ?? "").trim();
    if (v) params.set(key, v);
  }
  if (ordering && ordering !== "latest") params.set("ordering", ordering);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

/** URLSearchParams -> filters object (reads only known keys). */
export function filtersFromSearchParams(searchParams) {
  const out = { ...EMPTY_FILTERS };
  for (const key of Object.keys(out)) {
    const v = searchParams?.get?.(key);
    if (v) out[key] = v;
  }
  return out;
}

export function countActiveFilters(filters) {
  return Object.entries(filters).filter(
    ([key, value]) => key !== "search" && String(value ?? "").trim() !== ""
  ).length;
}

export async function fetchJobFilters() {
  try {
    const res = await fetch(`${API_BASE}/jobs/filters/`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("fetchJobFilters error:", error.message);
    return null;
  }
}

const SLUG_RE = /[^a-z0-9]+/g;

/** "Telangana" -> "telangana"; "10th Pass & ITI" -> "10th-pass-iti" */
export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(SLUG_RE, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human label from slug: "fresher-govt-jobs" -> "Fresher Govt Jobs" */
export function unslugify(slug) {
  return String(slug ?? "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatDisplayDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
