import type { Metadata } from "next";
import { CamoChatWidget } from "@/components/chat/camo-chat";
import { ChatContextProvider } from "@/components/chat/chat-context";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zikit.ai"),
  title: "Zikit - Website Change Monitoring with AI Summaries",
  description:
    "Monitor any web page for changes and get AI-powered summaries of what changed. Not raw diffs — plain English insights like 'Competitor dropped prices by 15%.'",
  keywords: "website monitoring, page change detection, competitor tracking, AI summaries, web alerts",
  openGraph: {
    title: "Zikit - Know when any webpage changes",
    description: "AI-powered website change monitoring. Get plain-English summaries, not raw diffs.",
    type: "website",
    images: [{ url: "/assets/og-image.webp", width: 1200, height: 685 }],
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
      <body className="min-h-full flex flex-col">
        <ChatContextProvider>
          {children}
          <CamoChatWidget />
        </ChatContextProvider>
      </body>
    </html>
  );
}
