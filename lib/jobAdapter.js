/**
 * Maps raw JobNotification API payloads to the shape used by the UI.
 *
 * Every backend field is preserved here so the job detail page can render
 * the complete notification data. Unknown/extra keys remain reachable via
 * `raw`, and extra_fields keeps its legacy role as a fallback extension.
 */

function firstDefined(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

export function adaptJob(apiJob) {
  return {
    // Core
    id: apiJob.id,
    slug: apiJob.slug ?? "",
    title: apiJob.title ?? "N/A",
    category: apiJob.category || "N/A",
    advertisementRefNo: apiJob.advertisement_ref_no ?? "",

    // Organization & location
    organizationName: firstDefined(apiJob.organization_name, apiJob.organization) ?? "",
    companyName: firstDefined(apiJob.company_name, apiJob.company) ?? "",
    jobType: apiJob.job_type ?? "",
    location: apiJob.location ?? "",
    state: apiJob.state ?? "",
    district: apiJob.district ?? "",

    // Vacancy
    totalVacancies: apiJob.total_vacancies ?? apiJob.vacancies,
    vacancyDetails: apiJob.vacancy_details ?? [],

    // Eligibility
    qualification: apiJob.qualification ?? "",
    experienceRequired: apiJob.experience_required ?? "",
    ageLimit: firstDefined(apiJob.age_limit, "") ?? "",

    // Salary & fees
    salaryMin: apiJob.salary_min ?? null,
    salaryMax: apiJob.salary_max ?? null,
    salaryText: apiJob.salary_text ?? "",
    salary: firstDefined(apiJob.salary, apiJob.salary_text) ?? "",
    applicationFee: apiJob.application_fee ?? "",

    // Selection
    selectionProcess: apiJob.selection_process ?? "",

    // Dates (structured + CMS text)
    startDate: apiJob.start_date ?? null,
    endDate: apiJob.end_date ?? apiJob.last_date ?? null,
    admitReleaseDate: apiJob.admit_release_date ?? null,
    examDate: apiJob.exam_date ?? null,
    resultDate: apiJob.result_date ?? null,
    importantDatesText: apiJob.important_dates_text ?? "",
    importantDates: apiJob.important_dates ?? null,

    // Age window
    dobFrom: apiJob.dob_from ?? null,
    dobTo: apiJob.dob_to ?? null,

    // Links & media
    applyUrl: firstDefined(apiJob.apply_online_link, apiJob.apply_url) ?? "",
    admitCardUrl: firstDefined(apiJob.admit_card_link, "") ?? "",
    notificationUrl:
      firstDefined(apiJob.notification_pdf_link, apiJob.notification_url) ?? "",
    notificationFileUrl: apiJob.notification_pdf_file ?? "",
    officialWebsite: apiJob.official_website ?? "",
    companyLogo: apiJob.company_logo ?? "",

    // Status metadata
    publicationStatus: apiJob.publication_status ?? "",
    lifecycleStatus: apiJob.lifecycle_status ?? "",
    isFeatured: Boolean(apiJob.is_featured),
    isVerified: Boolean(apiJob.is_verified),

    // Dynamic fields
    extraFields: apiJob.extra_fields ?? [],

    // Raw backup
    raw: apiJob,
  };
}
