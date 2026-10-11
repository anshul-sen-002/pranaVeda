import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";

/**
 * Public home page (agents.md 2.1: fully browsable without an account).
 *
 * This is a Server Component. The header, hero, and CTA adapt to the session
 * via <AuthProvider>'s background refresh check, but the page shell and the
 * static content sections ship as server-rendered HTML for fast first paint.
 */
export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Features />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
