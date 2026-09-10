import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Scouter Apply",
  description:
    "Swipe HK jobs, save fits, generate tailored CV + cover letter packs. Local-first MVP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-slate-100">
        <Nav />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:pb-10">{children}</main>
      </body>
    </html>
  );
}
