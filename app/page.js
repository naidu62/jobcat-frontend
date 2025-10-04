import Link from 'next/link';
export default function Home() {
  // Example static jobs (so site works without backend)
  const jobs = [
    { id: 1, title: 'Sample Job — Accountant', company: 'ACME', location: 'Vizag, AP', description_snippet: 'B.Com required.' },
    { id: 2, title: 'Sample Job — Clerk', company: 'State Office', location: 'Hyderabad, TS', description_snippet: '10th pass.' }
  ];
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Latest Jobs</h1>
      <div className="grid gap-3">
        {jobs.map(j => (
          <article key={j.id} className="rounded-xl border p-4">
            <Link href={`/jobs/${j.id}`} className="text-lg font-medium hover:underline">{j.title}</Link>
            <div className="text-sm text-gray-600">{j.company} • {j.location}</div>
            <p className="mt-2 text-sm">{j.description_snippet}</p>
          </article>
        ))}
      </div>
    </main>
  );
}