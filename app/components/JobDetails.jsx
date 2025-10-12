// app/components/JobDetails.jsx
import Link from "next/link";

export default function JobDetails({ job }) {
  if (!job) return <div className="p-6">No details available.</div>;

  return (
    <article className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-md border border-gray-200">
      <div className="mb-4">
        <Link href="/" className="inline-block text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2">
           <span className="text-2xl leading-none">←</span>
           <span>Back to Jobs</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
      <p className="text-gray-500 mb-6">Ref: {job.advertisement_ref_no || "N/A"}</p>

      <div className="space-y-3 text-gray-700">
        <p><strong>Category:</strong> {job.category || "—"}</p>
        <p><strong>Total Vacancies:</strong> {job.total_vacancies ?? "—"}</p>
        <p>
          <strong>Start Date:</strong>{" "}
          {job.start_date ? new Date(job.start_date).toLocaleDateString() : "—"}
        </p>
        <p>
          <strong>Last Updated:</strong>{" "}
          {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : "—"}
        </p>
      </div>

      {job.description && (
        <div className="mt-6 border-t border-gray-200 pt-4 prose prose-gray max-w-none">
          <div dangerouslySetInnerHTML={{ __html: job.description }} />
        </div>
      )}
    </article>
  );
}