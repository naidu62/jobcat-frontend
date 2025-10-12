// app/components/JobCard.jsx
import Link from 'next/link';

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

export default function JobCard({ job }) {
  // try multiple field names to be tolerant of backend shapes
  const id = job.id || job.job_uid || job.jobId;
  const title = job.title || job.name || 'Untitled';
  const company = job.company || job.organization || '';
  const location = job.location || '';
  const category = job.category || '';
  const short_description = job.short_description || job.summary || job.description?.slice?.(0, 120) || '';

  return (
    <div className="p-4 border rounded hover:shadow transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            <Link href={`/jobs/${id}`}>{title}</Link>
          </h3>
          <p className="text-sm text-gray-600">{company} • {location} • <span className="font-medium">{category}</span></p>
        </div>
        <div className="text-sm text-gray-500">{formatDate(job.posted_date || job.created_at || job.posted)}</div>
      </div>

      <p className="mt-2 text-sm text-gray-700">{short_description}</p>

      <div className="mt-3">
        <Link href={`/jobs/${id}`} className="text-blue-600">View details →</Link>
      </div>
    </div>
  );
}