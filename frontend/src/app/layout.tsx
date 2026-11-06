import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PranaVeda | Calm yoga & holistic wellness",
    template: "%s | PranaVeda",
  },
  description:
    "Explore asanas, guided breathing, and calming soundscapes. Sign in to save routines, track streaks, and personalise your wellness journey.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/pranaveda.png?v=2", sizes: "180x180" }],
  },
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfbf7] antialiased overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


