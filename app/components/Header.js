"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 py-2">

        {/* Logo */}
        <div className="flex items-center gap-2">

          <Image
            src="/logo.png"
            alt="JobCat Logo"
            width={36}
            height={36}
            className="rounded-md"
            priority
          />

          <Link
            href="/"
            className="text-xl font-bold text-gray-900"
          >
            JobCat.in
          </Link>

        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-700">

          <Link href="/">Jobs</Link>

          <Link href="/schemes">
            Govt Schemes
          </Link>

          <Link href="/scholarships">
            Scholarships
          </Link>

          <Link href="/about">
            About
          </Link>

          <Link href="/contact">
            Contact
          </Link>

        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">

          <Link
            href="/login"
            className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
          >
            Register
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 border rounded-md"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">

          <nav className="flex flex-col p-4 space-y-3 text-sm">

            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Jobs
            </Link>

            <Link
              href="/schemes"
              onClick={() => setMobileMenuOpen(false)}
            >
              Govt Schemes
            </Link>

            <Link
              href="/scholarships"
              onClick={() => setMobileMenuOpen(false)}
            >
              Scholarships
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <hr />

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>

          </nav>

        </div>
      )}

    </header>
  );
}