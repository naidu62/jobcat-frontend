"use client";

// app/components/HeroSearch.jsx
// Google-style universal search box for the homepage hero.
// Submits to /search?q=... which queries Jobs + Schemes + Scholarships.

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch({ defaultValue = "" }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
      aria-label="Search jobs, schemes and scholarships"
    >
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full shadow-sm focus-within:shadow-md focus-within:border-blue-400 transition px-4 sm:px-5 min-h-[52px]">
        {/* Search icon */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-500 shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs, schemes, scholarships..."
          aria-label="Search jobs, schemes and scholarships"
          autoComplete="off"
          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-base sm:text-lg text-gray-900 placeholder:text-gray-400 py-3"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <span aria-hidden>✕</span>
          </button>
        )}

        <button
          type="submit"
          className="shrink-0 min-h-[44px] px-4 sm:px-6 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}
