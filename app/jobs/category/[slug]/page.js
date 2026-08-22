// app/jobs/category/[slug]/page.js
import Link from "next/link";
import { notFound } from "next/navigation";
import JobCard from "@/app/components/JobCard";
import { SITE_URL } from "@/lib/api";
import { unslugify } from "@/lib/jobs";
import {
  getFacetSlugMap,
  getJobsByFacet,
  jobListJsonLd,
} from "@/lib/seoJobs";

const PAGE_SIZE = 12;

// Fully static landing pages (ISR): regenerated hourly, new slugs rendered
// on demand. Interactive filtering/pagination lives on /jobs.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugMap = await getFacetSlugMap("category");
  return Object.keys(slugMap).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Unknown facets: serve a noindex soft-404. (The root app/loading.js
  // streams the HTML shell before rendering, so a hard 404 status is not
  // reachable on this route — noindex keeps crawlers from indexing it.)
  const slugMapForMeta = await getFacetSlugMap("category");
  if (!slugMapForMeta[slug]) {
    return {
      title: { absolute: "Jobs Not Found | JobCat" },
      robots: { index: false, follow: false },
    };
  }

  const name = unslugify(slug);
  const title = `${name} Jobs 2026 — Latest ${name} Job Notifications | JobCat`;
  const description = `Browse all latest ${name} job notifications for 2026. Check eligibility, salary, vacancies, last date and apply online at JobCat.in.`;
  const url = `${SITE_URL}/jobs/category/${slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/jobs/category/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "JobCat.in",
      images: [{ url: "/logo.png", width: 512, height: 512, alt: "JobCat.in" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function JobCategoryPage({ params }) {
  const { slug } = await params;

  // Resolve the real stored category value from the slug.
  const slugMap = await getFacetSlugMap("category");
  const categoryValue = slugMap[slug];
  if (!categoryValue) notFound();
  const data = categoryValue
    ? await getJobsByFacet("category", categoryValue, 1, PAGE_SIZE)
    : null;

  if (!data || !Array.isArray(data.results)) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          {unslugify(slug)} Jobs
        </h1>
        <p className="text-gray-600 mb-8">
          No {unslugify(slug)} job notifications are available right now.
          Please check back soon.
        </p>
        <Link
          href="/jobs"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Browse All Jobs
        </Link>
      </div>
    );
  }

  const jobs = data.results;
  const count = typeof data.count === "number" ? data.count : jobs.length;
  const name = unslugify(slug);
  const basePath = `/jobs/category/${slug}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jobListJsonLd(jobs, `${SITE_URL}${basePath}`, `${name} Jobs 2026`)
          ),
        }}
      />

      <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/jobs" className="hover:text-blue-600">
          Jobs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          {name} Jobs 2026
        </h1>
        <p className="text-base text-gray-600">
          {count} latest {name.toLowerCase()} job notification
          {count === 1 ? "" : "s"} — eligibility, salary, important dates and
          direct apply links.
        </p>
      </header>

      <main>
        {jobs.length === 0 ? (
          <p className="text-center py-16 text-gray-500">
            No active {name.toLowerCase()} jobs right now.{" "}
            <Link href="/jobs" className="text-blue-600 hover:underline">
              Browse all jobs →
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.slug || job.id} job={job} />
            ))}
          </div>
        )}

        {jobs.length > 0 && (
          <p className="text-center mt-8">
            <Link
              href={`/jobs?category=${encodeURIComponent(categoryValue)}`}
              className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View &amp; filter all {count} {name.toLowerCase()} jobs →
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
