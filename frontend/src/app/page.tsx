import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomeCta } from "@/components/marketing/HomeCta";
import { HomeFeatures } from "@/components/marketing/HomeFeatures";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomePoses } from "@/components/marketing/HomePoses";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HomeHero />
        <HomePoses />
        <HomeFeatures />
        <HomeCta />
      </main>
      <SiteFooter />
    </div>
  );
}
