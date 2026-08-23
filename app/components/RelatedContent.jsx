// app/components/RelatedContent.jsx
// Server component: internal-linking block rendered on job detail pages.
// Shows related Jobs (same category), Schemes and Scholarships so crawlers
// can discover adjacent content. All fetches fail soft — a section is
// simply omitted when the API is unreachable or returns nothing.

import Link from "next/link";
import { API_BASE, unwrapList } from "@/lib/api";

async function fetchList(endpoint, params) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/${endpoint}?${qs}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return unwrapList(await res.json());
  } catch {
    return [];
  }
}

function RelatedLink({ href, title, meta }) {
  const external = href.startsWith("http");
  const inner = (
    <>
      <span className="font-medium text-blue-700 group-hover:underline">{title}</span>
      {meta && <span className="block text-xs text-gray-500 mt-0.5">{meta}</span>}
    </>
  );
  const className =
    "group block border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

function Section({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-blue-700 mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <RelatedLink
            key={`${item.href}-${item.title}`}
            href={item.href}
            title={item.title}
            meta={item.meta}
          />
        ))}
      </div>
    </section>
  );
}

export default async function RelatedContent({ job }) {
  const category = (job.category || "").trim();
  const state = (job.state || "").trim();
  const keyword = encodeURIComponent(category || job.title || "");

  const [jobs, schemes, scholarships] = await Promise.all([
    fetchList("jobs/", {
      ...(category ? { category } : {}),
      page_size: "7",
    }),
    fetchList("schemes/", { search: keyword, page_size: "3" }),
    fetchList("scholarships/", { search: keyword, page_size: "3" }),
  ]);

  // Same-category jobs first; fill with same-state jobs when thin.
  let relatedJobs = jobs.filter(
    (j) => String(j.id) !== String(job.id) && j.slug !== job.slug
  );
  if (relatedJobs.length < 4 && state && !category) {
    const byState = await fetchList("jobs/", { state, page_size: "7" });
    const seen = new Set(relatedJobs.map((j) => j.id));
    for (const j of byState) {
      if (relatedJobs.length >= 6) break;
      if (String(j.id) === String(job.id) || seen.has(j.id)) continue;
      relatedJobs.push(j);
      seen.add(j.id);
    }
  }
  relatedJobs = relatedJobs.slice(0, 6);

  const jobItems = relatedJobs.map((j) => ({
    href: `/jobs/${j.slug || j.id}`,
    title: j.title,
    meta: [
      j.last_date ? `Last date: ${j.last_date}` : null,
      j.total_vacancies ? `${Number(j.total_vacancies).toLocaleString("en-IN")} vacancies` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const schemeItems = schemes.map((s) => ({
    href: `/schemes/${s.slug || s.id}`,
    title: s.short_title || s.title,
    meta: s.ministry || s.category || "",
  }));

  const scholarshipItems = scholarships.map((s) => ({
    href: `/scholarships/${s.slug || s.id}`,
    title: s.short_title || s.title,
    meta: s.category || "",
  }));

  if (!jobItems.length && !schemeItems.length && !scholarshipItems.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-5">
      <Section title={`More ${category || "Government"} Jobs`} items={jobItems} />
      <Section title="Related Government Schemes" items={schemeItems} />
      <Section title="Related Scholarships" items={scholarshipItems} />
    </div>
  );
}
