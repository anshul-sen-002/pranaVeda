import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CopyrightYear } from "@/components/layout/CopyrightYear";

const links = [
  { label: "Asanas", href: "/yoga" },
  { label: "Videos", href: "/videos" },
  { label: "Audio", href: "/calm-music" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** Compact public footer with the essential library and policy links. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-[#f8f9f4]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6 lg:px-10">
        <Link href="/" aria-label="PranaVeda home" className="w-fit"><Logo /></Link>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-center">
          {links.map((link) => <Link key={link.href} href={link.href} className="text-xs font-medium text-body transition-colors hover:text-primary-700">{link.label}</Link>)}
        </nav>
        <p className="text-[11px] text-muted sm:whitespace-nowrap">© <CopyrightYear /> PranaVeda · General wellness, not medical advice.</p>
      </div>
    </footer>
  );
}
