"use client";

import JobSectionCard from "./JobSectionCard";
import { buildImportantDates } from "@/lib/importantDates";
import { formatDisplayDate } from "@/lib/jobs";

const has = (v) => v !== null && v !== undefined && v !== "";

function DateRow({ label, value, color }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
      <span
        aria-hidden="true"
        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${color || "bg-yellow-400"}`}
      />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/**
 * Important Dates section.
 * Renders the CMS-friendly important_dates_text rows (with status dots)
 * and merges the structured date columns for full backward compatibility.
 */
export default function ImportantDatesSection({ job }) {
  const parsed = buildImportantDates(job.importantDatesText, job.importantDates);

  const structured = [
    { label: "Application Start", value: job.startDate, color: "bg-green-500" },
    { label: "Last Date", value: job.endDate, color: "bg-red-500" },
    { label: "Admit Card Release", value: job.admitReleaseDate, color: "bg-amber-400" },
    { label: "Exam Date", value: job.examDate, color: "bg-amber-400" },
    { label: "Result Date", value: job.resultDate, color: "bg-amber-400" },
  ]
    .filter((r) => has(r.value))
    .map((r) => ({ ...r, value: formatDisplayDate(r.value) }));

  // Prefer CMS text rows; fall back to structured columns; merge when both
  // exist without duplicating labels.
  let rows;
  if (parsed.length > 0) {
    const seenLabels = new Set(parsed.map((r) => r.label.toLowerCase()));
    rows = [...parsed, ...structured.filter((r) => !seenLabels.has(r.label.toLowerCase()))];
  } else {
    rows = structured;
  }

  if (rows.length === 0) return null;

  return (
    <JobSectionCard title="📅 Important Dates">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((row) => (
          <DateRow key={`${row.label}-${row.value}`} {...row} />
        ))}
      </div>
    </JobSectionCard>
  );
}
