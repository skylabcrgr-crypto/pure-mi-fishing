import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Pure MI Fishing — Michigan Fishing App | Detroit River Offline Maps & Regulations",
    template: "%s | Pure MI Fishing",
  },
  description:
    "Independent field companion for Michigan anglers. Offline Detroit River fishing maps, boat launch finder, simplified DNR regulation summaries, species guides, water conditions, and trip tools. Works without cell service.",
  keywords: [
    "Michigan fishing app",
    "Detroit River fishing map",
    "offline fishing maps Michigan",
    "Michigan fishing regulations",
    "Detroit River walleye fishing",
    "Michigan boat launches",
    "fishing license Michigan",
    "Michigan fishing conditions",
    "ice fishing Michigan",
    "spearfishing Michigan",
    "Detroit River launch sites",
    "Michigan DNR fishing regulations",
    "Belle Isle fishing",
    "Trenton Channel fishing",
  ],
  openGraph: {
    title: "Pure MI Fishing — Michigan Fishing App",
    description:
      "Offline-first field companion for Detroit River anglers. Maps, boat launches, simplified regulations, water conditions — works without cell signal.",
    url: "https://puremi.fishing",
    siteName: "Pure MI Fishing",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pure MI Fishing — Michigan Fishing App",
    description:
      "Offline-first field companion for Detroit River anglers. Maps, regulations, launches, and conditions — even without signal.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://puremi.fishing",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#050f1d] text-[#f0f9ff]">
        {children}
      </body>
    </html>
  );
}
