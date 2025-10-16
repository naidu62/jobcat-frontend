"use client";
import { useState } from "react";

export default function CategoryFilter({ onSelect }) {
  const categories = ["All", "Government", "IT", "Banking", "Defence"];
  const [active, setActive] = useState("All");

  const handleClick = (category) => {
    setActive(category);
    onSelect(category);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
            active === cat
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}