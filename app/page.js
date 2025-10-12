// app/page.js
import dynamic from 'next/dynamic';
import JobsList from './components/JobsList';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold mb-4">Latest Jobs</h1>
      <p className="text-sm text-gray-600 mb-6">Fresh job notifications from your API.</p>

      <JobsList />
    </div>
  );
}