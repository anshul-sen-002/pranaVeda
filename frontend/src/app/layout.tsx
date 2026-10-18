import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DotLoader } from "@/components/motion/DotLoader";
import { AuthProvider } from "@/providers/AuthProvider";

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
  // Brand favicon served from the shared public asset (pranaveda.png).
  // `metadata.icons` emits <link rel="icon"> for modern browsers; the
  // explicit <link> tags below act as a fallback for browsers that ignore
  // metadata-generated icons. `?v=` busts the notoriously sticky favicon
  // cache — bump it whenever the brand mark changes.
  icons: [{ url: "/icon.png?v=1", type: "image/png", sizes: "any" }],
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
        {/* Brand favicon served from the shared public asset (pranaveda.png). */}
        <link rel="icon" href="/icon.png?v=1" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/icon.png?v=1" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png?v=1" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Global loading screen — covers the app while AuthProvider resolves the session. */}
        <DotLoader />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

