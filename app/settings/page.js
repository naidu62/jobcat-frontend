"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AuthError,
  authFetch,
  changePassword,
  getUser,
  isAuthenticated,
  removeAvatar,
  resolveMediaUrl,
  uploadAvatar,
} from "@/lib/auth";

function ProviderCard({ me }) {
  const isGoogle = me?.auth_provider === "google";
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">Sign-in method</span>
      {isGoogle ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-5l-3.9 3C3.4 21.3 7.4 24 12 24z" />
            <path fill="#FBBC05" d="M5.3 14.4a7.4 7.4 0 010-4.8l-3.9-3a12 12 0 000 10.8l3.9-3z" />
            <path fill="#EA4335" d="M12 4.7c2.2 0 3.7.9 4.5 1.7l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l3.9 3c.9-2.9 3.6-4.9 6.7-4.9z" />
          </svg>
          Google Account
        </span>
      ) : (
        <span className="text-sm font-medium text-gray-800">Email &amp; Password</span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [authState, setAuthState] = useState("checking"); // checking|anon|ready
  const [me, setMe] = useState(null);

  // Avatar state
  const fileInputRef = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState(null); // {type: 'ok'|'err', text}

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwDone, setPwDone] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthState("anon");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const fresh = await authFetch("auth/me/");
        if (cancelled) return;
        setMe(fresh);
        localStorage.setItem("jobcat_user", JSON.stringify(fresh));
        setAuthState("ready");
      } catch {
        if (!cancelled) setAuthState(getUser() ? "ready" : "anon");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Redirect to login after a successful password change (session invalidated)
  useEffect(() => {
    if (!pwDone) return undefined;
    if (countdown <= 0) {
      window.location.href = "/login";
      return undefined;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [pwDone, countdown]);

  const pickFile = useCallback(() => fileInputRef.current?.click(), []);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg({ type: "err", text: "Image must be 5 MB or smaller." });
      return;
    }
    setAvatarBusy(true);
    setAvatarMsg(null);
    try {
      await uploadAvatar(file);
      const fresh = await authFetch("auth/me/");
      setMe(fresh);
      localStorage.setItem("jobcat_user", JSON.stringify(fresh));
      setAvatarMsg({ type: "ok", text: "Avatar updated." });
    } catch (err) {
      setAvatarMsg({
        type: "err",
        text: err instanceof AuthError ? err.message : err.message || "Upload failed.",
      });
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarBusy(true);
    setAvatarMsg(null);
    try {
      await removeAvatar();
      const fresh = await authFetch("auth/me/");
      setMe(fresh);
      localStorage.setItem("jobcat_user", JSON.stringify(fresh));
      setAvatarMsg({ type: "ok", text: "Avatar removed." });
    } catch (err) {
      setAvatarMsg({ type: "err", text: err.message || "Could not remove avatar." });
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwBusy(true);
    try {
      await changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
        newPasswordConfirm: pwForm.confirm,
      });
      setPwDone(true);
      setCountdown(5);
    } catch (err) {
      setPwError(err.message || "Could not change password.");
    } finally {
      setPwBusy(false);
    }
  }

  if (authState === "anon") {
    return (
      <div className="max-w-md mx-auto mt-20 mb-16 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Please sign in to manage your account settings.
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
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const googleUser = me.auth_provider === "google";
  const avatarUrl = resolveMediaUrl(me.profile?.avatar_url);
  const initial = (me.first_name || me.email || "?").trim().charAt(0).toUpperCase();
  const memberSince = me.date_joined
    ? new Date(me.date_joined).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const inputCls =
    "w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto mt-10 mb-16 px-4 space-y-6">
      {/* --- Profile photo / avatar --- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900">Profile photo</h2>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
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
          <div className="flex-1 w-full">
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={pickFile}
                disabled={avatarBusy}
                className="min-h-[44px] px-4 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {avatarBusy ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  disabled={avatarBusy}
                  className="min-h-[44px] px-4 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100 disabled:opacity-60 transition"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG or WebP · square images look best · max 5 MB.
            </p>
            {avatarMsg && (
              <p
                className={`mt-2 text-sm ${
                  avatarMsg.type === "ok" ? "text-green-600" : "text-red-600"
                }`}
              >
                {avatarMsg.text}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- Account information --- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900">Account information</h2>
        <dl className="mt-2 divide-y divide-gray-100">
          <ProviderCard me={me} />
          <div className="py-3 flex items-center justify-between gap-3">
            <dt className="text-sm text-gray-600">Email</dt>
            <dd className="text-sm font-medium text-gray-800 break-all">{me.email}</dd>
          </div>
          <div className="py-3 flex items-center justify-between gap-3">
            <dt className="text-sm text-gray-600">Email status</dt>
            <dd>
              {me.email_verified ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                  Not verified
                </span>
              )}
            </dd>
          </div>
          <div className="py-3 flex items-center justify-between gap-3">
            <dt className="text-sm text-gray-600">Member since</dt>
            <dd className="text-sm font-medium text-gray-800">{memberSince}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-gray-400">
          Email address cannot be changed.{" "}
          {googleUser
            ? "It is managed by your Google account."
            : "Contact support if you need to update it."}
        </p>
      </section>

      {/* --- Password --- */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900">Password</h2>

        {googleUser ? (
          <p className="mt-3 text-sm text-gray-600">
            You sign in with Google, so this account has no JobCat password. Use
            “Forgot password?” on the sign-in page if you ever want email login too.
          </p>
        ) : pwDone ? (
          <div className="mt-3 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Password changed and all other sessions signed out. Redirecting you to
            the login page in {countdown}…
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4 max-w-md">
            {pwError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {pwError}
              </p>
            )}
            <div>
              <label htmlFor="current_password" className={labelCls}>
                Current password
              </label>
              <input
                id="current_password"
                type="password"
                autoComplete="current-password"
                value={pwForm.current}
                onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="new_password" className={labelCls}>
                New password
              </label>
              <input
                id="new_password"
                type="password"
                autoComplete="new-password"
                value={pwForm.next}
                onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                required
                minLength={8}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className={labelCls}>
                Confirm new password
              </label>
              <input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                required
                minLength={8}
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={pwBusy}
              className="min-h-[44px] px-5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {pwBusy ? "Updating…" : "Update password"}
            </button>
            <p className="text-xs text-gray-500">
              Changing your password signs out every device for security.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
