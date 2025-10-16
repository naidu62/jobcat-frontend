// app/components/JobsList.jsx
"use client";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ Fetch jobs from your live Django API
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("https://app.jobcat.in/api/jobs/");
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }
    fetchJobs();
  }, []);

  // ✅ Filter jobs based on search input
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-4">
      {/* 🔍 Search Bar */}
      <SearchBar onSearch={setSearch} />

      {/* 📄 Job Cards */}
      {filteredJobs.length > 0 ? (
        filteredJobs.map((job) => (
          <div key={job.id} className="border p-4 mb-3 rounded-lg hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.category}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center mt-6">No jobs found.</p>
      )}
    </div>
  );
}