"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // The reset link must carry both parts of the credentials.
  const missingParams = !uid || !token;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, password, password_confirm: passwordConfirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.detail || "This reset link is invalid or has expired.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (missingParams) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <span className="text-5xl" aria-hidden>
          ⚠️
        </span>
        <h1 className="text-3xl font-bold mt-4 mb-3">Invalid reset link</h1>
        <p className="text-gray-600 mb-6">
          This link is missing required information. Please use the exact link
          from your email, or request a new one from the sign-in page.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <span className="text-5xl" aria-hidden>
          ✅
        </span>
        <h1 className="text-3xl font-bold mt-4 mb-3">Password updated</h1>
        <p className="text-gray-600 mb-6">
          Your password has been changed successfully. You can now sign in with
          your new password.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-2">Set a new password</h1>
      <p className="text-center text-gray-600 mb-8">
        Choose a strong password for your JobCat.in account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm new password
          </label>
          <input
            id="password_confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Updating password..." : "Reset password"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-6">
        Remembered it?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-16 text-center">
          <span className="text-5xl animate-pulse" aria-hidden>
            ⏳
          </span>
          <h1 className="text-3xl font-bold mt-4 mb-3">Loading…</h1>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
