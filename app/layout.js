// app/layout.js
import "./globals.css";
import Header from "./components/Header";

export const metadata = {
  title: "JobCat.in - Find Latest Jobs",
  description: "Get instant job notifications, categorized for you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 🔹 This ensures proper mobile scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
        {/* 🟦 Global Header */}
        <Header />
        {/* 🟩 Main Page Content */}
        <main className="flex-grow w-full py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl p-6 sm:p-8">
            {children}
          </div>
        </main>

        {/* ⚫ Global Footer */}
        <footer className="border-t border-gray-200 bg-white shadow-inner">
          <div className="w-full px-6 py-6 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} <strong>JobCat.in</strong> — All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}