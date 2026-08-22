// app/components/ScholarshipCard.jsx
// Presentational card for a scholarship.
// Shared by /scholarships listing page and the homepage section.

import {
  label,
  formatAmount,
  formatListDate,
} from "@/lib/listings";

export default function ScholarshipCard({ item }) {
  const providerType = label("providerType", item.provider_type);
  const education = label("educationLevel", item.education_level);
  const lastDate = formatListDate(item.application_end_date);
  const startDate = formatListDate(item.application_start_date);
  const benefits = Array.isArray(item.benefits) ? item.benefits : [];

  // Best monetary amount across benefits (max wins).
  const amounts = benefits
    .map((b) => Number(b.maximum_amount ?? b.amount))
    .filter((n) => Number.isFinite(n) && n > 0);
  const topBenefit =
    benefits.find(
      (b) => Number(b.maximum_amount ?? b.amount) === Math.max(...amounts)
    ) || benefits[0];

  const eligibilityParts = [
    education,
    item.minimum_percentage ? `Min ${item.minimum_percentage}% marks` : null,
    item.gender && item.gender !== "any"
      ? label("gender", item.gender)
      : null,
    item.state || null,
  ].filter(Boolean);

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col h-full transition">
      {/* Name */}
      <h2 className="text-lg font-bold text-blue-700 mb-1 line-clamp-2">
        {item.title}
      </h2>

      {/* Provider */}
      <p className="text-sm font-medium text-gray-800">
        🎓 {item.provider_name}
        {providerType ? (
          <span className="text-gray-500 font-normal"> · {providerType}</span>
        ) : null}
      </p>

      {/* Eligibility */}
      {(eligibilityParts.length > 0 || item.other_eligibility) && (
        <section className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Eligibility
          </h3>
          {eligibilityParts.length > 0 && (
            <p className="text-sm text-gray-700">{eligibilityParts.join(" · ")}</p>
          )}
          {item.other_eligibility && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
              {item.other_eligibility}
            </p>
          )}
        </section>
      )}

      {/* Amount */}
      {topBenefit && (
        <p className="mt-3 text-sm font-semibold text-green-700">
          ₹{formatAmount(topBenefit.maximum_amount ?? topBenefit.amount)}
          {topBenefit.frequency && topBenefit.frequency !== "one_time"
            ? ` (${label("frequency", topBenefit.frequency)})`
            : ""}
        </p>
      )}

      {/* Last date */}
      {lastDate && (
        <p className="mt-1 text-sm text-gray-700">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Last date:
          </span>{" "}
          <strong>{lastDate}</strong>
        </p>
      )}
      {!lastDate && startDate && (
        <p className="mt-1 text-sm text-gray-600">Opens {startDate}</p>
      )}

      {/* Apply link */}
      {item.application_link && (
        <a
          href={item.application_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition self-start"
        >
          Apply Online →
        </a>
      )}
    </article>
  );
}
