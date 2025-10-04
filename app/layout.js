import './globals.css';

export const metadata = { title: 'JobCat.in', description: 'Latest job notifications' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-gray-900">
        <header className="border-b">
          <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl">JobCat.in</a>
            <nav className="text-sm space-x-4">
              <a className="hover:underline" href="/">Jobs</a>
              <a className="hover:underline" href="/about">About</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t mt-10">
          <div className="mx-auto max-w-5xl p-4 text-sm text-gray-600">© {new Date().getFullYear()} JobCat.in</div>
        </footer>
      </body>
    </html>
  );
}