"use client";

import JobSectionCard from "./JobSectionCard";

export default function JobDetails({ job }) {
  const hasValue = (v) => v !== null && v !== undefined && v !== "";

  return (
    <div className="space-y-6">

      {/* Job Summary Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          {job.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-500">Category</p>
            <p>{job.category || "N/A"}</p>
          </div>

          {hasValue(job.advertisementRefNo) && (
            <div>
              <p className="font-semibold text-gray-500">
                Advertisement Ref No
              </p>
              <p>{job.advertisementRefNo}</p>
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-500">
              Total Vacancies
            </p>
            <p>{job.totalVacancies}</p>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <JobSectionCard title="📅 Important Dates">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {hasValue(job.startDate) && (
            <div className="border-b pb-2">
              <p className="text-gray-500 text-xs">
                Application Start
              </p>
              <p>{job.startDate}</p>
            </div>
          )}

          {hasValue(job.endDate) && (
            <div className="border-b pb-2">
              <p className="text-gray-500 text-xs">
                Application End
              </p>
              <p>{job.endDate}</p>
            </div>
          )}

          {hasValue(job.admitReleaseDate) && (
            <div className="border-b pb-2">
              <p className="text-gray-500 text-xs">
                Admit Release
              </p>
              <p>{job.admitReleaseDate}</p>
            </div>
          )}

          {hasValue(job.examDate) && (
            <div className="border-b pb-2">
              <p className="text-gray-500 text-xs">
                Exam Date
              </p>
              <p>{job.examDate}</p>
            </div>
          )}

          {hasValue(job.resultDate) && (
            <div className="border-b pb-2">
              <p className="text-gray-500 text-xs">
                Result Date
              </p>
              <p>{job.resultDate}</p>
            </div>
          )}

        </div>
      </JobSectionCard>

      {/* Qualification */}
      {hasValue(job.qualification) && (
        <JobSectionCard title="🎓 Qualification">
          <p>{job.qualification}</p>
        </JobSectionCard>
      )}

      {/* Age Limit */}
      {(hasValue(job.dobFrom) || hasValue(job.dobTo)) && (
        <JobSectionCard title="🎂 Age Limit">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {hasValue(job.dobFrom) && (
              <div>
                <p className="text-gray-500 text-xs">
                  DOB From
                </p>
                <p>{job.dobFrom}</p>
              </div>
            )}

            {hasValue(job.dobTo) && (
              <div>
                <p className="text-gray-500 text-xs">
                  DOB To
                </p>
                <p>{job.dobTo}</p>
              </div>
            )}

          </div>

        </JobSectionCard>
      )}

      {/* Vacancy Details */}
      {job.vacancyDetails?.length > 0 && (
        <JobSectionCard title="📋 Vacancy Details">

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">

              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">
                    Post Name
                  </th>

                  <th className="text-left px-4 py-3">
                    Vacancies
                  </th>
                </tr>
              </thead>

              <tbody>
                {job.vacancyDetails.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {item.post_name}
                    </td>

                    <td className="px-4 py-3">
                      {item.vacancy_number}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </JobSectionCard>
      )}

      {/* Additional Information */}
      {job.extraFields?.length > 0 && (
        <JobSectionCard title="ℹ Additional Information">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {job.extraFields.map((field, index) => (
              <div
                key={index}
                className="border rounded-lg p-3"
              >
                <p className="text-xs text-gray-500 uppercase">
                  {field.field_name}
                </p>

                <p className="mt-1">
                  {field.field_value}
                </p>
              </div>
            ))}

          </div>

        </JobSectionCard>
      )}

      {/* Important Links */}
      <JobSectionCard title="🔗 Important Links">

        <div className="grid gap-3">

          {hasValue(job.applyUrl) && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Online
            </a>
          )}

          {hasValue(job.admitCardUrl) && (
            <a
              href={job.admitCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Admit Card
            </a>
          )}

          {hasValue(job.notificationUrl) && (
            <a
              href={job.notificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Notification PDF
            </a>
          )}

          {hasValue(job.officialWebsite) && (
            <a
              href={job.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Official Website
            </a>
          )}

        </div>

      </JobSectionCard>

    </div>
  );
}