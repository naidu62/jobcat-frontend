"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import QualificationWidget from "./components/QualificationWidget";
import CategoryWidget from "./components/CategoryWidget";
import JobsList from "./components/JobsList";

export default function HomePage() {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-3 py-4">

      <header className="text-center mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Latest Jobs
        </h1>

        <p className="text-sm text-gray-600 mt-1">
          Browse the latest verified job listings.
        </p>
      </header>

      <SearchBar
        query={query}
        setQuery={setQuery}
      />

      {!query.trim() && (
        <>
          <QualificationWidget />
          <CategoryWidget />
        </>
      )}

      <JobsList query={query} />

    </div>
  );
}