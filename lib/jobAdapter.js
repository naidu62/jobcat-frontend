export function adaptJob(apiJob) {
  return {
    id: apiJob.id,

    title: apiJob.job_title ?? "N/A",
    category: apiJob.job_category ?? "N/A",
    type: apiJob.job_type ?? "N/A",

    vacancies: apiJob.details?.no_of_posts ?? "N/A",
    startDate: apiJob.application_start_date ?? null,
    endDate: apiJob.application_end_date ?? null,

    qualification: apiJob.details?.qualification_text ?? "Not specified",
    ageLimit: apiJob.details?.age_limit_text ?? "Not specified",
    selectionProcess: apiJob.details?.selection_process_text ?? "Not specified",

    applyUrl: apiJob.apply_url ?? "",
    notificationUrl: apiJob.official_notification_url ?? "",
  };
}