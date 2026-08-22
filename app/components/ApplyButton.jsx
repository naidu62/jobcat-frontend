"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { createApplication } from "@/lib/platform";

/**
 * Quick "Apply" action on job cards: starts tracking the application with
 * status "applied". Full status/notes control lives on /applications and the
 * job detail page.
 */
export default function ApplyButton({ jobId }) {
  const router = useRouter();
  const [state, setState] = useState("idle"); // idle|busy|tracked
  const [error, setError] = useState(false);

  const handleClick = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated()) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (state !== "idle") return;
      setState("busy");
      try {
        await createApplication({ jobId, status: "applied" });
        setState("tracked");
      } catch (err) {
        if (String(err.message).toLowerCase().includes("already")) {
          setState("tracked"); // already tracking counts as success
        } else {
          setError(true);
          setTimeout(() => setError(false), 2500);
        }
        setState("idle");
      }
    },
    [jobId, router, state]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "busy"}
      aria-label={state === "tracked" ? "Application tracked" : "Track this application"}
      className={`mt-2 block w-full text-center text-sm py-2.5 rounded-md transition min-h-[44px] ${
        state === "tracked"
          ? "bg-green-50 border border-green-300 text-green-700"
          : error
          ? "bg-red-50 border border-red-200 text-red-600"
          : "border border-blue-200 text-blue-600 hover:bg-blue-50"
      }`}
    >
      {state === "busy" ? "…" : state === "tracked" ? "Tracked ✓" : error ? "Failed — retry" : "Apply / Track"}
    </button>
  );
}
