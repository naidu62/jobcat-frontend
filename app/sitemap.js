// app/sitemap.js
import { API_BASE, SITE_URL } from "@/lib/api";
import { slugify } from "@/lib/jobs";

// Fetch all pages of a paginated DRF list endpoint. Never throws.
async function fetchAll(endpoint) {
  const items = [];
  try {
    let url = `${API_BASE}/${endpoint.replace(/^\//, "")}`;
    for (let page = 0; page < 50 && url; page += 1) {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) break;
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
      items.push(...(data?.results ?? []));
      url = data?.next ?? null;
    }
  } catch {
    // API unreachable at build time — static routes still get listed
  }
  return items;
}

// Distinct facet values for SEO listing pages. Never throws.
async function fetchFacets() {
  try {
    const res = await fetch(`${API_BASE}/jobs/filters/`, {
      cache: "no-store",
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

function slugOrId(item) {
  return item?.slug || item?.id;
}

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "jobs", priority: 0.9, changeFrequency: "hourly" },
    { path: "schemes", priority: 0.8, changeFrequency: "weekly" },
    { path: "scholarships", priority: 0.8, changeFrequency: "weekly" },
    { path: "about", priority: 0.4, changeFrequency: "yearly" },
    { path: "contact", priority: 0.4, changeFrequency: "yearly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}/${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const [jobs, schemes, scholarships, facets] = await Promise.all([
    fetchAll("jobs/"),
    fetchAll("schemes/"),
    fetchAll("scholarships/"),
    fetchFacets(),
  ]);

  const categoryRoutes = (facets?.categories || []).map((value) => ({
    url: `${SITE_URL}/jobs/category/${slugify(value)}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  const stateRoutes = (facets?.states || [])
    .filter(Boolean)
    .map((value) => ({
      url: `${SITE_URL}/jobs/state/${slugify(value)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    }));

  const dynamicRoutes = [
    ...jobs.map((item) => ({
      url: `${SITE_URL}/jobs/${slugOrId(item)}`,
      lastModified: item?.updated_at ?? now,
      changeFrequency: "daily",
      priority: 0.7,
    })),
    ...schemes.map((item) => ({
      url: `${SITE_URL}/schemes/${slugOrId(item)}`,
      lastModified: item?.updated_at ?? now,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
    ...scholarships.map((item) => ({
      url: `${SITE_URL}/scholarships/${slugOrId(item)}`,
      lastModified: item?.updated_at ?? now,
      changeFrequency: "weekly",
      priority: 0.6,
    })),
  ].filter((entry) => !entry.url.endsWith("/null") && !entry.url.endsWith("/undefined"));

  return [...staticRoutes, ...categoryRoutes, ...stateRoutes, ...dynamicRoutes];
}
