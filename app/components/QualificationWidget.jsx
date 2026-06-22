"use client";

import Link from "next/link";

export default function QualificationWidget() {
  const qualifications = [
    { label: "10th", value: "10th" },
    { label: "ITI", value: "iti" },
    { label: "Inter", value: "inter" },
    { label: "Degree", value: "degree" },
    { label: "Diploma", value: "diploma" },
    { label: "B.Tech", value: "btech" },
    { label: "PG", value: "pg" },
    { label: "More", value: "all" },
  ];

  return (
    <section className="mt-4">
      <h2 className="text-sm font-bold mb-2">
        🎓 Browse By Qualification
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {qualifications.map((item) => (
          <Link
            key={item.value}
            href={`/jobs?qualification=${item.value}`}
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