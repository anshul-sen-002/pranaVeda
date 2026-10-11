import { Logo } from "@/components/brand/Logo";
import { CopyrightYear } from "@/components/layout/CopyrightYear";

const columns = [
  {
    heading: "Explore",
    links: [
      { label: "Yoga library", href: "/yoga" },
      { label: "Calm music", href: "/calm-music" },
      { label: "Breathing", href: "/breathing" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

/** Public footer. Server Component - it needs no session state. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-body">
              A calm, accessible space for yoga, mindfulness, and holistic
              wellness.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-sm font-semibold text-heading">{column.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-body underline-offset-4 transition-colors hover:text-primary-700 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Required wellness disclaimer (agents.md 1 / 2.4). */}
        <p className="mt-10 border-t border-border-soft pt-6 text-xs leading-relaxed text-muted">
          PranaVeda offers general yoga and wellness information only. It is not
          medical advice and cannot diagnose or treat any condition. Always
          listen to your body, stop if something hurts, and consult a qualified
          healthcare professional for medical concerns.
        </p>

        <p className="mt-4 text-xs text-muted">
          &copy; <CopyrightYear /> PranaVeda. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
