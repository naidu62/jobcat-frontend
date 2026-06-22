// app/layout.js
import "./globals.css";
import Header from "./components/Header";
import Link from "next/link";

export const metadata = {
  title: "JobCat.in - Find Latest Jobs",
  description: "Get instant job notifications, categorized for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans">

        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="bg-white rounded-lg p-3 sm:p-5">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-200 bg-white">

          <div className="max-w-7xl mx-auto px-4 py-6">

            <div className="text-center text-sm font-semibold text-gray-800">
              JobCat.in
            </div>

            <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-gray-500">

  <Link
    href="/jobs?category=government"
    className="hover:text-blue-600"
  >
    Govt Jobs
  </Link>

  <Link
    href="/jobs?category=railway"
    className="hover:text-blue-600"
  >
    Railway Jobs
  </Link>

  <Link
    href="/jobs?category=bank"
    className="hover:text-blue-600"
  >
    Bank Jobs
  </Link>

  <Link
    href="/scholarships"
    className="hover:text-blue-600"
  >
    Scholarships
  </Link>

</div>

            <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>About</span>
              <span>Contact</span>
              <span>Privacy Policy</span>
            </div>

            <div className="mt-4 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} JobCat.in • Version 2.0.0
            </div>

          </div>

        </footer>

      </body>
    </html>
  );
}