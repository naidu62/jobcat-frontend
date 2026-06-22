"use client";

import JobSectionCard from "./JobSectionCard";
import RelatedJobs from "./RelatedJobs";

export default function JobDetails({ job }) {
  const hasValue = (v) => v !== null && v !== undefined && v !== "";

  return (
    <div className="space-y-6">

      {/* Job Summary Card */}
     <div className="pb-6 border-b border-gray-200">
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

      <JobSectionCard title="📅 Important Dates">

  <div className="space-y-3">

    {hasValue(job.startDate) && (
      <p>
        <strong>Application Start :</strong> {job.startDate}
      </p>
    )}

    {hasValue(job.endDate) && (
      <p>
        <strong>Application End :</strong> {job.endDate}
      </p>
    )}

    {hasValue(job.admitReleaseDate) && (
      <p>
        <strong>Admit Release :</strong> {job.admitReleaseDate}
      </p>
    )}

    {hasValue(job.examDate) && (
      <p>
        <strong>Exam Date :</strong> {job.examDate}
      </p>
    )}

    {hasValue(job.resultDate) && (
      <p>
        <strong>Result Date :</strong> {job.resultDate}
      </p>
    )}

  </div>

</JobSectionCard>

      {/* Qualification */}
      {hasValue(job.qualification) && (
        <JobSectionCard title="🎓 Qualification">
          <p>{job.qualification}</p>
        </JobSectionCard>
      )}

      {(hasValue(job.dobFrom) || hasValue(job.dobTo)) && (

  <JobSectionCard title="🎂 Age Limit">

    <div className="space-y-3">

      {hasValue(job.dobFrom) && (
        <p>
          <strong>DOB From :</strong> {job.dobFrom}
        </p>
      )}

      {hasValue(job.dobTo) && (
        <p>
          <strong>DOB To :</strong> {job.dobTo}
        </p>
      )}

    </div>

  </JobSectionCard>

)}

      {/* Vacancy Details */}
      {job.vacancyDetails?.length > 0 && (
        <JobSectionCard title="📋 Vacancy Details">

          <div className="overflow-x-auto">
           <table className="w-full text-sm">

              <thead className="border-b">
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

     {job.extraFields?.length > 0 && (

  <JobSectionCard title="ℹ Additional Information">

    <div className="space-y-3">

      {job.extraFields.map((field, index) => (
        <div key={index}>

          <strong>
            {field.field_name} :
          </strong>{" "}

          {field.field_value}

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

                <button
                  onClick={() => {
                     if (navigator.share) {
                       navigator.share({
                          title: job.title,
                          text: job.title,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied!");
                      }
                    }}
                    className="w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Share Job
                  </button>

        </div>

      </JobSectionCard>

          <RelatedJobs currentJob={job} />
    </div>
  );
}