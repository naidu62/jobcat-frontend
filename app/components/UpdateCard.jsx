// app/components/UpdateCard.jsx
// Reusable card for the unified "Latest Updates" feed.
// Renders one activity item (job / scheme / scholarship) with a type badge,
// title link and a human-readable "Updated ..." timestamp.

import Link from "next/link";

const TYPE_META = {
  job: {
    label: "Job",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    hrefPrefix: "/jobs",
  },
  scheme: {
    label: "Scheme",
    badgeClass: "bg-green-50 text-green-700 border-green-100",
    hrefPrefix: "/schemes",
  },
  scholarship: {
    label: "Scholarship",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
    hrefPrefix: "/scholarships",
  },
};

/** ISO date -> "today" | "yesterday" | "3 days ago" | "12 Aug 2026". */
export function formatUpdatedAt(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startOfToday - startOfThat) / 86400000);

  if (dayDiff <= 0) return "today";
  if (dayDiff === 1) return "yesterday";
  if (dayDiff < 30) return `${dayDiff} days ago`;

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * @param {object} props
 * @param {"job"|"scheme"|"scholarship"} props.type
 * @param {string} props.title
 * @param {string} [props.href] Detail URL; falls back to the section page.
 * @param {string} [props.date] ISO updated/created timestamp.
 * @param {string} [props.meta] One-line context (organization, provider...).
 */
export default function UpdateCard({ type = "job", title, href, date, meta }) {
  const typeMeta = TYPE_META[type] || TYPE_META.job;
  const detailHref = href || typeMeta.hrefPrefix;
  const updatedLabel = formatUpdatedAt(date);

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Type badge + timestamp */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <span
            className={`inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${typeMeta.badgeClass}`}
          >
            {typeMeta.label}
          </span>
          {updatedLabel && (
            <time
              dateTime={date}
              className="text-xs text-gray-500 shrink-0"
            >
              Updated {updatedLabel}
            </time>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-1 flex-grow">
          <Link
            href={detailHref}
            className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[44px] flex items-start hover:text-blue-700"
          >
            {title || "Untitled"}
          </Link>
        </h3>

        {/* Optional context line */}
        {meta && (
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">{meta}</p>
        )}
      </div>
    </article>
  );
}
