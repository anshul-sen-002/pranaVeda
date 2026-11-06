import type { Metadata } from "next";
import Link from "next/link";
import { Flower2, Headphones, Play, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "About PranaVeda | A calmer way to practise",
  description: "Explore guided yoga asanas, videos, and calming audio with PranaVeda.",
};

const offerings = [
  { title: "Guided yoga asanas", description: "Explore poses with clear, step-by-step guidance.", href: "/yoga", Icon: Flower2, tint: "bg-[#eaf1e5] text-primary-800" },
  { title: "Videos", description: "Follow along with practices when you want a little company.", href: "/videos", Icon: Play, tint: "bg-[#e7eff3] text-[#406c7a]" },
  { title: "Audio", description: "Settle into calming music and gentle soundscapes.", href: "/calm-music", Icon: Headphones, tint: "bg-[#f1eaf3] text-[#765c7c]" },
];

export default function AboutPage() {
  return <div className="flex min-h-dvh flex-col bg-[#fbfbf7]"><SiteHeader />
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <header className="max-w-3xl"><p className="text-xs font-semibold tracking-[.16em] text-primary-700 uppercase">About PranaVeda</p><h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-heading sm:text-5xl">A little space to move, listen, and feel well.</h1><p className="mt-4 text-sm leading-7 text-body sm:text-base sm:leading-8">PranaVeda brings yoga guidance, follow-along videos, and calming audio together in one welcoming place. Come as you are, choose what you need today, and make the practice your own.</p></header>
      <section className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3" aria-label="Explore the PranaVeda libraries">
        {offerings.map(({ title, description, href, Icon, tint }) => <Link key={title} href={href} className="group rounded-3xl border border-border-soft bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"><span className={`flex size-11 items-center justify-center rounded-2xl ${tint}`}><Icon className="size-5" aria-hidden="true" /></span><h2 className="mt-4 font-semibold text-heading">{title}</h2><p className="mt-1 text-sm leading-relaxed text-body">{description}</p></Link>)}
      </section>
      <section className="mt-5 grid gap-4 rounded-3xl border border-[#e5e9df] bg-gradient-to-br from-[#eef4e9] to-[#fbf8ef] p-5 sm:mt-7 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-5 sm:p-7">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/80 text-primary-700"><ShieldCheck className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-heading">Wellbeing, with care</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-body">PranaVeda shares general wellness education, not medical advice. Listen to your body, stop any movement that causes pain or dizziness, and speak with a qualified healthcare professional if you have a health concern or injury.</p></div>
      </section>
    </main><SiteFooter /></div>;
}
