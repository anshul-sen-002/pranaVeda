import Link from "next/link";
import { Play, Sprout } from "lucide-react";

/** Yoga listing hero matching screenshot 2: badge + CTA over lake art. */
export function AsanaHero() {
  return (
    <section aria-labelledby="asanas-heading" className="overflow-hidden rounded-3xl border border-border-soft bg-surface">
      <div className="flex flex-col gap-4 px-6 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-heading">Yoga Asanas</p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-body">
              Discover simple yet powerful yoga poses to improve your flexibility, strength and inner peace.
            </p>
          </div>
          <p className="hidden max-w-44 text-right text-sm leading-relaxed text-muted italic md:block">
            Small steps towards a healthier, happier you.
          </p>
        </div>
      </div>
      <div className="relative mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/hero-yoga.svg" alt="" aria-hidden="true" className="h-44 w-full object-cover sm:h-56" />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-gradient-to-r from-primary-50/95 via-primary-50/60 to-transparent px-6 sm:px-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
            <Sprout className="size-3.5" aria-hidden="true" />
            Beginner Friendly
          </span>
          <h1 id="asanas-heading" className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">
            Start Your Yoga Journey
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-body">
            Explore easy and effective yoga asanas for a healthier body, calmer mind and balanced life.
          </p>
          <Link
            href="/yoga?difficulty=BEGINNER"
            className="mt-1 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <Play className="size-4" aria-hidden="true" />
            Watch Intro
          </Link>
        </div>
      </div>
    </section>
  );
}
