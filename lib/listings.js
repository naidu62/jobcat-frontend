// lib/listings.js
// Server-side helpers for the schemes & scholarships listing pages.

import { API_BASE } from "./api";

/**
 * Fetch the first page of a published DRF list endpoint.
 * Returns [] on any failure so pages can render their empty state.
 */
export async function getPublishedList(endpoint, { revalidate = 300 } = {}) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}/`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error(`getPublishedList(${endpoint}) error:`, error.message);
    return [];
  }
}

/** Choice-value -> human label maps (mirror backend TextChoices). */
export const LABELS = {
  schemeCategory: {
    central: "Central Government",
    state: "State Government",
    ut: "Union Territory",
    local: "Local Body",
  },
  governmentLevel: {
    central: "Central",
    state: "State",
    district: "District",
    local: "Local",
  },
  scholarshipCategory: {
    central: "Central Government",
    state: "State Government",
    university: "University/Institute",
    private: "Private Organization",
    international: "International",
    corporate: "Corporate/CSR",
    ngo: "NGO/Trust",
  },
  providerType: {
    government: "Government",
    university: "University",
    private: "Private",
    international: "International",
    corporate: "Corporate",
    ngo: "NGO/Trust",
  },
  educationLevel: {
    class_1_5: "Class 1-5",
    class_6_8: "Class 6-8",
    class_9_10: "Class 9-10",
    class_11_12: "Class 11-12",
    diploma: "Diploma",
    undergraduate: "Undergraduate",
    postgraduate: "Postgraduate",
    phd: "PhD",
    post_doctoral: "Post Doctoral",
    vocational: "Vocational/ITI",
    any: "Any Level",
  },
  gender: {
    male: "Male",
    female: "Female",
    transgender: "Transgender",
    any: "Any",
  },
  benefitType: {
    monetary: "Monetary",
    tuition_waiver: "Tuition Waiver",
    hostel_fee: "Hostel Fee",
    book_grant: "Book Grant",
    travel_grant: "Travel Grant",
    stipend: "Stipend",
    laptop: "Laptop/Device",
    insurance: "Insurance",
    mentorship: "Mentorship",
    internship: "Internship",
    job_placement: "Job Placement",
    other: "Other",
  },
  frequency: {
    one_time: "one-time",
    monthly: "monthly",
    quarterly: "quarterly",
    half_yearly: "half-yearly",
    yearly: "yearly",
    per_semester: "per semester",
    per_annum: "per annum",
  },
};

export function label(mapName, value) {
  if (!value) return null;
  return LABELS[mapName]?.[value] || value;
}

/** Format an Indian-rupee amount without trailing zeros. */
export function formatAmount(value) {
  try {
    return `${Number(value).toLocaleString("en-IN")}`;
  } catch {
    return String(value ?? "");
  }
}

/** "2026-09-30" -> "30 Sep 2026" (null-safe). */
export function formatListDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
