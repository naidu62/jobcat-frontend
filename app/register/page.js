"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthError,
  googleLogin,
  registerUser,
  resendVerification,
} from "@/lib/auth";
import GoogleLoginButton, { GoogleDivider } from "@/components/GoogleLoginButton";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // After successful registration the account awaits email verification.
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [resendState, setResendState] = useState("idle"); // idle|sending|sent
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setError(null);
      setGoogleLoading(true);
      try {
        await googleLogin(credential);
        window.dispatchEvent(new Event("jobcat-auth-sync"));
        router.push("/");
        router.refresh();
      } catch (err) {
        setError(err.message || "Google sign-in failed.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [router]
  );

  const handleGoogleError = useCallback((message) => {
    setGoogleLoading(false);
    setError(message);
  }, []);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleResend() {
    if (!form.email) return;
    setResendState("sending");
    try {
      await resendVerification(form.email);
      setResendState("sent");
    } catch {
      setResendState("idle");
      setError("Could not resend the verification email. Please try again.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerUser(form);
      setVerificationRequired(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ✉️ Post-registration state: wait for email verification.
  if (verificationRequired) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <span className="text-5xl" aria-hidden>
          ✉️
        </span>
        <h1 className="text-3xl font-bold mt-4 mb-3">Verify your email</h1>
        <p className="text-gray-600 mb-6">
          We sent a verification link to <strong>{form.email}</strong>.
          Please click it to activate your JobCat.in account.
        </p>

        {resendState === "sent" ? (
          <p className="text-green-700 font-medium mb-6">
            Verification email re-sent — please check your inbox.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === "sending"}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition mb-6"
          >
            {resendState === "sending" ? "Resending..." : "Resend verification"}
          </button>
        )}

        <p className="text-sm text-gray-500">
          Already verified?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
      <p className="text-center text-gray-600 mb-8">
        Create your free JobCat.in account
      </p>

      {/* 🔵 Continue with Google */}
      <GoogleLoginButton
        busy={googleLoading}
        onCredential={handleGoogleCredential}
        onError={handleGoogleError}
      />
      <GoogleDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              id="first_name"
              type="text"
              autoComplete="given-name"
              value={form.first_name}
              onChange={update("first_name")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              id="last_name"
              type="text"
              autoComplete="family-name"
              value={form.last_name}
              onChange={update("last_name")}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            id="password_confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password_confirm}
            onChange={update("password_confirm")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
