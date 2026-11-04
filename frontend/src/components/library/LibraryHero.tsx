import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Flower2, Play, Video } from "lucide-react";

const CONTENT = {
  asanas: {
    icon: Flower2,
    eyebrow: "Move with intention",
    title: "Yoga Asanas",
    description: "Find a pose that fits your body, your experience, and the time you have today.",
    panelEyebrow: "A practice for every day",
    panelTitle: "Start where you are.",
    panelText: "Explore step-by-step poses at your own pace. No account needed to browse.",
    action: "Explore poses",
  },
  videos: {
    icon: Video,
    eyebrow: "Practice along",
    title: "Yoga Videos",
    description: "Follow guided sessions and find a video that feels right for your practice.",
    panelEyebrow: "Find your flow",
    panelTitle: "Find your flow.",
    panelText: "Browse guided practice videos and stream published sessions freely.",
    action: "Browse videos",
  },
} as const;

/** Shared, responsive introduction for the public yoga and video libraries. */
export function LibraryHero({ variant }: { variant: keyof typeof CONTENT }) {
  const content = CONTENT[variant];
  const Icon = content.icon;

  return (
    <section className="mb-5 space-y-4 sm:mb-6 sm:space-y-5">
      <header className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#dfe9dc] bg-gradient-gourd-white text-primary-700 sm:size-13">
          <Icon className="size-5 sm:size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[11px] font-semibold tracking-[.14em] text-primary-700 uppercase sm:text-xs">{content.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">{content.title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body sm:text-base">{content.description}</p>
        </div>
      </header>

      <div className="relative isolate flex min-h-[230px] overflow-hidden rounded-3xl border border-[#dce7d8] shadow-[0_22px_65px_-42px_rgba(29,63,46,.5)] sm:min-h-[270px] lg:min-h-[290px]">
        <Image src="/yoga.png" alt="" fill sizes="(max-width: 1024px) 100vw, 75vw" priority className="-z-10 object-cover object-[58%_55%]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10281f]/80 via-[#10281f]/48 to-[#10281f]/10" aria-hidden="true" />
        <div className="relative flex w-full flex-col items-start justify-end p-5 text-white sm:justify-center sm:p-8 lg:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur sm:text-xs">
            <Icon className="size-3.5" aria-hidden="true" /> {content.panelEyebrow}
          </span>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">{content.panelTitle}</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">{content.panelText}</p>
          <Link href="#content-library" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-primary-800 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#f5f8f2]">
            {variant === "videos" ? <Play className="size-4 fill-current" aria-hidden="true" /> : <ArrowDown className="size-4" aria-hidden="true" />}
            {content.action}
          </Link>
        </div>
      </div>
    </section>
  );
}
