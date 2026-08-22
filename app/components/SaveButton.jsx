"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { loadSavedIds, onSavedSync, saveJob, unsaveJob } from "@/lib/saved";

/**
 * Bookmark toggle for a job card. Shares one saved-ids request across every
 * card on the page and stays in sync across components via a window event.
 */
export default function SaveButton({ jobId, variant = "icon", onChange }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSavedIds().then((ids) => {
      if (!cancelled) {
        setSaved(ids.has(jobId));
        setReady(true);
      }
    });
    const off = onSavedSync(() => {
      loadSavedIds().then((ids) => {
        if (!cancelled) setSaved(ids.has(jobId));
      });
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [jobId]);

  const handleClick = useCallback(
    async (e) => {
      e.preventDefault(); // card is wrapped in links; never navigate
      e.stopPropagation();

      if (!isAuthenticated()) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (busy) return;
      setBusy(true);
      const next = !saved;
      setSaved(next); // optimistic
      try {
        if (next) await saveJob(jobId);
        else await unsaveJob(jobId);
        onChange?.(next);
      } catch {
        setSaved(!next); // revert on failure
      } finally {
        setBusy(false);
      }
    },
    [busy, jobId, onChange, router, saved]
  );

  const label = saved ? "Remove from saved jobs" : "Save this job";

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || !ready}
        aria-pressed={saved}
        aria-label={label}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 px-4 rounded-md text-sm font-medium border transition ${
          saved
            ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
        } ${busy ? "opacity-70" : ""}`}
      >
        <BookmarkIcon filled={saved} className="w-4 h-4" />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`absolute top-3 right-3 z-10 p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white/95 border shadow-sm transition ${
        saved
          ? "text-blue-600 border-blue-200"
          : "text-gray-400 border-gray-200 hover:text-blue-600 hover:border-blue-200"
      } ${busy ? "opacity-70" : ""}`}
    >
      <BookmarkIcon filled={saved} className="w-[18px] h-[18px]" />
    </button>
  );
}

function BookmarkIcon({ filled = false, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
