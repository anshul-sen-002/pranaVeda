import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy | PranaVeda",
  description: "How PranaVeda handles account information, wellness data, and media.",
};

const sections = [
  { title: "Browsing without an account", body: "You can browse published yoga asanas and videos, stream public audio, and read information pages without signing in. Personal features such as saved content and practice history require an account." },
  { title: "Information linked to your account", body: "When you create an account, we store the information needed to provide it, such as your email address and profile details. If you use personal features, we may also store saved items, wellness preferences, practice sessions, routines, audio favourites, and listening history." },
  { title: "How we use your information", body: "Account and activity information is used to provide the features you request, keep your account secure, and maintain the service. We do not sell personal information. Private account records are separate from the public content libraries." },
  { title: "AI companion", body: "If you choose to use the AI companion, your message is sent to the configured AI provider to generate a response. Conversation history may be stored in your account so you can revisit it, and can be deleted using the available account controls. Avoid sharing sensitive information in a chat." },
  { title: "Camera and posture coach", body: "The optional posture coach processes camera frames in your browser for pose estimation. Camera frames are not uploaded by the coach. If you choose to save a session summary, that summary is sent to the service. The pose estimation library may send anonymised usage or performance metrics to its provider." },
  { title: "Uploaded media and service providers", body: "Authorised content editors upload media for the yoga and audio libraries. Files are stored by the configured storage provider so the app can deliver them; published media may be available to visitors. PranaVeda also relies on hosting and infrastructure providers to operate the service." },
  { title: "Your choices", body: "You can update profile and wellness information in account settings. Where available, use account controls to export or delete personal data. You can also contact PranaVeda with a privacy request." },
];

export default function PrivacyPage() {
  return <div className="flex min-h-dvh flex-col bg-[#fbfbf7]"><SiteHeader />
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <header className="rounded-3xl border border-[#e5e9df] bg-gradient-to-br from-[#eef4e9] to-[#fbf8ef] p-5 sm:p-8"><span className="flex size-11 items-center justify-center rounded-2xl bg-white/80 text-primary-700"><ShieldCheck className="size-5" aria-hidden="true" /></span><p className="mt-4 text-xs font-semibold tracking-[.16em] text-primary-700 uppercase">Privacy notice</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">Your information, handled with care.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">Last updated November 4, 2026. This page describes the information involved when you browse PranaVeda and choose to use its features.</p></header>
      <div className="mt-5 grid gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4">{sections.map((section) => <section key={section.title} className="rounded-3xl border border-border-soft bg-white p-5 sm:p-6"><h2 className="font-semibold text-heading">{section.title}</h2><p className="mt-2 text-sm leading-relaxed text-body">{section.body}</p></section>)}</div>
    </main><SiteFooter /></div>;
}
