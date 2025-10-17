// app/page.js
import dynamic from 'next/dynamic';
import JobsList from './components/JobsList';
import DevelopmentNote from './components/DevelopmentNote';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* 🌐 Header Section */}
      <header className="flex items-center justify-between py-3 px-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">JobCat.in</h1>

        {/* Search bar (visible on larger screens) */}
        <div className="hidden sm:block w-1/3">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full border rounded-md px-3 py-1 text-sm"
          />
        </div>

        {/* Menu button for mobile */}
        <button className="sm:hidden text-gray-700">☰</button>
      </header>

      {/* 🚧 Development Notice */}
      <DevelopmentNote />

      <h1 className="text-3xl font-bold mb-4 mt-6">Latest Jobs</h1>
      <p className="text-sm text-gray-600 mb-6">
        Fresh job notifications from our live API.
      </p>

      <JobsList />

      {/* 🌍 Footer Section */}
      <footer className="border-t mt-8 py-4 text-center text-sm text-gray-600">
        <p>© 2025 <strong>JobCat.in</strong> — All rights reserved.</p>
        <p className="text-xs mt-1">Version 1.2.0</p>
      </footer>
    </div>
  );
}