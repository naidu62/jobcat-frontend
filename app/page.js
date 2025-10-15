// app/page.js
import dynamic from 'next/dynamic';
import JobsList from './components/JobsList';
import DevelopmentNote from './components/DevelopmentNote'; // ✅ Added line

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* 🚧 Development Notice */}
      <DevelopmentNote />

      <h1 className="text-3xl font-bold mb-4">Latest Jobs</h1>
      <p className="text-sm text-gray-600 mb-6">
        Fresh job notifications from our live API.
      </p>

      <JobsList />
    </div>
  );
}