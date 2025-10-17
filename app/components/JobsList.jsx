'use client';
import { useEffect, useState } from 'react';
import JobCard from './JobCard';
import { getJobs } from '../../lib/api';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobs({ page: 1, page_size: 100, q });
      const list = Array.isArray(data) ? data : (data.results || []);
      setJobs(list);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { load(); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div>
      {/* 🔍 Search + Refresh bar */}
      <div className="mb-4 flex gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jobs, category or company"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={load}
          className="px-4 py-2 border rounded bg-blue-600 text-white"
        >
          Refresh
        </button>
      </div>

      {/* 🌀 Loading / Error / Empty States */}
      {loading && <p>Loading jobs…</p>}
      {error && (
        <div className="text-red-600">
          Error: {error.message || 'Failed to load'}
        </div>
      )}
      {!loading && jobs.length === 0 && <p>No jobs found.</p>}

      {/* 🧱 Responsive Job Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id || job.job_uid} job={job} />
        ))}
      </div>
    </div>
  );
}