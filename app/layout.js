import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Next.js Blog',
  description: 'A simple blog built with Next.js and MongoDB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen">
          <header className="bg-slate-800 shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-white hover:text-indigo-400">
                MyBlog
              </Link>
              <div className="space-x-4">
                <Link href="/" className="text-slate-300 hover:text-indigo-400">
                  Home
                </Link>
                <Link href="/create-post" className="text-slate-300 hover:text-indigo-400">
                  Create Post
                </Link>
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
