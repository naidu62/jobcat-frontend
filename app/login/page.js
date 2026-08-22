"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthError,
  googleLogin,
  loginUser,
  requestPasswordReset,
  resendVerification,
} from "@/lib/auth";
import GoogleLoginButton, { GoogleDivider } from "@/components/GoogleLoginButton";

// Safe post-login redirect: honor ?next=<path> when it is a local path.
function localNext() {
  if (typeof window === "undefined") return "/";
  const target = new URLSearchParams(window.location.search).get("next");
  return target && target.startsWith("/") && !target.startsWith("//") ? target : "/";
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Email verification state (shown when backend returns email_not_verified)
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState("idle"); // idle|sending|sent
  const [notice, setNotice] = useState(null);

  // Google sign-in
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotState, setForgotState] = useState("idle"); // idle|sending|sent

  const handleGoogleCredential = useCallback(
    async (credential) => {
      setError(null);
      setGoogleLoading(true);
      try {
        await googleLogin(credential);
        window.dispatchEvent(new Event("jobcat-auth-sync"));
        router.push(localNext());
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setNeedsVerification(false);
    setLoading(true);

    try {
      await loginUser(email, password);
      window.dispatchEvent(new Event("jobcat-auth-sync"));
      router.push(localNext());
      router.refresh();
    } catch (err) {
      if (
        err instanceof AuthError &&
        (err.code === "email_not_verified" || err.code === "login_locked")
      ) {
        if (err.code === "email_not_verified") {
          setNeedsVerification(true);
          setEmail(err.meta?.email || email);
          setPassword("");
        }
        setError(err.message);
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResendState("sending");
    try {
      await resendVerification(email);
      setResendState("sent");
    } catch {
      setResendState("idle");
      setError("Could not resend the verification email. Please try again.");
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setForgotState("sending");
    try {
      await requestPasswordReset(email);
      setForgotState("sent");
    } catch (err) {
      setForgotState("idle");
      setError(err.message || "Could not send reset email.");
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-2">Sign in</h1>
      <p className="text-center text-gray-600 mb-8">
        Welcome back to JobCat.in
      </p>

      {/* ✉️ Email verification banner */}
      {needsVerification && (
        <div className="mb-6 border border-yellow-300 bg-yellow-50 rounded-lg p-4 text-sm text-yellow-900">
          <p className="font-semibold mb-1">Verify your email</p>
          <p className="mb-3">
            We sent a verification link to{" "}
            <strong>{email}</strong>. Click it to activate your account.
          </p>
          {resendState === "sent" ? (
            <p className="text-green-700 font-medium">
              Verification email re-sent — please check your inbox.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState === "sending"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {resendState === "sending" ? "Resending..." : "Resend verification"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!needsVerification && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgot((v) => !v)}
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* 🔑 Inline password reset request */}
        {showForgot && !needsVerification && (
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 space-y-2">
            {forgotState === "sent" ? (
              <p className="text-sm text-green-700">
                If an account exists for that address, a reset link has been sent.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Send a password reset link to the email above.
                </p>
                <button
                  type="button"
                  onClick={handleForgot}
                  disabled={forgotState === "sending"}
                  className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 transition"
                >
                  {forgotState === "sending" ? "Sending..." : "Send reset link"}
                </button>
              </>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {notice && <p className="text-sm text-green-600 text-center">{notice}</p>}

        {!needsVerification && (
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        )}
      </form>

      {/* 🔵 Continue with Google */}
      {!needsVerification && (
        <>
          <GoogleDivider />
          <GoogleLoginButton
            busy={googleLoading}
            onCredential={handleGoogleCredential}
            onError={handleGoogleError}
          />
        </>
      )}

      <p className="text-sm text-center text-gray-600 mt-6">
        New to JobCat?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
