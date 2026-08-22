// lib/seoJobs.js
// Server-side helpers powering the SEO landing pages:
//   /jobs/category/[slug]  and  /jobs/state/[slug]

import { API_BASE, SITE_URL } from "./api";
import { slugify } from "./jobs";

/**
 * Fetch a single page of published jobs filtered by a facet value.
 * Uses ISR-friendly caching (1 hour) so pages are statically renderable
 * while still refreshing data periodically.
 */
export async function getJobsByFacet(field, value, page = 1, pageSize = 12) {
  try {
    const params = new URLSearchParams({
      [field]: value,
      page: String(page),
    });
    const res = await fetch(`${API_BASE}/jobs/?${params.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`getJobsByFacet(${field}) error:`, error.message);
    return null;
  }
}

/** Distinct facet values from the API. Returns [] when unreachable. */
export async function getFacetValues(field) {
  const endpoints = {
    category: "categories",
    state: "states",
  };
  try {
    const res = await fetch(`${API_BASE}/jobs/filters/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.[endpoints[field]] || []).filter(Boolean);
  } catch {
    return [];
  }
}

/** Map of slug -> original value for generateStaticParams / validation. */
export async function getFacetSlugMap(field) {
  const values = await getFacetValues(field);
  const map = {};
  for (const value of values) {
    map[slugify(value)] = value;
  }
  return map;
}

export function jobListJsonLd(jobs, listUrl, listName) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    url: listUrl,
    numberOfItems: jobs.length,
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/jobs/${job.slug || job.id}`,
      name: job.title,
    })),
  };
}
