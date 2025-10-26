"use client";
import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="flex justify-center mb-6">
      <input
        type="text"
        placeholder="🔍 Search by title, category, or qualification..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  );
}