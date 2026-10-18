import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LotusMark } from "@/components/brand/LotusMark";

export const metadata: Metadata = {
  title: "Terms | PranaVeda",
  description: "Terms of use for the PranaVeda yoga and wellness platform.",
};

const SECTIONS = [
  {
    title: "Educational wellness space",
    body: "PranaVeda provides general yoga, breathing, audio, and wellness education. Nothing here is medical advice and nothing diagnoses, treats, or cures any condition. Always consult a qualified professional for medical concerns.",
  },
  {
    title: "Your account",
    body: "Public registration always creates a USER account — roles are never accepted from the client. You are responsible for keeping your credentials safe and for activity under your account. We may rate-limit login, registration, downloads, and AI endpoints to keep the service fair and safe.",
  },
  {
    title: "Acceptable use",
    body: "Do not misuse the service: no scraping to harvest private data, no attempts to access other users' records by changing IDs, no uploading executable or infringing media, and no attempts to override AI safety rules. Admins manage published content and taxonomy; they never gain access to your private wellness records.",
  },
  {
    title: "Media and downloads",
    body: "Public videos and audio may be streamed freely. Downloads are a member benefit and require sign-in plus a downloadable license. Do not redistribute downloaded media beyond personal use unless the stated license permits it.",
  },
  {
    title: "Changes",
    body: "We may update these terms as features evolve. Material changes will be noted here with a new revision date. Continued use of the platform after changes means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <LotusMark className="size-10 text-primary-500" />
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary-700 uppercase">
              Terms of use
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Simple, fair terms
            </h1>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="rounded-3xl border border-border-soft bg-surface p-6"
            >
              <h2 className="font-semibold text-heading">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
