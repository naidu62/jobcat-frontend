"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobDetails from "@/app/components/JobDetails";
import ImportantLinksSection from "@/app/components/ImportantLinksSection";
import CommentSection from "@/app/components/comments/CommentSection";
import TrackApplicationPanel from "@/app/components/TrackApplicationPanel";
import { adaptJob } from "@/lib/jobAdapter";
import { getJobDetails } from "@/lib/api";
import { slugify } from "@/lib/jobs";

/** Visible breadcrumb trail: Home > Jobs > Category > Job title. */
function Breadcrumbs({ job }) {
  const category = (job?.category || "").trim();
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 text-sm text-gray-500 flex flex-wrap items-center gap-1"
    >
      <Link href="/" className="hover:text-blue-600 hover:underline">
        Home
      </Link>
      <span aria-hidden="true">›</span>
      <Link href="/jobs" className="hover:text-blue-600 hover:underline">
        Jobs
      </Link>
      {category && (
        <>
          <span aria-hidden="true">›</span>
          <Link
            href={`/jobs/category/${slugify(category)}`}
            className="hover:text-blue-600 hover:underline"
          >
            {category}
          </Link>
        </>
      )}
      <span aria-hidden="true">›</span>
      <span className="text-gray-700 font-medium truncate max-w-[60vw]">
        {job?.title}
      </span>
    </nav>
  );
}

export default function JobDetailClient({ id, initialJob = null }) {
  // initialJob comes from the server shell (SEO payload). The client still
  // refetches when absent so interactive behaviour is unchanged.
  const [job, setJob] = useState(initialJob ? adaptJob(initialJob) : null);
  const [loading, setLoading] = useState(!initialJob);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        const raw = await getJobDetails(id);
        const adapted = adaptJob(raw);

        setJob(adapted);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    if (!initialJob) fetchJob();
  }, [id, initialJob]);

  if (loading) {
    return <p className="text-center py-10">Loading job...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  if (!job) {
    return <p className="text-center py-10">Job not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs job={job} />

      <JobDetails job={job} />

      {/* Community + application actions */}
      <div className="mt-5 space-y-5">
        <ImportantLinksSection job={job} />
        {Number.isInteger(Number(job.id)) && (
          <CommentSection targetType="job" targetId={job.id} />
        )}
        <div id="track-application">
          <TrackApplicationPanel jobId={id} />
        </div>
      </div>
    </div>
  );
}
