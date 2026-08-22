import JobsClient from "./JobsClient";

export const metadata = {
  title: { absolute: "Latest Government Jobs 2026 — Search & Filter | JobCat" },
  description:
    "Search and filter latest government, private, banking, railway and PSU job notifications by category, state, qualification, salary and last date.",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "Latest Government Jobs 2026 — Search & Filter | JobCat",
    description:
      "Search and filter latest government, private, banking, railway and PSU job notifications by category, state, qualification, salary and last date.",
    url: "/jobs",
  },
};

export default function JobsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 🧭 Title + Description */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Latest Jobs
        </h1>

        <p className="text-base text-gray-600">
          Browse all government and private job notifications in one place.
        </p>
      </header>

      <main>
        <JobsClient />
      </main>
    </div>
  );
}
