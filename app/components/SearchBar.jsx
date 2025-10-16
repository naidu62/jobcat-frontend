// app/components/SearchBar.jsx
"use client";
import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative mb-6 w-full max-w-2xl mx-auto">
      {/* Search icon */}
      <span className="absolute left-4 top-3 text-gray-400 text-lg">🔍</span>

      {/* Input field */}
      <input
        type="text"
        placeholder="Search jobs by title or category..."
        value={query}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-full px-10 py-2.5 text-sm shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition duration-200 ease-in-out placeholder-gray-400 outline-none"
      />

      {/* Clear button */}
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600 transition"
          aria-label="Clear search"
        >
          ❌
        </button>
      )}
    </div>
  );
}