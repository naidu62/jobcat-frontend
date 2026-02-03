// app/components/JobDetails.jsx
"use client";
import JobSectionCard from "./JobSectionCard";

export default function JobDetails({ job }) {
  const hasValue = (v) => v !== undefined && v !== null && v !== "";

  return (
    <div className="space-y-6">

      {/* 🧾 Title */}
      <h1 className="text-3xl font-bold text-blue-700 text-center">
        {job.job_title || "N/A"}
      </h1>

      {/* 🧭 Meta Info */}
      <div className="text-center text-gray-600 text-sm space-y-1">
        {hasValue(job.job_category) && <p>Category: {job.job_category}</p>}
        {hasValue(job.job_type) && <p>Type: {job.job_type}</p>}
        {hasValue(job.details?.no_of_posts) && (
          <p>Total Vacancies: {job.details.no_of_posts}</p>
        )}
      </div>

      {/* 📅 Important Dates */}
      {(hasValue(job.application_start_date) ||
        hasValue(job.application_end_date)) && (
        <JobSectionCard title="📅 Important Dates">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
            {hasValue(job.application_start_date) && (
              <li>Application Start: {job.application_start_date}</li>
            )}
            {hasValue(job.application_end_date) && (
              <li>Application End: {job.application_end_date}</li>
            )}
          </ul>
        </JobSectionCard>
      )}

      {/* 🎓 Qualification */}
      {hasValue(job.details?.qualification_text) && (
        <JobSectionCard title="🎓 Qualification">
          <p>{job.details.qualification_text}</p>
        </JobSectionCard>
      )}

      {/* 🎂 Age Limit */}
      {hasValue(job.details?.age_limit_text) && (
        <JobSectionCard title="🎂 Age Limit">
          <p>{job.details.age_limit_text}</p>
        </JobSectionCard>
      )}

      {/* 🧪 Selection Process */}
      {hasValue(job.details?.selection_process_text) && (
        <JobSectionCard title="🧪 Selection Process">
          <p>{job.details.selection_process_text}</p>
        </JobSectionCard>
      )}

      {/* 🔗 Important Links */}
      {(hasValue(job.apply_url) ||
        hasValue(job.official_notification_url)) && (
        <JobSectionCard title="🔗 Important Links">
          <ul className="space-y-2">
            {hasValue(job.apply_url) && (
              <li>
                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Apply Online
                </a>
              </li>
            )}
            {hasValue(job.official_notification_url) && (
              <li>
                <a
                  href={job.official_notification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Official Notification
                </a>
              </li>
            )}
          </ul>
        </JobSectionCard>
      )}
    </div>
  );
}