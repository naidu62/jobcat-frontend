"use client";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* 🔹 Logo + Title */}
        <div className="flex items-center gap-3">
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
            className="text-2xl font-bold text-gray-900 hover:text-blue-700 transition-colors"
          >
            JobCat.in
          </Link>
        </div>

        {/* 🔹 Nav Links (Desktop only) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Jobs
          </Link>
          <Link href="/schemes" className="hover:text-blue-600 transition-colors">
            Govt Schemes
          </Link>
          <Link href="/scholarships" className="hover:text-blue-600 transition-colors">
            Scholarships
          </Link>
          <Link href="/resources" className="hover:text-blue-600 transition-colors">
            Resources
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* 🔹 Auth Buttons (Desktop only) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </div>

        {/* 🔹 Mobile Menu Button (visible on small screens) */}
        <div className="md:hidden flex items-center">
          <button className="p-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}