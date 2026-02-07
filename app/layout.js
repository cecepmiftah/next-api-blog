import Header from "@/components/Header";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Next.js Blog",
  description: "A simple blog built with Next.js and MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <ToastProvider>
            <div className="min-h-screen">
              <Header />
              <main className="container mx-auto px-6 py-8">{children}</main>
            </div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
