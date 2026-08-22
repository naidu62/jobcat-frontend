// lib/api.js

// Production API base URL.
// Priority: NEXT_PUBLIC_API_URL (e.g. https://app.jobcat.in/api)
//        -> NEXT_PUBLIC_API_BASE_URL (legacy, no /api suffix)
//        -> https://app.jobcat.in/api
function resolveApiBase() {
  const withApi = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (withApi) return withApi.endsWith("/api") ? withApi : `${withApi}/api`;

  const legacy = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (legacy) return `${legacy}/api`;

  return "https://app.jobcat.in/api";
}

export const API_BASE = resolveApiBase();

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://jobcat.in";


// 🧠 Generic function to call your Django API
export async function fetchAPI(endpoint, options = {}) {
  // Clean up slashes and form full URL
  const url = `${API_BASE}/${endpoint.replace(/^\//, "")}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      // Prevent caching for fresh data (optional)
      cache: "no-store",
    });

    // Handle HTTP errors
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `API Error ${res.status}: ${res.statusText}\n${errorText || ""}`
      );
    }

    // Return JSON data
    return await res.json();
  } catch (error) {
    console.error("❌ fetchAPI Error:", error.message);
    throw error;
  }
}

// ✅ Example helper for specific endpoints (optional)
export async function getJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchAPI(`jobs/${query ? `?${query}` : ""}`);
}

export async function getJobDetails(idOrSlug) {
  return fetchAPI(`jobs/${idOrSlug}/`);
}

// Paginated DRF responses ({count, next, previous, results}) -> array
export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}
