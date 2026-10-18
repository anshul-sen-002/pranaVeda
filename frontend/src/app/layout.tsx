import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PranaVeda | Calm yoga & holistic wellness",
    template: "%s | PranaVeda",
  },
  description:
    "Explore asanas, guided breathing, and calming soundscapes. Sign in to save routines, track streaks, and personalise your wellness journey.",
  icons: [
    { url: "/icon.png?v=1", type: "image/png", sizes: "192x192" },
    { url: "/icon.png?v=1", type: "image/png", sizes: "512x512" },
  ],
};

/**
 * Mobile contract: `width=device-width, initial-scale=1` is the baseline that
 * makes every page (current and future) render at the real device width.
 * `viewport-fit=cover` lets full-bleed sections extend under notches safely
 * (content still keeps its own safe padding).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Brand favicon — sizes declared so browsers render it large enough. */}
        <link rel="icon" href="/icon.png?v=1" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/icon.png?v=1" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png?v=1" sizes="180x180" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

