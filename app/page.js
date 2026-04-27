// app/page.js
"use client";
console.log("API BASE:", process.env.NEXT_PUBLIC_API_BASE_URL);
import JobsList from "./components/JobsList";
import DevelopmentNote from "./components/DevelopmentNote";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 🚧 Development Notice */}
      <section className="mb-8">
        <DevelopmentNote />
      </section>

      {/* 🧭 Title + Description */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Latest Jobs
        </h1>
        <p className="text-base text-gray-600">
          Browse the latest verified job listings (updated just now) — filter by category or search.
        </p>
      </header>

      {/* 🗂️ Job Listings */}
      <main>
        <JobsList />
      </main>

      {/* ⚫ Footer Section */}
      <footer className="border-t border-gray-200 mt-16 pt-6 text-center text-sm text-gray-600">
        <p>
          © {new Date().getFullYear()}{" "}
          <strong className="text-gray-800">JobCat.in</strong> — All rights reserved.
        </p>
        <p className="text-xs mt-1 text-gray-500">Version 1.2.0</p>
      </footer>
    </div>
  );
}