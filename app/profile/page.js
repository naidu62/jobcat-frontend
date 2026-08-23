"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AuthError,
  authFetch,
  getUser,
  isAuthenticated,
  resolveMediaUrl,
  updateAccount,
} from "@/lib/auth";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import ProfileTabs, { InfoCard, SkillBadge } from "@/app/components/profile/ProfileSections";
import { Globe, Lock, Loader2 } from "lucide-react";

function ProviderBadge({ provider }) {
  const isGoogle = provider === "google";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isGoogle ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"
      }`}
      title={isGoogle ? "Signs in with Google" : "Signs in with email & password"}
    >
      {isGoogle ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-5l-3.9 3C3.4 21.3 7.4 24 12 24z" />
            <path fill="#FBBC05" d="M5.3 14.4a7.4 7.4 0 010-4.8l-3.9-3a12 12 0 000 10.8l3.9-3z" />
            <path fill="#EA4335" d="M12 4.7c2.2 0 3.7.9 4.5 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l3.9 3c.9-2.9 3.6-4.9 6.7-4.9z" />
          </svg>
          Google
        </>
      ) : (
        <>Email &amp; Password</>
      )}
    </span>
  );
}

const EXPERIENCE_LABELS = {
  fresher: "Fresher",
  "0_1": "0–1 years",
  "1_3": "1–3 years",
  "3_5": "3–5 years",
  "5_7": "5–7 years",
  "7_10": "7–10 years",
  "10_plus": "10+ years",
};

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  date_of_birth: "",
  gender: "",
  state_id: "",
  district: "",
  city: "",
  pincode: "",
  education: "",
  experience: "",
  skills: "",
};

const TABS = ["About", "Education & Skills", "Activity", "Edit"];

export default function ProfilePage() {
  const [authState, setAuthState] = useState("checking"); // checking|anon|ready
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveState, setSaveState] = useState("idle"); // idle|saving|saved|error
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("About");
  const [activity, setActivity] = useState(null); // null = not loaded

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthState("anon");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cached = getUser();
        if (cached && !cancelled) setMe(cached);
        const fresh = await authFetch("auth/me/");
        if (cancelled) return;
        setMe(fresh);
        localStorage.setItem("jobcat_user", JSON.stringify(fresh));
        setAuthState("ready");
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setAuthState(getUser() ? "ready" : "anon");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load activity feed lazily when its tab is opened.
  useEffect(() => {
    if (tab !== "Activity" || !me || activity) return;
    let cancelled = false;
    authFetch("users/me/activity/?limit=20")
      .then((data) => !cancelled && setActivity(data.results ?? []))
      .catch(() => !cancelled && setActivity([]));
    return () => {
      cancelled = true;
    };
  }, [tab, me, activity]);

  // Hydrate the edit form once profile data arrives
  useEffect(() => {
    if (!me?.profile) return;
    const p = me.profile;
    setForm({
      first_name: me.first_name || "",
      last_name: me.last_name || "",
      phone: p.phone || "",
      date_of_birth: p.date_of_birth || "",
      gender: p.gender || "",
      state_id: p.state?.id ? String(p.state.id) : "",
      district: p.district || "",
      city: p.city || "",
      pincode: p.pincode || "",
      education: p.education || "",
      experience: p.experience || "",
      skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills || "",
    });
  }, [me]);

  const setField = useCallback(
    (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    []
  );

  async function handleSave(e, extraProfileFields = {}) {
    e.preventDefault();
    setSaveState("saving");
    setError(null);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        profile: {
          phone: form.phone,
          date_of_birth: form.date_of_birth || null,
          gender: form.gender,
          district: form.district,
          city: form.city,
          pincode: form.pincode,
          education: form.education,
          experience: form.experience,
          skills_list: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          ...(form.state_id ? { state_id: Number(form.state_id) } : {}),
          ...extraProfileFields,
        },
      };
      const updated = await updateAccount(payload);
      setMe(updated);
      window.dispatchEvent(new Event("jobcat-auth-sync"));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : err.message || "Could not save.");
      setSaveState("error");
    }
  }

  async function savePrivacy(visibility, username) {
    // Dedicated PATCH so privacy changes never depend on the edit form state.
    await updateAccount({
      profile: {
        profile_visibility: visibility,
        ...(username !== undefined ? { username } : {}),
      },
    });
  }

  if (authState === "anon") {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please sign in to view and edit your profile.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/login" className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
            Sign In
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (authState !== "ready" || !me) {
    return (
      <div className="max-w-3xl mx-auto mt-20 mb-16 px-4">
        <div className="animate-pulse space-y-4" aria-busy="true">
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const profile = me.profile ?? {};
  const avatarUrl = resolveMediaUrl(profile.avatar_url);
  const isPublic = profile.profile_visibility === "public";
  const memberSince = me.date_joined
    ? new Date(me.date_joined).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const memberSinceShort = me.date_joined
    ? new Date(me.date_joined).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";
  const skillsList = Array.isArray(profile.skills)
    ? profile.skills
    : String(profile.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  const locationLine = [
    profile.city,
    profile.district,
    typeof profile.state === "object" && profile.state?.name ? profile.state.name : profile.state,
  ]
    .filter(Boolean)
    .join(", ");
  const experienceLabel = EXPERIENCE_LABELS[profile.experience] || "";

  const inputCls =
    "w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-16 px-4 space-y-5">
      {/* ── Header ─────────────────────────────────────────────── */}
      <ProfileHeader
        name={me.full_name || me.email}
        avatarUrl={avatarUrl}
        verified={Boolean(me.email_verified)}
        memberSince={memberSince}
        subtitle={me.email}
        actions={
          <Link
            href="/settings"
            className="text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            Settings
          </Link>
        }
      />
      <div className="-mt-3 flex items-center gap-2 px-1">
        <ProviderBadge provider={me.auth_provider} />
        {profile.username && (
          <Link
            href={`/u/${profile.username}`}
            className="text-xs font-medium text-blue-700 hover:underline"
          >
            View public profile →
          </Link>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div role="tablist" aria-label="Profile sections" className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors min-h-[44px] ${
              tab === t
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* About */}
      {tab === "About" && (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <ProfileTabs
            memberSince={memberSinceShort}
            experience={experienceLabel}
            location={locationLine}
          />

          {/* Privacy card (Phase 7) */}
          <PrivacyCard
            isPublic={isPublic}
            username={profile.username || ""}
            onSave={savePrivacy}
            onSaved={(updated) => {
              setMe(updated);
              localStorage.setItem("jobcat_user", JSON.stringify(updated));
              window.dispatchEvent(new Event("jobcat-auth-sync"));
            }}
          />
        </section>
      )}

      {/* Education & Skills */}
      {tab === "Education & Skills" && (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <InfoCard icon={null} label="Education" value={profile.education} />
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Skills</p>
              {skillsList.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {skillsList.map((s) => (
                    <SkillBadge key={s} skill={s} />
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-400">No skills added yet.</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setTab("Edit")}
            className="min-h-[40px] px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Edit education &amp; skills
          </button>
        </section>
      )}

      {/* Activity */}
      {tab === "Activity" && (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent activity</h2>
          {!activity ? (
            <div className="py-6 flex justify-center">
              <Loader2 size={22} className="animate-spin text-gray-400" aria-label="Loading activity" />
            </div>
          ) : activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              No recent activity yet. Save a job or track an application to see it here.
            </p>
          ) : (
            <ol className="space-y-3">
              {activity.map((event, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      event.type?.includes("application")
                        ? "bg-amber-400"
                        : event.type === "job_saved"
                        ? "bg-green-500"
                        : "bg-blue-400"
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-gray-800">{event.label}</p>
                    <time dateTime={event.timestamp} className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* Edit (existing functionality, restyled container) */}
      {tab === "Edit" && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Profile details</h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className={labelCls}>First name</label>
              <input id="first_name" type="text" value={form.first_name} onChange={setField("first_name")} className={inputCls} maxLength={150} />
            </div>
            <div>
              <label htmlFor="last_name" className={labelCls}>Last name</label>
              <input id="last_name" type="text" value={form.last_name} onChange={setField("last_name")} className={inputCls} maxLength={150} />
            </div>
            <div>
              <label htmlFor="phone" className={labelCls}>Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={setField("phone")} className={inputCls} maxLength={20} placeholder="10-digit mobile number" />
            </div>
            <div>
              <label htmlFor="dob" className={labelCls}>Date of birth</label>
              <input id="dob" type="date" value={form.date_of_birth} onChange={setField("date_of_birth")} className={inputCls} />
            </div>
            <div>
              <label htmlFor="gender" className={labelCls}>Gender</label>
              <select id="gender" value={form.gender} onChange={setField("gender")} className={inputCls}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label htmlFor="pincode" className={labelCls}>Pincode</label>
              <input id="pincode" type="text" inputMode="numeric" value={form.pincode} onChange={setField("pincode")} className={inputCls} maxLength={10} />
            </div>
            <div>
              <label htmlFor="district" className={labelCls}>District</label>
              <input id="district" type="text" value={form.district} onChange={setField("district")} className={inputCls} maxLength={100} />
            </div>
            <div>
              <label htmlFor="city" className={labelCls}>City</label>
              <input id="city" type="text" value={form.city} onChange={setField("city")} className={inputCls} maxLength={100} />
            </div>
            <div>
              <label htmlFor="education" className={labelCls}>Education</label>
              <input id="education" type="text" value={form.education} onChange={setField("education")} className={inputCls} maxLength={255} placeholder="e.g. B.Tech Mechanical" />
            </div>
            <div>
              <label htmlFor="experience" className={labelCls}>Experience</label>
              <select id="experience" value={form.experience} onChange={setField("experience")} className={inputCls}>
                <option value="">Select experience</option>
                <option value="fresher">Fresher (0 years)</option>
                <option value="0_1">0-1 years</option>
                <option value="1_3">1-3 years</option>
                <option value="3_5">3-5 years</option>
                <option value="5_7">5-7 years</option>
                <option value="7_10">7-10 years</option>
                <option value="10_plus">10+ years</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="skills" className={labelCls}>Skills (comma separated)</label>
              <input id="skills" type="text" value={form.skills} onChange={setField("skills")} className={inputCls} placeholder="e.g. AutoCAD, Excel, Teaching" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saveState === "saving"}
              className="min-h-[44px] px-5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {saveState === "saving" ? "Saving…" : "Save changes"}
            </button>
            {saveState === "saved" && (
              <span className="text-sm text-green-600">Saved ✓</span>
            )}
            {saveState === "error" && (
              <span className="text-sm text-red-600">Check the errors above.</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function PrivacyCard({ isPublic, username, onSave, onSaved }) {
  const [visibility, setVisibility] = useState(isPublic ? "public" : "private");
  const [handle, setHandle] = useState(username || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setVisibility(isPublic ? "public" : "private");
    setHandle(username || "");
  }, [isPublic, username]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const changedHandle = handle.trim() && handle.trim() !== username;
      const updated = await onSave(visibility, changedHandle ? handle.trim() : undefined);
      onSaved(updated);
      setMsg({ ok: true, text: "Privacy settings saved." });
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Could not save privacy settings." });
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={submit} className="border-t border-gray-100 pt-5">
      <h2 className="text-base font-semibold text-gray-900">Profile privacy</h2>
      <p className="mt-1 text-sm text-gray-600">
        Choose who can see your details. Your public page lives at{" "}
        <span className="font-medium text-gray-800">/u/&lt;your-handle&gt;</span>.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            value: "private",
            icon: <Lock size={16} aria-hidden="true" />,
            title: "Private",
            desc: "Only your name and member-since are visible.",
          },
          {
            value: "public",
            icon: <Globe size={16} aria-hidden="true" />,
            title: "Public",
            desc: "Photo, education, skills, experience and location are visible.",
          },
        ].map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              visibility === opt.value
                ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="profile_visibility"
              value={opt.value}
              checked={visibility === opt.value}
              onChange={() => setVisibility(opt.value)}
              className="mt-1 accent-blue-600"
            />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                {opt.icon}
                {opt.title}
              </span>
              <span className="mt-0.5 block text-xs text-gray-600">{opt.desc}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 max-w-xs">
        <label htmlFor="username_handle" className="block text-xs font-medium text-gray-700 mb-1">
          Public handle (/u/{handle || "your-name"})
        </label>
        <input
          id="username_handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          maxLength={50}
          pattern="[A-Za-z0-9_-]+"
          title="Letters, numbers, underscore and hyphen only"
          className={inputCls}
          placeholder="your-name"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {busy && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          Save privacy settings
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}
