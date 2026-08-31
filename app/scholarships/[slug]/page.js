// app/scholarships/[slug]/page.js
// Complete internal details page for a single scholarship.
// Server-rendered from the public DRF detail endpoint; every optional field
// is rendered conditionally so missing data never breaks the layout.
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedDetail,
  label,
  formatAmount,
  formatListDate,
} from "@/lib/listings";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getPublishedDetail("scholarships", slug);
  if (!item) {
    return { title: "Scholarship not found" };
  }
  return {
    title: item.meta_title || `${item.title} — Scholarship | JobCat`,
    description:
      item.meta_description ||
      item.short_description ||
      `Scholarship details, eligibility, amount and how to apply for ${item.title}.`,
    alternates: item.canonical_url
      ? { canonical: item.canonical_url }
      : undefined,
  };
}

export default async function ScholarshipDetailPage({ params }) {
  const { slug } = await params;
  const item = await getPublishedDetail("scholarships", slug);
  if (!item) return notFound();

  const providerType = label("providerType", item.provider_type);
  const education = label("educationLevel", item.education_level);
  const gender = item.gender ? label("gender", item.gender) : null;
  const category = label("scholarshipCategory", item.category);
  const startDate = formatListDate(item.application_start_date);
  const endDate = formatListDate(item.application_end_date);
  const benefits = Array.isArray(item.benefits) ? item.benefits : [];
  const documents = Array.isArray(item.documents) ? item.documents : [];
  const provider = item.provider_name || item.ministry || item.department || item.organization || null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/scholarships" className="hover:text-blue-700">
          Scholarships
        </Link>
        <span aria-hidden="true"> › </span>
        <span className="text-gray-700">{item.title}</span>
      </nav>

      <article className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {category && (
              <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                {category}
              </span>
            )}
            {item.is_verified && (
              <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                ✓ Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {item.title}
          </h1>
          {item.short_title && (
            <p className="mt-1 text-sm text-gray-500">{item.short_title}</p>
          )}
          {provider && (
            <p className="mt-3 text-sm font-medium text-gray-700">
              {provider}
              {providerType ? (
                <span className="text-gray-500 font-normal"> · {providerType}</span>
              ) : null}
            </p>
          )}
        </header>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Key facts */}
          {(education ||
            gender ||
            item.minimum_percentage ||
            item.state ||
            item.annual_family_income ||
            startDate ||
            endDate) && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {education && (
                <Fact label="Education level" value={education} />
              )}
              {item.minimum_percentage && (
                <Fact label="Minimum marks" value={`${item.minimum_percentage}%`} />
              )}
              {gender && <Fact label="Eligible gender" value={gender} />}
              {item.state && <Fact label="State" value={item.state} />}
              {item.annual_family_income && (
                <Fact
                  label="Family income limit"
                  value={`₹${formatAmount(item.annual_family_income)} / year`}
                />
              )}
              {startDate && <Fact label="Application opens" value={startDate} />}
              {endDate && <Fact label="Last date to apply" value={endDate} />}
            </dl>
          )}

          {/* Benefit amounts */}
          {benefits.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Scholarship amount &amp; benefits
              </h2>
              <ul className="space-y-2">
                {benefits.map((b) => {
                  const amount = Number(b.maximum_amount ?? b.amount);
                  return (
                    <li
                      key={b.id}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700 border border-gray-100 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-gray-900">
                        {label("benefitType", b.benefit_type)}
                      </span>
                      {Number.isFinite(amount) && amount > 0 && (
                        <span className="font-semibold text-green-700">
                          ₹{formatAmount(amount)}
                        </span>
                      )}
                      {b.frequency && b.frequency !== "one_time" && (
                        <span className="text-gray-500">
                          ({label("frequency", b.frequency)})
                        </span>
                      )}
                      {b.benefit_description && (
                        <span className="w-full text-sm text-gray-600">
                          {b.benefit_description}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Description / eligibility */}
          {item.description && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                About this scholarship
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            </section>
          )}

          {item.other_eligibility && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Eligibility
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {item.other_eligibility}
              </p>
            </section>
          )}

          {item.application_process && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                How to apply
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {item.application_process}
              </p>
            </section>
          )}

          {/* Required documents */}
          {documents.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Documents needed
              </h2>
              <ul className="space-y-1.5 text-sm text-gray-700">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-start gap-2">
                    <span aria-hidden="true">•</span>
                    <span>
                      {d.document_name}
                      {d.is_mandatory ? (
                        <span className="text-red-600"> (required)</span>
                      ) : (
                        ""
                      )}
                      {d.description ? ` — ${d.description}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {item.application_link ? (
              <a
                href={item.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Apply Online ↗
              </a>
            ) : (
              <p className="text-sm text-gray-500">
                Applications are currently closed or unavailable online.
              </p>
            )}
            {item.official_website && (
              <a
                href={item.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Official Website ↗
              </a>
            )}
          </div>
        </div>
      </article>

      <p className="mt-6 text-center text-sm">
        <Link href="/scholarships" className="text-blue-600 hover:underline">
          ← All scholarships
        </Link>
      </p>
    </div>
  );
}

function Fact({ label: factLabel, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">
        {factLabel}
      </dt>
      <dd className="text-sm font-medium text-gray-800">{value}</dd>
    </div>
  );
}
