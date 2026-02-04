"use client";
import JobSectionCard from "./JobSectionCard";

export default function JobDetails({ job }) {
  const hasValue = (v) => v !== undefined && v !== null && v !== "";

  return (
    <div className="space-y-8">

      {/* 🧾 JOB TITLE */}
      <h1 className="text-3xl font-bold text-blue-700 text-center">
        {job.title || "Untitled Job"}
      </h1>

      {/* 🧭 META INFO */}
      <div className="text-center text-gray-600 text-sm space-y-1">
        {hasValue(job.category) && <p>Category: {job.category}</p>}
        {hasValue(job.type) && <p>Type: {job.type}</p>}
        {hasValue(job.vacancies) && (
          <p>Total Vacancies: {job.vacancies}</p>
        )}
      </div>

      {/* 📅 IMPORTANT DATES */}
      {(hasValue(job.startDate) || hasValue(job.endDate)) && (
        <JobSectionCard title="📅 Important Dates">
          <ul className="space-y-2">
            {hasValue(job.startDate) && (
              <li>Application Start: {job.startDate}</li>
            )}
            {hasValue(job.endDate) && (
              <li>Application End: {job.endDate}</li>
            )}
          </ul>
        </JobSectionCard>
      )}

      {/* 🎓 QUALIFICATION */}
      {hasValue(job.qualification) && (
        <JobSectionCard title="🎓 Qualification">
          <p>{job.qualification}</p>
        </JobSectionCard>
      )}

      {/* 🎂 AGE LIMIT */}
      {hasValue(job.ageLimit) && (
        <JobSectionCard title="🎂 Age Limit">
          <p>{job.ageLimit}</p>
        </JobSectionCard>
      )}

      {/* 🧪 SELECTION PROCESS */}
      {hasValue(job.selectionProcess) && (
        <JobSectionCard title="🧪 Selection Process">
          <p>{job.selectionProcess}</p>
        </JobSectionCard>
      )}

      {/* 🔗 IMPORTANT LINKS */}
      {(hasValue(job.applyUrl) || hasValue(job.notificationUrl)) && (
        <JobSectionCard title="🔗 Important Links">
          <ul className="space-y-2">
            {hasValue(job.applyUrl) && (
              <li>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Apply Online
                </a>
              </li>
            )}
            {hasValue(job.notificationUrl) && (
              <li>
                <a
                  href={job.notificationUrl}
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