// app/schemes/page.js
import Link from "next/link";
import { getPublishedList } from "@/lib/listings";
import SchemeCard from "@/app/components/SchemeCard";

export const revalidate = 300;

export const metadata = {
  title: "Government Schemes 2026 — Central & State Welfare Schemes | JobCat",
  description:
    "Browse active central and state government schemes — eligibility, benefits, important dates and official application links, updated regularly.",
  alternates: { canonical: "/schemes" },
  openGraph: {
    title: "Government Schemes 2026 | JobCat.in",
    description:
      "Browse active central and state government schemes — eligibility, benefits, important dates and official application links.",
  },
};

export default async function SchemesPage() {
  const schemes = await getPublishedList("schemes");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Government Schemes
        </h1>
        <p className="text-base text-gray-600">
          Central and state welfare schemes — eligibility, benefits, dates and
          how to apply.
        </p>
      </header>

      <main>
        {schemes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4" aria-hidden>
              🏛️
            </p>
            <p className="text-lg text-gray-600">
              New schemes will be updated soon.
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
              {schemes.length} active scheme{schemes.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schemes.map((scheme) => (
                <SchemeCard
                  key={scheme.slug || scheme.id}
                  scheme={scheme}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
