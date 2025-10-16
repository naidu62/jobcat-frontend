// app/layout.js
import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'JobCat.in - Find Latest Jobs',
  description: 'Get instant job notifications, categorized for you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 flex flex-col">
        {/* Header */}
        <header className="shadow-sm bg-white sticky top-0 z-50 border-b border-gray-100">
          <div className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="font-extrabold text-2xl text-blue-700">
              JobCat.in
            </Link>

            <nav className="text-sm font-medium space-x-6 text-gray-600">
              <Link href="/" className="hover:text-blue-600">Jobs</Link>
              <Link href="/about" className="hover:text-blue-600">About</Link>
              <Link href="/contact" className="hover:text-blue-600">Contact</Link>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow w-full px-6 py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-gray-50">
          <div className="w-full px-6 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} JobCat.in — All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}