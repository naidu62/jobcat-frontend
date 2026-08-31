"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getUser, isAuthenticated, logoutUser, resolveMediaUrl } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/schemes", label: "Govt Schemes" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const syncAuthState = useCallback(() => {
    const active = isAuthenticated();
    const user = getUser();
    setAuthed(active);
    setUserName(active && user ? user.first_name || user.email : null);
    setAvatarUrl(active ? resolveMediaUrl(user?.profile?.avatar_url) : "");
  }, []);

  useEffect(() => {
    syncAuthState();
    window.addEventListener("focus", syncAuthState);
    window.addEventListener("jobcat-auth-sync", syncAuthState);
    return () => {
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener("jobcat-auth-sync", syncAuthState);
    };
  }, [syncAuthState]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile menu is open, and restore it
  // (overflow) when the menu closes, navigation occurs, or this component
  // unmounts. Stored overflow is restored so we never clobber a *different*
  // active lock (e.g. a modal opened by another component).
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    await logoutUser();
    syncAuthState();
    router.push("/");
    router.refresh();
  }

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 lg:gap-x-6">

        {/* Logo */}
        <div className="flex items-center gap-2.5 lg:shrink-0">
          <Image
            src="/logo.png"
            alt="JobCat Logo"
            width={40}
            height={40}
            className="rounded-md border border-gray-300 bg-white p-1"
            priority
          />

          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-blue-700 transition-colors"
          >
            JobCat.in
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav
          className="hidden lg:flex items-center lg:gap-5 text-sm font-medium text-gray-700"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`py-2 transition-colors hover:text-blue-700 ${
                isActive(item.href)
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2">
          {authed ? (
            <>
              <Link href="/dashboard" className={`text-sm min-h-[44px] inline-flex items-center px-3 rounded-md transition ${isActive("/dashboard") ? "text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-100"}`}>
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-sm min-h-[44px] inline-flex items-center gap-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition"
                title="Your profile"
              >
                {avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200"
                  />
                )}
                {userName && (
                  <span>
                    Hi, <strong>{userName}</strong>
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm min-h-[44px] px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm min-h-[44px] inline-flex items-center px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="text-sm min-h-[44px] inline-flex items-center px-4 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu — fixed overlay with a backdrop so the page behind is
          neither visible/interactive nor scrollable while it is open. */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Backdrop: click to close */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
          />
          {/* Panel */}
          <div className="relative z-10 bg-white border-b border-gray-200 shadow-lg max-h-[calc(100dvh-4rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col p-4 space-y-1 text-sm font-medium">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`min-h-[44px] flex items-center px-2 rounded-md ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <hr />

              {authed ? (
                <>
                  <Link
                    href="/dashboard"
                    className="min-h-[44px] flex items-center px-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="min-h-[44px] flex items-center px-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="min-h-[44px] flex items-center px-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="min-h-[44px] text-left px-2 rounded-md text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="min-h-[44px] flex items-center justify-center mt-1 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/register"
                    className="min-h-[44px] flex items-center justify-center mt-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </>
              )}

            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
