"use client";

// app/admin/layout.js
// Guard shell for the admin area. Authorization is verified server-side on
// every page load: a lightweight call to /api/admin/stats/ succeeds only for
// staff accounts (the backend returns 403 otherwise).
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin";

const NAV_ITEMS = [
  { href: "/admin/moderation", label: "Dashboard" },
  { href: "/admin/moderation/reports", label: "Reports" },
  { href: "/admin/moderation/users", label: "Users" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let active = true;
    if (!isAuthenticated()) {
      router.replace("/login?next=" + encodeURIComponent(pathname || "/admin"));
      return;
    }
    getAdminStats()
      .then(() => active && setState("ok"))
      .catch(() => active && setState("denied"));
    return () => {
      active = false;
    };
  }, [router, pathname]);

  if (state === "checking") {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
        <p className="text-gray-500 mb-6">
          You need moderator permissions to view this area.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex gap-2 mb-8 border-b border-gray-200 pb-3" aria-label="Admin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
