import JobDetailClient from "./JobDetailClient";
import { getJobDetails, SITE_URL } from "@/lib/api";

// Lookup supports both numeric id and slug.
export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const job = await getJobDetails(id);
    const slug = job?.slug || id;
    const title =
      job?.meta_title || job?.title || "Job Details";
    const description =
      job?.meta_description ||
      `${job?.title ?? "Job"} — vacancies, eligibility, important dates and apply link on JobCat.in.`;

    return {
      title,
      description,
      alternates: {
        canonical: job?.canonical_url || `/jobs/${slug}`,
      },
      robots: { index: job?.allow_indexing !== false },
      openGraph: {
        type: "article",
        title,
        description,
        url: `${SITE_URL}/jobs/${slug}`,
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

export default async function JobPage({ params }) {
  const { id } = await params;
  return <JobDetailClient id={id} />;
}
