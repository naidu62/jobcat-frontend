"use client";

import Link from "next/link";
import { formatDisplayDate } from "@/lib/jobs";
import SaveButton from "./SaveButton";
import ApplyButton from "./ApplyButton";

// Read a value either from top-level job props or from the backend's
// generic extra_fields extension ([{ field_name, field_value }]).
function fieldValue(job, names) {
  for (const name of names) {
    const v = job?.[name];
    if (v !== undefined && v !== null && v !== "") return v;
  }

  const extras = Array.isArray(job?.extra_fields) ? job.extra_fields : [];
  for (const f of extras) {
    const key = String(f?.field_name ?? "").trim().toLowerCase();
    if (names.some((n) => key === n.toLowerCase()) && f.field_value) {
      return f.field_value;
    }
  }
  return null;
}

/**
 * SEO-friendly job card: semantic <article> with a real heading,
 * <time> machine-readable dates and schema.org microdata so crawlers
 * see structured job data in the server-rendered HTML.
 */
export default function JobCard({ job }) {
  if (!job) return null;

  const detailHref = `/jobs/${job.slug || job.id}`;
  const organization =
    fieldValue(job, ["organization", "organisation", "company_name"]) ||
    fieldValue(job, ["company"]) ||
    null;
  const location =
    fieldValue(job, ["location", "job_location"]) ||
    [job.district, job.state].filter(Boolean).join(", ") ||
    null;
  const salary = fieldValue(job, ["salary", "pay_scale", "pay"]);
  const jobType = fieldValue(job, ["job_type", "employment_type"]);
  const lastDate = job.end_date || job.last_date || null;
  const vacancies = job.total_vacancies ?? job.vacancies ?? null;
  const qualification = job.qualification || null;
  const titleText = job.title || "Untitled Job";

  return (
    <article
      itemScope
      itemType="https://schema.org/JobPosting"
      className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col justify-between h-full transition-transform hover:scale-[1.02]"
    >
      {/* Save / un-save toggle (top-right, touch friendly) */}
      <SaveButton jobId={job.id} />
      {/* Title */}
      <div>
        {/* Personalization badge (recommendations payload only) */}
        {(job.reasons?.length > 0 || job.alert_match) && (
          <span className="inline-block mb-1.5 text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
            ⭐ Matches your profile
          </span>
        )}
        <h3 className="mb-2" itemProp="title">
          <Link
            href={detailHref}
            itemProp="url"
            className="text-lg font-bold text-blue-700 line-clamp-2 cursor-pointer hover:underline"
          >
            {titleText}
          </Link>
        </h3>

        {/* Job type */}
        {jobType && (
          <span
            itemProp="employmentType"
            className="inline-block text-xs px-2 py-1 bg-gray-100 rounded capitalize"
          >
            {jobType}
          </span>
        )}

        {/* Organization / Company */}
        {organization && (
          <p className="text-sm font-medium text-gray-800 mt-2" itemProp="hiringOrganization">
            🏢 {organization}
          </p>
        )}

        {/* Location */}
        {location && (
          <p
            className="text-sm text-gray-700 mt-1"
            itemProp="jobLocation"
          >
            📍 <span itemProp="address">{location}</span>
          </p>
        )}

        {/* Qualification */}
        {qualification && (
          <p className="text-sm text-gray-700 mt-1 line-clamp-1">
            🎓{" "}
            <span itemProp="qualifications" className="line-clamp-1">
              {qualification}
            </span>
          </p>
        )}

        {/* Salary */}
        {salary && (
          <p className="text-sm text-gray-700 mt-1">
            💰{" "}
            <span itemProp="salaryCurrency" content="INR" hidden>
              INR
            </span>
            <span itemProp="estimatedSalary">{salary}</span>
          </p>
        )}

        {/* Last Date */}
        <p className="text-sm text-gray-600 mt-1">
          📅 Last Date:{" "}
          {lastDate ? (
            <time
              dateTime={lastDate}
              itemProp="validThrough"
              className="font-semibold text-red-600"
            >
              {formatDisplayDate(lastDate)}
            </time>
          ) : (
            <span className="font-semibold text-red-600">N/A</span>
          )}
        </p>
      </div>

      {/* Footer meta */}
      <div className="flex justify-between text-xs text-gray-600 border-t pt-2 mt-3">
        <span>
          👥 Vacancies:{" "}
          <strong itemProp="totalJobOpenings" content={String(vacancies ?? "")}>
            {vacancies ?? "N/A"}
          </strong>
        </span>

        <span>📂 {job.category || "General"}</span>
      </div>

      {/* View Details Button */}
      <Link
        href={detailHref}
        className="mt-3 block text-center text-sm border border-blue-600 text-blue-600 py-2.5 rounded-md hover:bg-blue-50 transition"
      >
        View Details
      </Link>

      {/* Apply / Track button */}
      <ApplyButton jobId={job.id} />

      {/* Apply Button */}
      {job.apply_online_link && (
        <a
          href={job.apply_online_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-sm bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Apply Now
        </a>
      )}
    </article>
  );
}
