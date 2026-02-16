import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EditorJS Blog Platform",
  description: "Rich content platform with Editor.js and Next.js",
};

export default function RootLayout({ children, modal }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 min-h-screen`}
      >
        <AuthProvider>
          <Toaster />
          {/* Navbar */}
          <Navbar />
          <main className="min-h-screen">
            {children}
            {modal}
          </main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
