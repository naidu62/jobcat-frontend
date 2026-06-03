export function adaptJob(apiJob) {
  return {
    // Core
    id: apiJob.id,
    title: apiJob.title ?? "N/A",
    category: apiJob.category ?? "N/A",
    advertisementRefNo: apiJob.advertisement_ref_no ?? "",

    // Vacancy
    totalVacancies: apiJob.total_vacancies ?? 0,
    vacancyDetails: apiJob.vacancy_details ?? [],

    // Dates
    startDate: apiJob.start_date ?? null,
    endDate: apiJob.end_date ?? null,
    admitReleaseDate: apiJob.admit_release_date ?? null,
    examDate: apiJob.exam_date ?? null,
    resultDate: apiJob.result_date ?? null,

    // Qualification
    qualification: apiJob.qualification ?? "Not specified",

    // Age
    dobFrom: apiJob.dob_from ?? null,
    dobTo: apiJob.dob_to ?? null,

    // Links
    applyUrl: apiJob.apply_online_link ?? "",
    admitCardUrl: apiJob.admit_card_link ?? "",
    notificationUrl: apiJob.notification_pdf_link ?? "",
    officialWebsite: apiJob.official_website ?? "",

    // Dynamic fields
    extraFields: apiJob.extra_fields ?? [],

    // Raw backup
    raw: apiJob,
  };
}