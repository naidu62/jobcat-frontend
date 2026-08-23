"use client";

import { Avatar } from "@/app/components/comments/primitives";
import { BadgeCheck, Lock } from "lucide-react";

/**
 * Shared profile header.
 * - avatar (photo only when provided; callers withhold it for private views)
 * - name + future-ready verified badge
 * - member-since line and optional Private badge / action slot
 */
export default function ProfileHeader({
  name,
  avatarUrl,
  verified = false,
  isPrivate = false,
  isOwner = false,
  memberSince,
  subtitle,
  actions = null,
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {isPrivate ? (
          <div
            aria-hidden="true"
            className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0"
          >
            <Lock size={26} className="text-gray-400" />
          </div>
        ) : (
          <Avatar name={initial} url={avatarUrl} size="lg" />
        )}

        <div className="flex-1 text-center sm:text-left min-w-0">
          <h1 className="flex items-center justify-center sm:justify-start gap-1.5 text-xl font-bold text-gray-900 break-words">
            <span className="truncate">{name}</span>
            {verified && (
              <BadgeCheck
                size={19}
                className="text-blue-500 shrink-0"
                aria-label="Verified"
              />
            )}
          </h1>

          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-600 truncate">{subtitle}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {isPrivate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <Lock size={12} aria-hidden="true" />
                Private Profile
              </span>
            )}
            {memberSince && (
              <span className="text-xs text-gray-500">Member since {memberSince}</span>
            )}
          </div>
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
