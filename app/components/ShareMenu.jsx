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
 * Share menu with native Web Share API support on mobile and explicit
 * fallbacks (Copy / WhatsApp / Telegram / Facebook / X) everywhere else.
 */
export default function ShareMenu({ url, title, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (http or permissions): legacy fallback.
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: title, url });
      setOpen(false);
    } catch (err) {
      if (err?.name !== "AbortError") console.error(err);
    }
  }

  function openPopup(shareUrl) {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=640,height=560");
    setOpen(false);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

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
    </div>
  );
}

export function ShareIconOnly(props) {
  return <ShareMenu {...props} />;
}
