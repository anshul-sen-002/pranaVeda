"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Sprout } from "lucide-react";

/** Yoga listing hero. Displays a warm hero image with a dark overlay so the
 * white text stays readable. Height matches the dashboard hero for a
 * consistent page rhythm.
 */
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
      <div className="mobile-compact relative mt-4 overflow-hidden rounded-2xl border border-border-soft px-6 py-8 sm:h-64 sm:px-8 h-56">
        <Image
          src="/yoga.png"
          alt=""
          fill
          className="object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <span className="absolute left-6 top-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-black sm:left-8">
          <Sprout className="size-3.5" aria-hidden="true" />
          Beginner Friendly
        </span>
        <div className="absolute inset-0 flex flex-col justify-center gap-2 px-6 pt-10 sm:pt-0 sm:pb-8 sm:pl-8">
          <h1 id="asanas-heading" className="text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl">
            Start Your Yoga Journey
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-white/85">
            Explore easy and effective yoga asanas for a healthier body, calmer mind and balanced life.
          </p>
          <Link
            href="/yoga?difficulty=BEGINNER"
            className="mt-1 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-0.5"
          >
            <Play className="size-4" aria-hidden="true" />
            Watch Intro
          </Link>
        </div>
      </div>
    </section>
  );
}
