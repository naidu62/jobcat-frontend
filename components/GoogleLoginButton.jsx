"use client";

// Shared "Continue with Google" button (Google Identity Services).
// Used by both /login and /register. The parent owns the auth flow:
// pass onCredential(credential) to exchange the ID token for JWTs and
// onError(message) to surface failures in the page's own error UI.
import { useCallback, useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleLoginButton({ onCredential, onError, busy = false }) {
  const googleDivRef = useRef(null);
  const mountedRef = useRef(true);
  const flowBusyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Only the first credential while busy is honored; a duplicated callback
  // (e.g. the popup closing right after consent) can never re-trigger the
  // parent flow after it has already produced its final state.
  const handleCredential = useCallback(
    (response) => {
      if (flowBusyRef.current) return;
      if (!mountedRef.current) return;
      if (!response?.credential) {
        onError?.("Google sign-in failed. No credentials received.");
        return;
      }
      flowBusyRef.current = true;
      onCredential?.(response.credential);
    },
    [onCredential, onError]
  );

  // Fires when the popup is closed without consenting, consent is denied,
  // or the flow fails client-side (never receives a credential). Clears the
  // busy state so no stale "Signing you in with Google…" box remains.
  const handleError = useCallback(
    (err) => {
      flowBusyRef.current = false;
      if (!mountedRef.current) return;
      if (err?.type === "popup_closed_by_user" || err?.type === "dismissed") {
        onError?.("Google sign-in was cancelled before finishing.");
      } else if (err?.type === "popup_failed_to_open" || err?.type === "popup_blocked") {
        onError?.("The Google sign-in window could not open. Please allow pop-ups and try again.");
      } else {
        onError?.("Could not complete Google sign-in. Please try again.");
      }
    },
    [onError]
  );

  // Reset the internal busy guard whenever the parent finishes the flow
  // (success, error, or cancellation all pass a fresh `busy=false`).
  useEffect(() => {
    if (!busy) flowBusyRef.current = false;
  }, [busy]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const renderButton = () => {
      if (!window.google?.accounts?.id || !googleDivRef.current || !mountedRef.current) return;
      const div = googleDivRef.current;
      // Clear any stale rendered/default prompt so a previous flow can never
      // leave a leftover box in the layout.
      if (window.google?.accounts?.id?.disableAutoSelect) {
        try {
          window.google.accounts.id.disableAutoSelect();
        } catch {
          /* ignore */
        }
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        error_callback: handleError,
      });
      div.innerHTML = "";
      window.google.accounts.id.renderButton(div, {
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
    return () => {
      if (window.google?.accounts?.id?.cancel) {
        try {
          window.google.accounts.id.cancel();
        } catch {
          /* ignore */
        }
      }
    };
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
