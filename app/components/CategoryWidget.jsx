"use client";

import Link from "next/link";

export default function CategoryWidget() {
  const categories = [
    { label: "Govt", value: "government" },
    { label: "Railway", value: "railway" },
    { label: "Bank", value: "bank" },
    { label: "Defence", value: "defence" },
    { label: "Private", value: "private" },
    { label: "SSC", value: "ssc" },
    { label: "Teaching", value: "teaching" },
    { label: "More", value: "all" },
  ];

  return (
    <section className="mt-4">
      <h2 className="text-sm font-bold mb-2">
        🏛 Browse Categories
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {categories.map((item) => (
          <Link
            key={item.value}
            href={`/jobs?category=${item.value}`}
            className="
              bg-blue-600
              text-white
              rounded-md
              py-1.5
              px-1
              text-[11px]
              font-medium
              hover:bg-blue-700
              transition
              text-center
            "
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}