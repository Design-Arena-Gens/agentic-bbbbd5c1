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
  title: "Free AI Video Studio Finder",
  description:
    "Curated tracker to discover free AI video generators, save login details, and manage onboarding steps.",
  openGraph: {
    title: "Free AI Video Studio Finder",
    description:
      "Discover AI video tools with generous free tiers and track login progress in one dashboard.",
    url: "https://agentic-bbbbd5c1.vercel.app",
    siteName: "AI Video Studio Finder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Video Studio Finder",
    description:
      "Discover AI video tools with generous free tiers and track login progress in one dashboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
