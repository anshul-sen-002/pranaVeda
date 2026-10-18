import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LotusMark } from "@/components/brand/LotusMark";

export const metadata: Metadata = {
  title: "Privacy | PranaVeda",
  description:
    "How PranaVeda handles your data: what we collect, what stays private, and your rights.",
};

const SECTIONS = [
  {
    title: "What you can do without an account",
    body: "Browsing published yoga content, streaming public calm audio, trying the live posture guide, and reading info pages never requires an account and sets no tracking profile for wellness data.",
  },
  {
    title: "What signing in unlocks — and stores",
    body: "Bookmarks, wellness profiles, practice sessions, streaks, routines, audio favourites, listening history, and optional saved posture summaries are stored privately and tied to your account. The backend re-resolves ownership from your session on every request, so you can only ever read or change your own data.",
  },
  {
    title: "What we never do",
    body: "We never sell personal data, never show your private wellness records to admins or other users, never put long-lived secrets in browser storage, and never upload camera frames — posture inference runs in your browser and only a compact summary you explicitly save ever reaches the server.",
  },
  {
    title: "AI companion",
    body: "Chat requests are sent to the configured provider to generate a reply. Your wellness profile is included only when you opt into personalisation and only the fields relevant to the question. Conversation history is stored only as a disclosed feature and can be deleted at any time.",
  },
  {
    title: "MediaPipe posture coach",
    body: "Pose estimation runs locally in your browser using the MediaPipe Pose Landmarker. Per upstream documentation, anonymised usage/performance metrics may be sent to Google by that library — camera frames themselves stay on your device unless you explicitly save a session summary.",
  },
  {
    title: "Your rights",
    body: "You can edit your profile, export your records, and delete your account and personal data from Settings and the Wellness pages. Contact support for any privacy request and we will respond promptly.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <LotusMark className="size-10 text-primary-500" />
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary-700 uppercase">
              Privacy notice
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Your data stays yours
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-body">
          Last updated October 2026. This notice summarises the data practices
          enforced by the platform&apos;s backend authorization rules. It is a
          plain-language summary, not legal advice.
        </p>
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
