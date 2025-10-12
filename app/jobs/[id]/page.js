// app/jobs/[id]/page.js

// ---- choose this import if your file is named "JobDetails.jsx" ----
import JobDetails from "../../components/JobDetails";
// ---- if your file is named "jobdetails.jsx" instead, use:
// import JobDetails from "../../components/jobdetails";
// ------------------------------------------------------------------

import { getJobDetails } from "../../../lib/api";

export default async function JobPage({ params }) {
  const { id } = params;

  try {
    const job = await getJobDetails(id);

    if (!job) {
      return <div className="p-6">Job not found.</div>;
    }

    return (
      <main className="p-6">
        <JobDetails job={job} />
      </main>
    );
  } catch (err) {
    console.error("JobPage error:", err);
    return (
      <main className="p-6">
        <div className="text-red-600">Failed to load job details. Try again later.</div>
      </main>
    );
  }
}