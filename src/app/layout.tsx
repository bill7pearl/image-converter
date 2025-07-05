import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import NavBar from './NavBar';

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: 'Free Unlimited Image Converter',
  description: 'Convert and compress images instantly. Bulk upload, format conversion, and compression. 100% free and unlimited.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-zinc-900 text-gray-100 min-h-screen transition-colors antialiased">
        <header className="w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-30">
          <NavBar />
        </header>
        <main className="flex flex-col items-center min-h-[80vh] w-full bg-transparent">
          {children}
        </main>
        <footer className="w-full border-t border-zinc-800 bg-zinc-900/80 text-center py-4 text-xs text-gray-400 mt-8">
          MVP Demo &copy; 2024 &mdash; Made with Next.js & Tailwind CSS
        </footer>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </body>
    </html>
  );
}
