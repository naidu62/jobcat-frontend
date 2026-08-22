// app/scholarships/page.js
import Link from "next/link";
import { getPublishedList } from "@/lib/listings";
import ScholarshipCard from "@/app/components/ScholarshipCard";

export const revalidate = 300;

export const metadata = {
  title: "Scholarships 2026 — Latest Scholarships for Students | JobCat",
  description:
    "Find active scholarships for students — provider, eligibility, award amount, last date and official application links, updated regularly.",
  alternates: { canonical: "/scholarships" },
  openGraph: {
    title: "Scholarships 2026 | JobCat.in",
    description:
      "Find active scholarships for students — provider, eligibility, award amount, last date and official application links.",
  },
};

export default async function ScholarshipsPage() {
  const scholarships = await getPublishedList("scholarships");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Scholarships
        </h1>
        <p className="text-base text-gray-600">
          Active scholarships for students — eligibility, amounts, deadlines
          and how to apply.
        </p>
      </header>

      <main>
        {scholarships.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4" aria-hidden>
              🎓
            </p>
            <p className="text-lg text-gray-600">
              Scholarships will be updated soon.
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse Latest Jobs →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {scholarships.length} active scholarship
              {scholarships.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scholarships.map((item) => (
                <ScholarshipCard
                  key={item.slug || item.id}
                  item={item}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
