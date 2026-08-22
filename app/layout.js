// app/layout.js
import "./globals.css";
import Header from "./components/Header";
import { SITE_URL } from "@/lib/api";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JobCat - Find Jobs, Government Schemes & Scholarships",
    template: "%s | JobCat",
  },
  description:
    "Search government jobs, private jobs, schemes and scholarships in one place.",
  keywords: [
    "government jobs",
    "sarkari naukri",
    "job notifications",
    "govt schemes",
    "scholarships",
    "exam updates",
  ],
  applicationName: "JobCat.in",
  authors: [{ name: "VN Techno-Soft Solutions", url: SITE_URL }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "JobCat.in",
    title: "JobCat - Find Jobs, Government Schemes & Scholarships",
    description:
      "Search government jobs, private jobs, schemes and scholarships in one place.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "JobCat.in",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "JobCat - Find Jobs, Government Schemes & Scholarships",
    description:
      "Search government jobs, private jobs, schemes and scholarships in one place.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        {/* 🟦 Global Header */}
        <Header />

        {/* 🟩 Main Page Content */}
        <main className="flex-grow w-full">{children}</main>

        {/* ⚫ Global Footer — single site-wide copyright */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-600">
            © {new Date().getFullYear()}{" "}
            <strong className="text-gray-800">JobCat.in</strong> — All rights
            reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
