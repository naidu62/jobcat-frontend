// app/page.js
import JobsList from './components/JobsList';
import DevelopmentNote from './components/DevelopmentNote';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* 🚧 Development Notice */}
      <DevelopmentNote />

      <h1 className="text-3xl font-bold mb-4 text-center mt-6">Latest Jobs</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Browse the latest verified job listings — filter by category or search.
      </p>

      {/* ✅ Job list includes working SearchBar */}
      <JobsList />

      {/* 🌍 Footer Section */}
      <footer className="border-t mt-8 py-4 text-center text-sm text-gray-600">
        <p>© 2025 <strong>JobCat.in</strong> — All rights reserved.</p>
        <p className="text-xs mt-1">Version 1.2.0</p>
      </footer>
    </div>
  );
}