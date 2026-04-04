import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CamoChatWidget } from "@/components/chat/camo-chat";
import { ChatContextProvider } from "@/components/chat/chat-context";
import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-sans",
  subsets: ["latin", "hebrew"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zikit.ai"),
  title: { default: "Zikit - Website Change Monitoring with AI Summaries", template: "%s | Zikit" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  description:
    "Monitor any web page for changes and get AI-powered summaries of what changed. Not raw diffs  - plain English insights.",
  other: {
    "theme-color": "#7CCB8B",
    "format-detection": "telephone=no",
  },
  openGraph: {
    siteName: "Zikit",
    locale: "en_US",
    type: "website",
    images: [
      { url: "/assets/og-image.png", width: 1200, height: 630, alt: "Zikit - AI-powered website change monitoring" },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
      className={`${rubik.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Zikit",
                url: "https://zikit.ai",
                logo: "https://zikit.ai/assets/zikit-nav-logo.webp",
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "support@zikit.ai",
                  contactType: "customer support",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Zikit",
                url: "https://zikit.ai",
                description:
                  "AI-powered website change monitoring. Get plain-English summaries of what changed on any webpage.",
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Zikit",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                url: "https://zikit.ai",
                description:
                  "Monitor any webpage for changes and get AI-powered summaries. Track competitors, compliance pages, pricing, job boards, and more.",
                offers: [
                  { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
                  { "@type": "Offer", price: "19", priceCurrency: "USD", name: "Pro" },
                  { "@type": "Offer", price: "49", priceCurrency: "USD", name: "Business" },
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is Zikit?",
                    acceptedAnswer: { "@type": "Answer", text: "Zikit is an AI-powered website change monitoring tool. Add any URL and Zikit checks it automatically. When something changes, you get a plain-English summary of what changed  - not a raw diff." },
                  },
                  {
                    "@type": "Question",
                    name: "How does Zikit detect changes?",
                    acceptedAnswer: { "@type": "Answer", text: "Zikit fetches the page at your chosen frequency (every 15 minutes to weekly), compares the content with the previous version, and uses AI to generate a human-readable summary of the differences." },
                  },
                  {
                    "@type": "Question",
                    name: "Is Zikit free?",
                    acceptedAnswer: { "@type": "Answer", text: "Yes. The free plan includes 3 monitors with daily checks, email alerts, and AI summaries. No credit card required. Paid plans start at $19/month for more monitors and faster checks." },
                  },
                  {
                    "@type": "Question",
                    name: "What can I monitor with Zikit?",
                    acceptedAnswer: { "@type": "Answer", text: "Any public webpage  - competitor pricing pages, regulatory updates, job boards, product pages, news sites, terms of service, government portals, and more." },
                  },
                  {
                    "@type": "Question",
                    name: "How do I get notified when a page changes?",
                    acceptedAnswer: { "@type": "Answer", text: "Zikit sends alerts via email, Slack, Discord, Telegram, or custom webhooks. Each alert includes an AI-generated summary explaining what changed and how important the change is." },
                  },
                  {
                    "@type": "Question",
                    name: "Can I change plans anytime?",
                    acceptedAnswer: { "@type": "Answer", text: "Yes  - upgrade or downgrade instantly. No lock-in. We offer a 30-day money-back guarantee on all paid plans." },
                  },
                ],
              },
            ]),
          }}
        />
        <ChatContextProvider>
          {children}
          <CamoChatWidget />
        </ChatContextProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
