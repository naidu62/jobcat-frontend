"use client";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="w-full max-w-3xl relative">

        <input
          type="text"
          placeholder="🔍 Search jobs, qualification, category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full
            px-6
            py-4
            text-base
            border
            border-gray-300
            rounded-full
            shadow-md
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-blue-500
            transition
          "
        />

      </div>
    </div>
  );
}