"use client";
import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="flex justify-center mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search jobs by title or keyword..."
        className="w-full sm:w-1/2 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />
    </div>
  );
}