"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthError,
  authFetch,
  getUser,
  isAuthenticated,
  resolveMediaUrl,
  updateAccount,
} from "@/lib/auth";

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

export default function ProfilePage() {
  const router = useRouter();

  const [authState, setAuthState] = useState("checking"); // checking|anon|ready
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveState, setSaveState] = useState("idle"); // idle|saving|saved|error
  const [error, setError] = useState(null);

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

  // Hydrate the form once profile data arrives
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

  async function handleSave(e) {
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
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const avatarUrl = resolveMediaUrl(me.profile?.avatar_url);
  const initial = (me.first_name || me.email || "?").trim().charAt(0).toUpperCase();
  const memberSince = me.date_joined ? new Date(me.date_joined).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

  const inputCls =
    "w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-16 px-4">
      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center gap-5">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Your avatar"
            className="w-20 h-20 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-semibold">
            {initial}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-lg font-semibold text-gray-900">
            {me.full_name || me.email}
          </h1>
          <p className="text-sm text-gray-500">{me.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <ProviderBadge provider={me.auth_provider} />
            <span className="text-xs text-gray-500">
              Member since {memberSince}
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
        >
          Settings
        </Link>
      </div>

      {/* Editable details */}
      <form onSubmit={handleSave} className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
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
        </div>
      </form>
    </div>
  );
}
