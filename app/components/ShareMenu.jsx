"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, MessageCircle, Send, Share2 } from "lucide-react";

// Brand icons were removed from lucide-react; inline SVGs keep the same
// visual without pulling another dependency.
function FacebookIcon({ size = 17, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.6V3.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.6H7.5V13h2.8v8h3.2z" />
    </svg>
  );
}

function XIcon({ size = 17, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.7 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7L17.7 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11 14.5z" />
    </svg>
  );
}

/**
 * Copy text to the clipboard with layered fallbacks.
 * NEVER throws: every path is individually guarded because a synchronous
 * throw inside an event handler unmounts the whole React tree in
 * production (Next.js "Application error: client-side exception").
 *
 * 1. Async Clipboard API (secure contexts only)
 * 2. Hidden-textarea + execCommand fallback (http / older browsers)
 */
async function copyToClipboard(text) {
  if (typeof window === "undefined") return false;
  try {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav?.clipboard && window.isSecureContext) {
      await nav.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied / document not focused / insecure context:
    // fall through to the legacy path below.
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "-9999px";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    // setSelectionRange is required for iOS Safari.
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/** True only when the Web Share API is actually callable in this browser. */
function detectNativeShare() {
  try {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
  } catch {
    return false;
  }
}

function toAbsolute(url) {
  // navigator.share rejects relative URLs; make everything absolute.
  if (!url) return "";
  try {
    return new URL(url, typeof window !== "undefined" ? window.location.origin : undefined).toString();
  } catch {
    return url;
  }
}

/**
 * Share menu with native Web Share API support on mobile and explicit
 * fallbacks (Copy / WhatsApp / Telegram / Facebook / X) everywhere else.
 * All handlers are crash-proof by design; feedback is surfaced via toast.
 */
export default function ShareMenu({ url, title, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [toast, setToast] = useState(null); // { ok: boolean, text: string }
  const rootRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setCanNativeShare(detectNativeShare());
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Always clear the pending toast timer on unmount.
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(ok, text) {
    setToast({ ok, text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  async function copyLink() {
    const link = toAbsolute(url);
    const ok = await copyToClipboard(link);
    setCopied(ok);
    showToast(
      ok,
      ok ? "Link copied to clipboard" : "Could not copy — long-press the page URL instead"
    );
    if (ok) setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (!nav || typeof nav.share !== "function") {
      // Should never happen (option is hidden), but never crash either.
      copyLink();
      return;
    }
    try {
      await nav.share({ title: title || "", text: title || "", url: toAbsolute(url) });
      setOpen(false);
    } catch (err) {
      if (err?.name === "AbortError") return; // user dismissed the sheet
      console.error("Web Share failed:", err);
      showToast(false, "Sharing was blocked — link copied instead");
      copyLink();
    }
  }

  function openPopup(shareUrl) {
    let win = null;
    try {
      win = window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=560");
    } catch {
      win = null;
    }
    if (!win) {
      // Popup blocked: navigate in the same tab rather than dying silently.
      try {
        window.location.href = shareUrl;
      } catch {
        showToast(false, "Popup blocked — please allow popups for this site");
      }
      return;
    }
    setOpen(false);
  }

  const safeUrl = toAbsolute(url);
  const encodedUrl = encodeURIComponent(safeUrl);
  const encodedTitle = encodeURIComponent(title || "");

  const options = [
    {
      label: copied ? "Copied!" : "Copy link",
      icon: copied ? <Check size={17} className="text-green-600" /> : <Copy size={17} />,
      action: copyLink,
    },
    {
      label: "WhatsApp",
      icon: <MessageCircle size={17} className="text-green-600" />,
      action: () => openPopup(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      label: "Telegram",
      icon: <Send size={17} className="text-sky-500" />,
      action: () => openPopup(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      label: "Facebook",
      icon: <FacebookIcon size={17} className="text-blue-600" />,
      action: () => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      label: "X (Twitter)",
      icon: <XIcon size={17} className="text-gray-900" />,
      action: () =>
        openPopup(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
    },
  ];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-full inline-flex min-h-[44px] items-center justify-center gap-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition"
      >
        <Share2 size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {open && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 sm:right-auto left-auto sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 z-40 w-52 rounded-xl border border-gray-200 bg-white shadow-xl py-1.5"
          >
            {canNativeShare && (
              <button
                role="menuitem"
                type="button"
                onClick={nativeShare}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
              >
                <Share2 size={17} />
                More options…
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.label}
                role="menuitem"
                type="button"
                onClick={opt.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition"
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium ${
            toast.ok ? "bg-gray-900 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.ok ? <Check size={15} /> : null}
          {toast.text}
        </div>
      )}
    </div>
  );
}

export function ShareIconOnly(props) {
  return <ShareMenu {...props} />;
}
