// app/jobs/[id]/page.js
// Server shell for the job detail page.
// - generateMetadata: dynamic title/description per SEO spec
//     "SSC CGL 2026 Notification, Eligibility, Apply Online | JobCat"
// - JobPosting + BreadcrumbList JSON-LD for Google Jobs / rich results
// - Visible breadcrumb trail + RelatedContent internal linking
// The client component still fetches interactively; this server fetch only
// powers metadata, structured data and related links (ISR-cached 1h).

import JobDetailClient from "./JobDetailClient";
import RelatedContent from "@/app/components/RelatedContent";
import { getJobDetails, SITE_URL } from "@/lib/api";
import { slugify } from "@/lib/jobs";
const DEFAULT_TITLE_SUFFIX = ", Eligibility, Apply Online | JobCat";

function buildTitle(job) {
  const base = job?.meta_title || job?.title || "Job Details";
  let title = base;
  if (!/eligibility/i.test(title)) {
    title = `${title}${DEFAULT_TITLE_SUFFIX}`;
  } else if (!/\|\s*JobCat\s*$/.test(title)) {
    title = `${title} | JobCat`;
  }
  return title;
}

function buildDescription(job) {
  if (job?.meta_description) return job.meta_description;
  const t = job?.title || "This recruitment";
  return (
    `Latest ${t} recruitment details, vacancies, eligibility, important dates ` +
    `and application process.`
  ).slice(0, 300);
}

function jobUrl(job, id) {
  return `/jobs/${job?.slug || id}`;
}

/** https://schema.org/JobPosting — Google Jobs structured data. */
function jobPostingJsonLd(job, id) {
  const url = `${SITE_URL}${jobUrl(job, id)}`;
  const orgName =
    job.organization || job.company || job.organization_name ||
    job.company_name || "Government of India";

  const location = [job.location, job.district, job.state]
    .filter(Boolean)
    .join(", ");

  const data = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description:
      job.meta_description ||
      [job.qualification, job.selection_process]
        .filter(Boolean)
        .join("\n\n") ||
      buildDescription(job),
    datePosted: job.created_at,
    url,
    identifier: {
      "@type": "PropertyValue",
      name: orgName,
      value: String(job.advertisement_ref_no || job.id),
    },
    hiringOrganization: {
      "@type": "Organization",
      name: orgName,
      ...(job.company_logo
        ? { logo: job.company_logo.startsWith("http") ? job.company_logo : `${SITE_URL}${job.company_logo}` }
        : {}),
    },
    ...(job.job_type ? { employmentType: String(job.job_type).toUpperCase().replace(/\s+/g, "_") } : {}),
    ...(location
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.district || job.location || undefined,
              addressRegion: job.state || undefined,
              addressCountry: "IN",
            },
          },
        }
      : {}),
    ...(job.end_date ? { validThrough: `${job.end_date}T23:59:59+05:30` } : {}),
    ...(job.apply_url || job.apply_online_link
      ? {
          applicationContact: {
            "@type": "ContactPoint",
            url: job.apply_url || job.apply_online_link,
          },
        }
      : {}),
    industry: job.category || undefined,
    totalJobOpenings: job.total_vacancies || undefined,
  };
  return data;
}

/** BreadcrumbList schema: Home > Category > Job */
function breadcrumbJsonLd(job, id) {
  const category = (job?.category || "").trim();
  const trail = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Jobs", url: `${SITE_URL}/jobs` },
  ];
  if (category) {
    trail.push({
      name: category,
      url: `${SITE_URL}/jobs/category/${slugify(category)}`,
    });
  }
  trail.push({ name: job.title, url: `${SITE_URL}${jobUrl(job, id)}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const job = await getJobDetails(id);
    const title = buildTitle(job);
    const description = buildDescription(job);

    return {
      // absolute: bypasses the root "%s | JobCat" template — buildTitle
      // already manages the "| JobCat" suffix itself.
      title: { absolute: title },
      description,
      alternates: {
        canonical: job?.canonical_url || jobUrl(job, id),
      },
      robots: { index: job?.allow_indexing !== false },
      openGraph: {
        type: "article",
        title,
        description,
        url: `${SITE_URL}${jobUrl(job, id)}`,
        siteName: "JobCat.in",
        images: [{ url: "/logo.png", width: 512, height: 512, alt: "JobCat.in" }],
      },
    };
  } catch {
    return {
      title: "Job not found",
      robots: { index: false },
    };
  }
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function JobPage({ params }) {
  const { id } = await params;

  // Best-effort server fetch for SEO extras. Never blocks rendering of the
  // interactive client view — on failure we simply omit structured data.
  let job = null;
  try {
    job = await getJobDetails(id);
  } catch {
    job = null;
  }

  const indexable =
    job && job.allow_indexing !== false && job.publication_status === "published";

  return (
    <>
      {indexable && (
        <>
          <JsonLd data={jobPostingJsonLd(job, id)} />
          <JsonLd data={breadcrumbJsonLd(job, id)} />
        </>
      )}
      <JobDetailClient id={id} initialJob={indexable ? job : null} />
      {indexable && <RelatedContent job={job} />}
    </>
  );
}
