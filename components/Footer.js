import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  EditorJS Blog
                </h2>
                <p className="text-sm text-slate-400">Rich Content Platform</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Create, publish, and manage rich content with our advanced editor
              platform.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/posts"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Posts
                </a>
              </li>
              <li>
                <a
                  href="/editor"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Editor
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/docs"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/api"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Connect</h3>
            <p className="text-slate-400 text-sm mb-4">
              Stay updated with our latest features and announcements.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700/50 text-center text-slate-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} EditorJS Blog Platform. All rights
            reserved.
          </p>
          <p className="mt-2">Built with Next.js, Editor.js, and Cloudinary</p>
        </div>
      </div>
    </footer>
  );
}
