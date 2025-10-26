// app/components/JobDetails.jsx
"use client";
import JobSectionCard from "./JobSectionCard";

export default function JobDetails({ job }) {
  const hasValue = (v) => v && v !== "" && v !== null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-blue-700 text-center">{job.title || "N/A"}</h1>

      {/* Meta Info */}
      <div className="text-center text-gray-600 text-sm">
        {hasValue(job.category) && <p>Category: {job.category}</p>}
        {hasValue(job.total_vacancies) && <p>Total Vacancies: {job.total_vacancies}</p>}
      </div>

      {/* Important Dates */}
      {(hasValue(job.start_date) || hasValue(job.end_date) || hasValue(job.exam_date)) && (
        <JobSectionCard title="📅 Important Dates">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-2">
            {hasValue(job.start_date) && <li>Start Date: {job.start_date}</li>}
            {hasValue(job.end_date) && <li>End Date: {job.end_date}</li>}
            {hasValue(job.exam_date) && <li>Exam Date: {job.exam_date}</li>}
            {hasValue(job.admit_release_date) && <li>Admit Card: {job.admit_release_date}</li>}
          </ul>
        </JobSectionCard>
      )}

      {/* Qualification */}
      {hasValue(job.qualification) && (
        <JobSectionCard title="🎓 Qualification">
          <p>{job.qualification}</p>
        </JobSectionCard>
      )}

      {/* Age Limit */}
      {(hasValue(job.dob_from) || hasValue(job.dob_to)) && (
        <JobSectionCard title="🎂 Age Limit">
          <p>
            {job.dob_from && `From: ${job.dob_from}`}{" "}
            {job.dob_to && `to ${job.dob_to}`}
          </p>
          {hasValue(job.age_relaxation) && <p>Relaxation: {job.age_relaxation}</p>}
        </JobSectionCard>
      )}

      {/* Fees */}
      {(hasValue(job.fee_general) || hasValue(job.fee_obc)) && (
        <JobSectionCard title="💰 Application Fee">
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-1">
            {hasValue(job.fee_general) && <li>General: {job.fee_general}</li>}
            {hasValue(job.fee_obc) && <li>OBC: {job.fee_obc}</li>}
            {hasValue(job.fee_sc) && <li>SC: {job.fee_sc}</li>}
            {hasValue(job.fee_st) && <li>ST: {job.fee_st}</li>}
            {hasValue(job.fee_female) && <li>Female: {job.fee_female}</li>}
          </ul>
        </JobSectionCard>
      )}

      {/* Important Links */}
      {(hasValue(job.apply_online_link) ||
        hasValue(job.notification_pdf_link) ||
        hasValue(job.official_website)) && (
        <JobSectionCard title="🔗 Important Links">
          <ul className="space-y-2">
            {hasValue(job.apply_online_link) && (
              <li>
                <a
                  href={job.apply_online_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Apply Online
                </a>
              </li>
            )}
            {hasValue(job.notification_pdf_link) && (
              <li>
                <a
                  href={job.notification_pdf_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Notification PDF
                </a>
              </li>
            )}
            {hasValue(job.official_website) && (
              <li>
                <a
                  href={job.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Official Website
                </a>
              </li>
            )}
          </ul>
        </JobSectionCard>
      )}
    </div>
  );
}