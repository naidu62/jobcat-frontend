// app/components/SchemeCard.jsx
// Presentational card for a government scheme.
// Shared by /schemes listing page and the homepage section.
// Same frame as ScholarshipCard/JobCard ("View details" internal, Apply
// external) with a modest category accent for identity.

import Link from "next/link";
import {
  label,
  formatAmount,
  formatListDate,
} from "@/lib/listings";

export default function SchemeCard({ scheme }) {
  const organization =
    scheme.ministry || scheme.department || null;
  const category = label("schemeCategory", scheme.category);
  const level = label("governmentLevel", scheme.governmentLevel ?? scheme.government_level);
  const startDate = formatListDate(scheme.application_start_date);
  const endDate = formatListDate(scheme.application_end_date);
  const applyUrl =
    scheme.application_link ||
    (scheme.official_website ? scheme.official_website : null);
  const benefits = Array.isArray(scheme.benefits) ? scheme.benefits : [];

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col h-full transition">
      {/* Category + level badges */}
      {(category || level) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {category && (
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium capitalize">
              {category}
            </span>
          )}
          {level && (
            <span className="inline-block text-xs px-2 py-1 bg-gray-100 rounded">
              {level}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="text-lg font-bold text-blue-700 mb-1 line-clamp-2">
        {scheme.title}
      </h2>

      {/* Department / Organization */}
      {organization && (
        <p className="text-sm font-medium text-gray-800">{organization}</p>
      )}

      {/* Eligibility */}
      {scheme.eligibility && (
        <section className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Eligibility
          </h3>
          <p className="text-sm text-gray-700 line-clamp-3">{scheme.eligibility}</p>
        </section>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <section className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Benefits
          </h3>
          <ul className="text-sm text-gray-700 space-y-0.5">
            {benefits.slice(0, 3).map((b) => (
              <li key={b.id}>
                • {label("benefitType", b.benefit_type)}
                {b.amount ? ` — ₹${formatAmount(b.amount)}` : ""}
                {b.frequency && b.frequency !== "one_time"
                  ? ` (${label("frequency", b.frequency)})`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Important dates */}
      {(startDate || endDate) && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {startDate && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Opens
              </dt>
              <dd className="text-gray-700">{startDate}</dd>
            </div>
          )}
          {endDate && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Closes
              </dt>
              <dd className="text-gray-700 font-medium">{endDate}</dd>
            </div>
          )}
        </dl>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 pt-1">
        <Link
          href={`/schemes/${scheme.slug || scheme.id}`}
          className="inline-flex items-center justify-center min-h-[40px] px-4 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          View details
        </Link>
        {applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[40px] px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Apply ↗
          </a>
        )}
      </div>
    </article>
  );
}
