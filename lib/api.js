// lib/api.js

// ✅ Use environment variable or fallback to localhost
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8000";

// 🧠 Generic function to call your Django API
export async function fetchAPI(endpoint, options = {}) {
  // Clean up slashes and form full URL
  const url = `${API_BASE}/${endpoint.replace(/^\//, "")}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      // Prevent caching for fresh data (optional)
      cache: "no-store",
    });

    // Handle HTTP errors
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `API Error ${res.status}: ${res.statusText}\n${errorText || ""}`
      );
    }

    // Return JSON data
    return await res.json();
  } catch (error) {
    console.error("❌ fetchAPI Error:", error.message);
    throw error;
  }
}

// ✅ Example helper for specific endpoints (optional)
export async function getJobs() {
  return fetchAPI("api/jobs/");
}

export async function getJobDetails(id) {
  return fetchAPI(`api/jobs/${id}/`);
}