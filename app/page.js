// app/page.js
// JobCat homepage — minimal, search-first landing page.
// Server-rendered for SEO: pulls the latest items straight from the
// existing Jobs / Schemes / Scholarships APIs via lib helpers.

import Link from "next/link";
import HeroSearch from "./components/HeroSearch";
import UpdateCard from "./components/UpdateCard";
import JobCard from "./components/JobCard";
import SchemeCard from "./components/SchemeCard";
import ScholarshipCard from "./components/ScholarshipCard";
import { getPublishedList } from "@/lib/listings";
import { SITE_URL } from "@/lib/api";

export const revalidate = 300;

export const metadata = {
  title: {
    absolute: "JobCat - Find Jobs, Government Schemes & Scholarships",
  },
  description:
    "Search government jobs, private jobs, schemes and scholarships in one place.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "JobCat - Find Jobs, Government Schemes & Scholarships",
    description:
      "Search government jobs, private jobs, schemes and scholarships in one place.",
    url: "/",
  },
};

const TRENDING_SEARCHES = [
  { label: "SBI PO", q: "SBI PO" },
  { label: "UPSC", q: "UPSC" },
  { label: "Railway", q: "Railway" },
  { label: "Bank Jobs", q: "bank" },
  { label: "Scholarships", q: "scholarship" },
  { label: "Telangana Jobs", q: "Telangana" },
];

function jobOrg(job) {
  return (
    job?.organization ||
    job?.organisation ||
    job?.company_name ||
    job?.company ||
    null
  );
}

/** Merge the three feeds into one recency-sorted updates list. */
function buildUpdates(jobs, schemes, scholarships, limit = 6) {
  const items = [
    ...jobs.map((job) => ({
      type: "job",
      key: `job-${job.id ?? job.slug}`,
      title: job.title,
      href: `/jobs/${job.slug || job.id}`,
      date: job.updated_at || job.created_at,
      meta: jobOrg(job),
    })),
    ...schemes.map((scheme) => ({
      type: "scheme",
      key: `scheme-${scheme.id ?? scheme.slug}`,
      title: scheme.title,
      date: scheme.updated_at || scheme.created_at,
      meta: scheme.ministry || scheme.department || null,
    })),
    ...scholarships.map((item) => ({
      type: "scholarship",
      key: `sch-${item.id ?? item.slug}`,
      title: item.title,
      date: item.updated_at || item.created_at,
      meta: item.provider_name || null,
    })),
  ];

  return items
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, limit);
}

function SectionHeader({ id, title, subtitle, href, cta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h2
          id={id}
          className="text-xl sm:text-2xl font-bold text-gray-900"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      {href && cta && (
        <Link
          href={href}
          className="inline-flex items-center min-h-[44px] px-4 text-sm font-medium text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition"
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

export default async function HomePage() {
  // Parallel fetch from the three existing APIs (never throws).
  const [jobs, schemes, scholarships] = await Promise.all([
    getPublishedList("jobs"),
    getPublishedList("schemes"),
    getPublishedList("scholarships"),
  ]);

  const latestJobs = jobs.slice(0, 6);
  const latestSchemes = schemes.slice(0, 3);
  const latestScholarships = scholarships.slice(0, 3);
  const updates = buildUpdates(jobs, schemes, scholarships);

  return (
    <div>
      {/* Structured data: sitelinks search box */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "JobCat.in",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
            JobCat
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Find Jobs, Government Schemes &amp; Scholarships
          </p>

          <HeroSearch />

          {/* Trending searches */}
          <nav
            aria-label="Trending searches"
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {TRENDING_SEARCHES.map((trend) => (
              <Link
                key={trend.label}
                href={`/search?q=${encodeURIComponent(trend.q)}`}
                className="min-h-[44px] inline-flex items-center px-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
              >
                {trend.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* ── Latest Updates ─────────────────────────────────── */}
        {updates.length > 0 && (
          <section>
            <SectionHeader
              id="latest-updates-heading"
              title="Latest Updates"
              subtitle="New jobs, schemes and scholarships as they are published."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {updates.map((item) => (
                <UpdateCard
                  key={item.key}
                  type={item.type}
                  title={item.title}
                  href={item.href}
                  date={item.date}
                  meta={item.meta}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Latest Jobs ────────────────────────────────────── */}
        <section>
          <SectionHeader
            id="latest-jobs-heading"
            title="Latest Jobs"
            subtitle="Fresh government and private job notifications."
            href="/jobs"
            cta="View All Jobs"
          />
          {latestJobs.length === 0 ? (
            <EmptySection message="New jobs will be updated soon." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestJobs.map((job) => (
                <JobCard key={job.slug || job.id} job={job} />
              ))}
            </div>
          )}
        </section>

        {/* ── Government Schemes ─────────────────────────────── */}
        <section>
          <SectionHeader
            id="schemes-heading"
            title="Government Schemes"
            subtitle="Central and state welfare schemes you can apply for."
            href="/schemes"
            cta="View All Schemes"
          />
          {latestSchemes.length === 0 ? (
            <EmptySection message="New schemes will be updated soon." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestSchemes.map((scheme) => (
                <SchemeCard key={scheme.slug || scheme.id} scheme={scheme} />
              ))}
            </div>
          )}
        </section>

        {/* ── Scholarships ───────────────────────────────────── */}
        <section>
          <SectionHeader
            id="scholarships-heading"
            title="Scholarships"
            subtitle="Active scholarships for students across India."
            href="/scholarships"
            cta="View All Scholarships"
          />
          {latestScholarships.length === 0 ? (
            <EmptySection message="Scholarships will be updated soon." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestScholarships.map((item) => (
                <ScholarshipCard key={item.slug || item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
