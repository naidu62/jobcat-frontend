"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileTabs from "@/app/components/profile/ProfileSections";

/**
 * Public profile page: /u/<username>
 * Data comes from GET /api/users/<username>/ which enforces privacy
 * server-side — this page simply renders whatever the API returns.
 */
export default function PublicProfilePage() {
  const [state, setState] = useState("loading"); // loading|ready|notfound
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const username = window.location.pathname.split("/").filter(Boolean)[1];
    if (!username) {
      setState("notfound");
      return;
    }
    let cancelled = false;
    fetchAPI(`users/${encodeURIComponent(username)}/`)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setState("ready");
      })
      .catch(() => !cancelled && setState("notfound"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="max-w-3xl mx-auto mt-10 mb-16 px-4">
        <div className="animate-pulse space-y-4" aria-busy="true">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (state === "notfound" || !profile) {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Profile not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          This profile does not exist or is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-16 px-4 space-y-5">
      <ProfileHeader
        name={profile.display_name}
        avatarUrl={profile.avatar_url}
        verified={profile.verified === true}
        isPrivate={profile.is_private}
        isOwner={profile.is_owner === true}
        memberSince={profile.member_since}
        subtitle={profile.is_private ? "This member keeps their details private." : undefined}
        actions={
          profile.is_owner ? (
            <a
              href="/profile"
              className="text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Edit profile
            </a>
          ) : null
        }
      />

      {profile.is_private ? (
        <section className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-3xl mb-2" aria-hidden="true">🔒</p>
          <h2 className="text-base font-semibold text-gray-900">
            This profile is private
          </h2>
          <p className="mt-1 text-sm text-gray-600 max-w-sm mx-auto">
            {profile.display_name} hasn&apos;t made their education, skills or
            location public. Only their name and membership date are shown.
          </p>
        </section>
      ) : (
        <>
          {/* About */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">About</h2>
            <ProfileTabs
              memberSince={profile.member_since}
              experience={profile.experience}
              location={profile.location}
            />
          </section>

          {/* Education & Skills */}
          {(profile.education || profile.skills?.length > 0) && (
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Education &amp; Skills
              </h2>
              <ProfileTabs education={profile.education} skills={profile.skills} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
