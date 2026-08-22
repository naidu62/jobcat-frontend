"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState("verifying"); // verifying|success|error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage(
        "This link is missing its verification token. Please use the exact link from your email."
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-email/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          setMessage(
            data?.detail ||
              "This verification link is invalid or has expired."
          );
        } else {
          setState("success");
          setMessage(
            data?.detail || "Email verified successfully. You can now sign in."
          );
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Could not reach the server. Please try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      {state === "verifying" && (
        <>
          <span className="text-5xl animate-pulse" aria-hidden>
            ⏳
          </span>
          <h1 className="text-3xl font-bold mt-4 mb-3">Verifying your email…</h1>
          <p className="text-gray-600">Please wait a moment.</p>
        </>
      )}

      {state === "success" && (
        <>
          <span className="text-5xl" aria-hidden>
            ✅
          </span>
          <h1 className="text-3xl font-bold mt-4 mb-3">Email verified</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Sign in
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <span className="text-5xl" aria-hidden>
            ⚠️
          </span>
          <h1 className="text-3xl font-bold mt-4 mb-3">
            Verification failed
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to sign in
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Link expired? Sign in and use “Resend verification”.
          </p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-16 text-center">
          <span className="text-5xl animate-pulse" aria-hidden>
            ⏳
          </span>
          <h1 className="text-3xl font-bold mt-4 mb-3">Verifying your email…</h1>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
