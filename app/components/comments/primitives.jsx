"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

/** Tiny profile avatar: photo when allowed, otherwise an initial chip. */
export function Avatar({ name, url, size = "md" }) {
  const sizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-lg",
  };
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name ? `${name}'s avatar` : "Avatar"}
        className={`${sizes[size]} rounded-full object-cover border border-gray-200 shrink-0`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${sizes[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0 select-none`}
    >
      {initial}
    </div>
  );
}

export function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const steps = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, unit] of steps) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function LikeButton({ comment, onToggled, disabled }) {
  const [liked, setLiked] = useState(Boolean(comment.liked_by_me));
  const [count, setCount] = useState(comment.like_count ?? 0);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy || disabled) return;
    setBusy(true);
    // Optimistic flip; server response is authoritative.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    try {
      const { toggleCommentLike } = await import("@/lib/community");
      const res = await toggleCommentLike(comment.id);
      setLiked(res.liked);
      setCount(res.like_count);
      onToggled?.(res);
    } catch {
      setLiked(!nextLiked); // revert on failure
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors min-h-[32px] px-2 rounded-md hover:bg-red-50 disabled:opacity-50 ${
        liked ? "text-red-600" : "text-gray-500 hover:text-red-600"
      }`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike comment" : "Like comment"}
    >
      <Heart
        size={15}
        className={liked ? "fill-current" : ""}
        aria-hidden="true"
      />
      {count > 0 ? count : "Like"}
    </button>
  );
}
