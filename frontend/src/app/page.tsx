import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AiCompanion } from "@/components/marketing/AiCompanion";
import { CalmMusicTeaser } from "@/components/marketing/CalmMusicTeaser";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PersonalSide } from "@/components/marketing/PersonalSide";
import { TrustBand } from "@/components/marketing/TrustBand";

/**
 * Public home page (agents.md 2.1: fully browsable without an account).
 *
 * This is a Server Component. The header, hero, and CTA adapt to the session
 * via <AuthProvider>'s background refresh check, but the page shell and the
 * static content sections ship as server-rendered HTML for fast first paint.
 *
 * Section order tells the product story: calm first impression, honest
 * promises, the free library, how the journey works, the AI companion, calm
 * music, the personal side, then the closing nudge.
 */
export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <TrustBand />
        <Features />
        <HowItWorks />
        <AiCompanion />
        <CalmMusicTeaser />
        <PersonalSide />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}
