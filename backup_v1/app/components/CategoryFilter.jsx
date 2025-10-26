"use client";
import { useState } from "react";

export default function CategoryFilter({ onSelect }) {
  const categories = [
    "All",
    "Government",
    "IT & Software",
    "Banking",
    "Defence",
    "Railway",
    "Healthcare",
    "Education",
  ];

  const [active, setActive] = useState("All");

  const handleClick = (category) => {
    setActive(category);
    onSelect(category);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10 px-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ease-out
            ${
              active === cat
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 shadow-md scale-105"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:shadow-sm"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}