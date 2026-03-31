import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PageLifeguard - Website Change Monitoring with AI Summaries",
  description:
    "Monitor any web page for changes and get AI-powered summaries of what changed. Not raw diffs — plain English insights like 'Competitor dropped prices by 15%.'",
  keywords: "website monitoring, page change detection, competitor tracking, AI summaries, web alerts",
  openGraph: {
    title: "PageLifeguard - Know when any webpage changes",
    description: "AI-powered website change monitoring. Get plain-English summaries, not raw diffs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
