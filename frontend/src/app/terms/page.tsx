import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Terms | PranaVeda",
  description: "Terms for using PranaVeda's yoga, video, and audio libraries.",
};

const sections = [
  { title: "A general wellness service", body: "PranaVeda provides general wellness education through guided yoga asanas, videos, and audio. The content is not medical advice and does not diagnose, treat, or cure any condition. Consult a qualified healthcare professional about medical concerns, and stop an activity that causes pain, dizziness, or discomfort." },
  { title: "Your account", body: "Some features, such as saving content and recording practice history, require an account. Keep your sign-in details secure and let us know if you believe someone else has accessed your account. You are responsible for activity carried out through your account." },
  { title: "Using the service respectfully", body: "Use PranaVeda lawfully and do not disrupt the service, attempt to access another person's account or data, upload malicious files, or submit content that infringes another person's rights. Access to the service may be limited when needed to protect users and keep it operating." },
  { title: "Content and media", body: "Published library content is provided for personal practice and may be streamed in the app. Content remains owned by its respective rights holder. Do not copy, redistribute, or commercially use it unless you have permission or its license allows it. Authorised editors must have the rights needed to upload and publish media." },
  { title: "Changes and availability", body: "We may update features or these terms as PranaVeda evolves. The revision date on this page will be updated when the terms change. We work to keep the service available, but cannot promise uninterrupted access." },
];

export default function TermsPage() {
  return <div className="flex min-h-dvh flex-col bg-[#fbfbf7]"><SiteHeader />
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <header className="rounded-3xl border border-[#e5e9df] bg-gradient-to-br from-[#eef4e9] to-[#fbf8ef] p-5 sm:p-8"><span className="flex size-11 items-center justify-center rounded-2xl bg-white/80 text-primary-700"><HeartHandshake className="size-5" aria-hidden="true" /></span><p className="mt-4 text-xs font-semibold tracking-[.16em] text-primary-700 uppercase">Terms of use</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">Simple guidance for using PranaVeda.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">Last updated November 4, 2026. By using PranaVeda, you agree to these terms.</p></header>
      <div className="mt-5 space-y-3 sm:mt-7 sm:space-y-4">{sections.map((section) => <section key={section.title} className="rounded-3xl border border-border-soft bg-white p-5 sm:p-6"><h2 className="font-semibold text-heading">{section.title}</h2><p className="mt-2 text-sm leading-relaxed text-body">{section.body}</p></section>)}</div>
    </main><SiteFooter /></div>;
}
