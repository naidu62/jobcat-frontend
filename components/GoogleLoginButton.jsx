"use client";

// Shared "Continue with Google" button (Google Identity Services).
// Used by both /login and /register. The parent owns the auth flow:
// pass onCredential(credential) to exchange the ID token for JWTs and
// onError(message) to surface failures in the page's own error UI.
import { useCallback, useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleLoginButton({ onCredential, onError, busy = false }) {
  const googleDivRef = useRef(null);

  const handleCredential = useCallback(
    (response) => {
      if (!response?.credential) {
        onError?.("Google sign-in failed. No credentials received.");
        return;
      }
      onCredential?.(response.credential);
    },
    [onCredential, onError]
  );

  // Fires when the popup is closed without consenting, consent is denied,
  // or the flow fails client-side (never receives a credential).
  const handleError = useCallback(
    (err) => {
      if (err?.type === "popup_closed_by_user" || err?.type === "dismissed") {
        onError?.("Google sign-in was cancelled before finishing.");
      } else {
        onError?.("Could not start Google sign-in. Please try again.");
      }
    },
    [onError]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const renderButton = () => {
      if (!window.google?.accounts?.id || !googleDivRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        error_callback: handleError,
      });
      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
      });
    };
    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.head.appendChild(script);
  }, [handleCredential, handleError]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div>
      <div
        ref={googleDivRef}
        className={`flex justify-center ${busy ? "pointer-events-none opacity-60" : ""}`}
        aria-busy={busy}
      />
      {busy && (
        <p className="text-sm text-center text-gray-500 mt-3">
          Signing you in with Google...
        </p>
      )}
    </div>
  );
}

export function GoogleDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="flex-grow border-t border-gray-200" />
      <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
      <span className="flex-grow border-t border-gray-200" />
    </div>
  );
}
