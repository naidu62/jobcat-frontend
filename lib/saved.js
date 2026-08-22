// lib/saved.js
// Client-side Saved Jobs state: one shared fetch for all cards on a page,
// optimistic toggles, and cross-component sync via a window event.

import { API_BASE } from "./api";
import { authFetch, isAuthenticated, getAccessToken } from "./auth";

const SYNC_EVENT = "jobcat-saved-sync";

let _idsPromise = null;

/** Fetch the user's saved job ids (cached per page-load until invalidated). */
export function loadSavedIds() {
  if (typeof _idsPromise === "object" && _idsPromise !== null) return _idsPromise;
  if (!isAuthenticated()) return Promise.resolve(new Set());
  _idsPromise = authFetch("users/me/saved-job-ids/")
    .then((data) => new Set(data?.ids || []))
    .catch(() => new Set());
  return _idsPromise;
}

function invalidate() {
  _idsPromise = null;
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

export function onSavedSync(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SYNC_EVENT, handler);
  return () => window.removeEventListener(SYNC_EVENT, handler);
}

/** POST /api/jobs/{id}/save/ */
export async function saveJob(jobId) {
  const res = await authFetch(`jobs/${jobId}/save/`, { method: "POST" });
  invalidate();
  notify();
  return res; // { saved: true, detail }
}

/** DELETE /api/jobs/{id}/save/ */
export async function unsaveJob(jobId) {
  const res = await authFetch(`jobs/${jobId}/save/`, { method: "DELETE" });
  invalidate();
  notify();
  return res; // { saved: false, detail }
}

/** GET /api/users/me/saved-jobs/ -> array of { id, job, created_at } */
export async function listSavedJobs() {
  const data = await authFetch("users/me/saved-jobs/");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}
