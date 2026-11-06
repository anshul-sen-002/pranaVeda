import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower2, Headphones, Play, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomeAuthGate } from "@/components/layout/HomeAuthGate";
import { AiCompanion } from "@/components/marketing/AiCompanion";

const libraries = [
  { title: "Guided yoga asanas", kicker: "Move with care", description: "Clear steps and thoughtful cues for your practice.", href: "/yoga", Icon: Flower2, accent: "bg-[#eaf1e5] text-primary-800", wash: "from-[#eff5e8] to-[#f8f5e9]", note: "Find your flow" },
  { title: "Videos", kicker: "Practice together", description: "Press play and follow along, at your own pace.", href: "/videos", Icon: Play, accent: "bg-[#e7eff3] text-[#406c7a]", wash: "from-[#eaf1f3] to-[#f4f5ed]", note: "A little guidance" },
  { title: "Audio", kicker: "Pause and listen", description: "Calming music and sounds for a softer moment.", href: "/calm-music", Icon: Headphones, accent: "bg-[#f1eaf3] text-[#765c7c]", wash: "from-[#f2ebf2] to-[#f7f1e7]", note: "Make space to rest" },
];

/** A calm, visual entry point to the PranaVeda practice libraries. */
export default function Home() {
  return (
    <HomeAuthGate>
    <div className="flex min-h-dvh flex-col overflow-clip bg-[#fbfbf7]"><SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="relative isolate overflow-hidden bg-[#f5f6ee]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_5%,rgba(218,232,211,.75),transparent_42%),linear-gradient(180deg,#f8f8f1,#f1f4eb)]" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-9 px-5 py-9 sm:px-8 sm:py-14 lg:min-h-[570px] lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:px-10 lg:py-16">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/75 px-3.5 py-2 text-xs font-semibold text-primary-800 shadow-sm sm:text-sm"><Flower2 className="size-4" aria-hidden="true" /> A gentler space for your wellbeing</span>
              <h1 className="mt-5 max-w-[13ch] text-[clamp(2.65rem,10vw,5rem)] leading-[.98] font-semibold tracking-[-.055em] text-heading">Come back to <span className="text-primary-700">yourself.</span></h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-body sm:mt-5 sm:text-base sm:leading-7">Make a little room in your day to move, breathe, and rest. Find a practice that feels right for you.</p>
              <Link href="#practice" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-700 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-800 sm:mt-7 sm:w-auto">Explore the library <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <p className="mt-3 text-center text-xs text-muted sm:text-left">Free to explore · Begin at your own pace</p>
            </div>
            <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
              <div className="relative aspect-[1.22/1] overflow-hidden rounded-[1.6rem] shadow-[0_28px_70px_-36px_rgba(34,67,47,.4)] sm:aspect-[1.45/1] sm:rounded-[2.2rem]">
                <Image src="/yoga.png" alt="A quiet mountain lake at sunrise" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14261f]/60 via-transparent to-white/10" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8"><p className="text-[10px] font-semibold tracking-[.18em] text-white/80 uppercase sm:text-xs">Your time, your rhythm</p><p className="mt-2 max-w-sm text-xl leading-tight font-medium tracking-tight sm:text-2xl">Small moments of care add up.</p></div>
              </div>
              <div className="absolute -bottom-3 right-3 rounded-2xl border border-white/90 bg-white/95 px-3.5 py-2.5 shadow-lg sm:-bottom-4 sm:right-7 sm:px-5 sm:py-3"><p className="text-[11px] text-muted sm:text-xs">Choose what you need</p><p className="mt-0.5 text-xs font-semibold text-heading sm:text-sm">Move · Listen · Restore</p></div>
            </div>
          </div>
        </section>

        <section id="practice" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10" aria-labelledby="practice-heading">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold tracking-[.16em] text-primary-700 uppercase">Explore PranaVeda</p><h2 id="practice-heading" className="mt-2 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">What would feel good today?</h2><p className="mt-2 text-sm leading-relaxed text-body sm:text-base">Start wherever you are. There is no perfect way to begin.</p></div>
          <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {libraries.map(({ title, kicker, description, href, Icon, accent, wash, note }) => (
              <Link key={title} href={href} className="group relative min-h-48 overflow-hidden rounded-[1.5rem] border border-[#e5e9df] bg-white p-5 shadow-[0_12px_34px_-30px_rgba(35,62,45,.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_-28px_rgba(35,62,45,.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:min-h-56 sm:rounded-[1.8rem] sm:p-6">
                <div className={`pointer-events-none absolute -top-14 -right-12 size-40 rounded-full bg-gradient-to-br ${wash} opacity-90 transition-transform duration-500 group-hover:scale-110`} />
                <div className="relative flex items-start justify-between"><span className={`flex size-11 items-center justify-center rounded-2xl ${accent}`}><Icon className="size-5" aria-hidden="true" /></span><ArrowRight className="mt-1 size-4 text-muted transition duration-200 group-hover:translate-x-1 group-hover:text-primary-700" aria-hidden="true" /></div>
                <div className="relative mt-5"><p className="text-[10px] font-semibold tracking-[.14em] text-muted uppercase">{kicker}</p><h3 className="mt-1 text-lg font-semibold text-heading sm:text-xl">{title}</h3><p className="mt-1.5 max-w-sm text-sm leading-relaxed text-body">{description}</p><p className="mt-4 text-xs font-medium text-primary-700">{note}</p></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[#e7eadf] bg-white/70" aria-labelledby="benefits-heading">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold tracking-[.16em] text-primary-700 uppercase">Made for real life</p><h2 id="benefits-heading" className="mt-2 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">A practice that fits you</h2><p className="mt-2 text-sm leading-relaxed text-body sm:text-base">Small, supportive ways to make wellbeing part of your day.</p></div>
            <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-3 sm:gap-4">
              {[
                { Icon: ShieldCheck, title: "Begin with confidence", text: "Clear pose guidance and safety notes help you choose what feels comfortable." },
                { Icon: Timer, title: "Go at your own pace", text: "Choose a short pause or a longer practice. You decide what today looks like." },
                { Icon: Sparkles, title: "Make it personal", text: "Save favourites, build routines, and keep track of the practices you enjoy." },
              ].map(({ Icon, title, text }) => <article key={title} className="flex gap-3 rounded-2xl border border-[#e8ebe3] bg-[#fbfbf7] p-4 sm:block sm:rounded-3xl sm:p-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:size-11 sm:rounded-2xl"><Icon className="size-5" aria-hidden="true" /></span><div><h3 className="text-sm font-semibold text-heading">{title}</h3><p className="mt-1 text-xs leading-relaxed text-body sm:text-sm">{text}</p></div></article>)}
            </div>
          </div>
        </section>
        <AiCompanion />
      </main><SiteFooter />
    </div>
    </HomeAuthGate>
  );
}
