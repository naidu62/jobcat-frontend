"use client";

import JobSectionCard from "./JobSectionCard";
import ImportantDatesSection from "./ImportantDatesSection";
import { formatDisplayDate } from "@/lib/jobs";

const has = (v) => v !== null && v !== undefined && v !== "" && v !== "N/A";

function Row({ label, value }) {
  if (!has(value)) return null;
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-gray-50 px-3 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 break-words">{value}</span>
    </div>
  );
}

export default function JobDetails({ job }) {
  const organization = has(job.organizationName) ? job.organizationName : job.companyName;
  const company = has(job.organizationName) && has(job.companyName) && job.companyName !== job.organizationName ? job.companyName : null;
  const locationParts = [job.location, job.district, job.state].filter(has);
  const location = [...new Set(locationParts)].join(", ");

  const salary =
    has(job.salaryText) ? job.salaryText
    : has(job.salary) ? job.salary
    : has(job.salaryMin) && has(job.salaryMax) ? `₹${Number(job.salaryMin).toLocaleString("en-IN")} – ₹${Number(job.salaryMax).toLocaleString("en-IN")}`
    : has(job.salaryMin) ? `₹${Number(job.salaryMin).toLocaleString("en-IN")}`
    : has(job.salaryMax) ? `₹${Number(job.salaryMax).toLocaleString("en-IN")}`
    : null;

  return (
    <div className="space-y-5">

      {/* ── Job Overview ─────────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {has(job.jobType) && (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
              {job.jobType}
            </span>
          )}
          {has(job.category) && (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
              {job.category}
            </span>
          )}
          {job.isFeatured && (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              ⭐ Featured
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {job.title}
        </h1>

        {(organization || company || location || has(job.advertisementRefNo)) && (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <Row label="Organization" value={organization} />
            <Row label="Company" value={company} />
            <Row label="Location" value={location} />
            <Row label="Advertisement No." value={job.advertisementRefNo} />
            <Row label="Total Vacancies" value={has(job.totalVacancies) ? job.totalVacancies : "N/A"} />
            <Row label="Last Date" value={has(job.endDate) ? formatDisplayDate(job.endDate) : "N/A"} />
          </dl>
        )}

        {/* Quick apply CTA */}
        {has(job.applyUrl) && (
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-[44px] px-6 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Apply Online →
          </a>
        )}
      </section>

      {/* ── Eligibility ──────────────────────────────────────────── */}
      {(has(job.qualification) || has(job.experienceRequired) || has(job.ageLimit) || has(job.dobFrom) || has(job.dobTo)) && (
        <JobSectionCard title="🎓 Eligibility">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Row label="Qualification" value={job.qualification} />
            <Row label="Experience Required" value={job.experienceRequired} />
            <Row label="Age Limit" value={job.ageLimit} />
            <Row label="DOB From" value={has(job.dobFrom) ? formatDisplayDate(job.dobFrom) : null} />
            <Row label="DOB To" value={has(job.dobTo) ? formatDisplayDate(job.dobTo) : null} />
          </dl>
        </JobSectionCard>
      )}

      {/* ── Salary & Fees ────────────────────────────────────────── */}
      {(salary || has(job.applicationFee)) && (
        <JobSectionCard title="💰 Salary & Fees">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Row label="Salary" value={salary} />
            <Row label="Application Fee" value={job.applicationFee} />
          </dl>
        </JobSectionCard>
      )}

      {/* ── Selection Process ────────────────────────────────────── */}
      {has(job.selectionProcess) && (
        <JobSectionCard title="📝 Selection Process">
          <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            {job.selectionProcess}
          </p>
        </JobSectionCard>
      )}

      {/* ── Important Dates ──────────────────────────────────────── */}
      <ImportantDatesSection job={job} />

      {/* ── Vacancy Details ──────────────────────────────────────── */}
      {job.vacancyDetails?.length > 0 && (
        <JobSectionCard title="📋 Post-wise Vacancies">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Post Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Vacancies</th>
                </tr>
              </thead>
              <tbody>
                {job.vacancyDetails.map((item) => (
                  <tr key={item.id ?? item.post_name} className="border-t">
                    <td className="px-4 py-3">{item.post_name}</td>
                    <td className="px-4 py-3">{item.vacancy_number ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </JobSectionCard>
      )}

      {/* ── Additional Information ───────────────────────────────── */}
      {job.extraFields?.length > 0 && (
        <JobSectionCard title="ℹ️ Additional Information">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {job.extraFields.map((field, index) => (
              <div key={index} className="border rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {field.field_name}
                </p>
                <p className="mt-1 text-sm break-words">{field.field_value}</p>
              </div>
            ))}
          </dl>
        </JobSectionCard>
      )}
    </div>
  );
}
