"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Share2, Star } from "lucide-react";
import JobSectionCard from "./JobSectionCard";
import ShareMenu from "./ShareMenu";
import { SITE_URL } from "@/lib/api";

const has = (v) => v !== null && v !== undefined && v !== "";

function LinkButton({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
    >
      {children}
    </a>
  );
}

/**
 * Important Links card + community action row:
 *   [ 💬 Comment ] [ ↗ Share ] [ ⭐ Track Application ]
 */
export default function ImportantLinksSection({ job = {} }) {
  const slugOrId = job.slug || job.id;
  // Deterministic on first render (server + client identical, so hydration
  // can never mismatch), then upgraded to the real browser origin.
  const [shareUrl, setShareUrl] = useState(`${SITE_URL}/jobs/${slugOrId}`);

  useEffect(() => {
    try {
      setShareUrl(`${window.location.origin}/jobs/${job.slug || job.id}`);
    } catch {
      /* keep SITE_URL-based fallback */
    }
  }, [job.slug, job.id]);

  const scrollTo = (id) => {
    try {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      /* no-op */
    }
  };

  return (
    <JobSectionCard title="🔗 Important Links">
      {/* Community actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          type="button"
          onClick={() => scrollTo("comments")}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-2 sm:px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 active:bg-gray-100 transition"
          aria-label="Jump to comments"
        >
          <MessageSquare size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <ShareMenu url={shareUrl} title={job.title || "JobCat"} />

        <button
          type="button"
          onClick={() => scrollTo("track-application")}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-2 sm:px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-800 hover:bg-amber-50 hover:text-amber-700 active:bg-gray-100 transition"
          aria-label="Track this application"
        >
          <Star size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Track</span>
        </button>
      </div>

      {/* Official links */}
      <div className="grid gap-3">
        {has(job.applyUrl) && <LinkButton href={job.applyUrl}>Apply Online</LinkButton>}
        {has(job.admitCardUrl) && <LinkButton href={job.admitCardUrl}>Admit Card</LinkButton>}
        {(has(job.notificationUrl) || has(job.notificationFileUrl)) && (
          <LinkButton href={job.notificationUrl || job.notificationFileUrl}>
            Notification PDF
          </LinkButton>
        )}
        {has(job.officialWebsite) && (
          <LinkButton href={job.officialWebsite}>Official Website</LinkButton>
        )}
      </div>
    </JobSectionCard>
  );
}
