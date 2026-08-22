// lib/search.js
// Universal search across Jobs, Schemes and Scholarships.
//
// Today it fans out to the three existing DRF endpoints (all support
// SearchFilter via `?search=`). When a unified search endpoint ships,
// only UNIFIED_SEARCH_PATH needs to be enabled — callers keep working.

import { API_BASE } from "./api";

/**
 * Future unified endpoint (e.g. "/search/?q="). Set to a string to make
 * searchAll() prefer it; falls back automatically if unavailable.
 */
const UNIFIED_SEARCH_PATH = null;

/** Fetch one listing endpoint with a search term. Never throws. */
async function searchEndpoint(endpoint, query, { revalidate = 120 } = {}) {
  try {
    const params = new URLSearchParams({ search: query });
    const res = await fetch(`${API_BASE}/${endpoint}/?${params.toString()}`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.results || [];
  } catch {
    return [];
  }
}

function byDateDesc(a, b) {
  const da = a?.updated_at || a?.created_at || "";
  const db = b?.updated_at || b?.created_at || "";
  return String(db).localeCompare(String(da));
}

/**
 * Search everything JobCat has.
 * @param {string} query Raw user query.
 * @returns {Promise<{jobs: Array, schemes: Array, scholarships: Array, total: number}>}
 */
export async function searchAll(query, { limitPerType = 20 } = {}) {
  const q = String(query ?? "").trim();
  if (!q) return { jobs: [], schemes: [], scholarships: [], total: 0 };

  // Future path: single unified endpoint returning grouped results.
  if (UNIFIED_SEARCH_PATH) {
    try {
      const res = await fetch(
        `${API_BASE}/${UNIFIED_SEARCH_PATH}?q=${encodeURIComponent(q)}`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const grouped = await res.json();
        return {
          jobs: grouped.jobs || [],
          schemes: grouped.schemes || [],
          scholarships: grouped.scholarships || [],
          total:
            grouped.total ??
            ((grouped.jobs?.length || 0) +
              (grouped.schemes?.length || 0) +
              (grouped.scholarships?.length || 0)),
        };
      }
    } catch {
      // fall through to fan-out below
    }
  }

  // Current implementation: parallel queries against existing APIs.
  const [jobs, schemes, scholarships] = await Promise.all([
    searchEndpoint("jobs", q),
    searchEndpoint("schemes", q),
    searchEndpoint("scholarships", q),
  ]);

  jobs.sort(byDateDesc);
  schemes.sort(byDateDesc);
  scholarships.sort(byDateDesc);

  return {
    jobs: jobs.slice(0, limitPerType),
    schemes: schemes.slice(0, limitPerType),
    scholarships: scholarships.slice(0, limitPerType),
    total: jobs.length + schemes.length + scholarships.length,
  };
}
