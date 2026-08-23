// lib/admin.js
// JobCat admin moderation APIs (staff only). All calls go through authFetch,
// which attaches the JWT and refreshes on 401.
import { authFetch } from "./auth";
import { unwrapList } from "./api";

export async function getAdminStats() {
  return authFetch("admin/stats/");
}

export async function getReports({ status = "", targetType = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (targetType) params.set("target_type", targetType);
  params.set("page", String(page));
  return authFetch(`admin/reports/?${params.toString()}`);
}

export async function resolveReport(reportId, action, notes = "") {
  return authFetch(`admin/reports/${reportId}/resolve/`, {
    method: "POST",
    body: JSON.stringify({ action, notes }),
  });
}

export async function searchUsers({ search = "", moderationStatus = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (moderationStatus) params.set("moderation_status", moderationStatus);
  params.set("page", String(page));
  return authFetch(`admin/users/?${params.toString()}`);
}

export async function userAction(userId, action, reason) {
  const body = action === "restore" ? { notes: reason || "" } : { reason };
  return authFetch(`admin/users/${userId}/${action}/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function reportStatusLabel(status) {
  const labels = {
    pending: "Pending",
    reviewing: "Reviewing",
    resolved: "Resolved",
    rejected: "Rejected",
  };
  return labels[status] || status;
}

export const REPORT_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  reviewing: "bg-blue-50 text-blue-700",
  resolved: "bg-green-50 text-green-700",
  rejected: "bg-gray-100 text-gray-600",
};

export const MODERATION_STATUS_STYLES = {
  active: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  suspended: "bg-orange-50 text-orange-700",
  banned: "bg-red-50 text-red-700",
};
