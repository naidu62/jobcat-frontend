// lib/platform.js
// Client helpers for alerts, applications, recommendations and activity.

import { authFetch } from "./auth";

// --- Job Alerts -------------------------------------------------------------
export async function listAlerts() {
  const data = await authFetch("alerts/");
  return Array.isArray(data) ? data : data?.results || [];
}

export async function createAlert(payload) {
  return authFetch("alerts/", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAlert(id, payload) {
  return authFetch(`alerts/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteAlert(id) {
  return authFetch(`alerts/${id}/`, { method: "DELETE" });
}

// --- Applications -----------------------------------------------------------
const APPLICATION_STATUSES = [
  ["saved", "Saved"],
  ["applied", "Applied"],
  ["under_review", "Under Review"],
  ["interview", "Interview"],
  ["selected", "Selected"],
  ["rejected", "Rejected"],
  ["withdrawn", "Withdrawn"],
];

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function listApplications() {
  const data = await authFetch("applications/?page_size=100");
  return unwrap(data);
}

export async function createApplication({ jobId, status = "applied", notes = "" }) {
  return authFetch("applications/", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId, status, notes }),
  });
}

export async function updateApplication(id, payload) {
  return authFetch(`applications/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteApplication(id) {
  return authFetch(`applications/${id}/`, { method: "DELETE" });
}

// --- Recommendations / Activity ----------------------------------------------
export async function fetchRecommendations(limit = 12) {
  const data = await authFetch(`recommendations/?limit=${limit}`);
  return unwrap(data);
}

export async function fetchActivity(limit = 12) {
  const data = await authFetch(`users/me/activity/?limit=${limit}`);
  return Array.isArray(data) ? data : data?.results || [];
}

// Track a job view (fire-and-forget; never throws)
export function trackJobView(jobId) {
  try {
    authFetch(`jobs/${jobId}/view/`, { method: "POST" }).catch(() => {});
  } catch {}
}

export { APPLICATION_STATUSES };
