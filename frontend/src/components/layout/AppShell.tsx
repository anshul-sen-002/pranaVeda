"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen, CalendarDays, ChevronDown, ClipboardList,
  Home, Leaf, ListMusic, Menu, Settings, Sparkles, Trophy, User, Wind, X,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { LotusMark } from "@/components/brand/LotusMark";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/history", label: "Sessions", icon: CalendarDays },
  { href: "/dashboard/routines", label: "Routines", icon: ListMusic },
  { href: "/dashboard/challenges", label: "Challenges", icon: Trophy },
  { href: "/dashboard/wellness", label: "Wellness", icon: Leaf },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/breathing", label: "Breathing", icon: Wind },
  { href: "/yoga", label: "Yoga Asanas", icon: User },
  { href: "/calm-music", label: "Library", icon: BookOpen },
  { href: "/dashboard/saved", label: "Saved", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/** Bottom tab bar on phones: 5 compact destinations, 44px targets. */
const TABS = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/yoga", label: "Yoga", Icon: User },
  { href: "/breathing", label: "Breathe", Icon: Wind },
  { href: "/calm-music", label: "Music", Icon: BookOpen },
  { href: "/ai", label: "AI", Icon: Sparkles },
];

function NavLink({ href, label, Icon, active, onNavigate }: { href: string; label: string; Icon: typeof Home; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors",
        active ? "bg-primary-100/70 text-primary-700" : "text-body hover:bg-primary-50 hover:text-heading",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
function QuoteCard({ quote }: { quote?: string }) {
  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-border-soft bg-primary-50/60 p-4">
      <LotusMark className="size-8 text-primary-300" />
      <p className="mt-2 text-sm leading-relaxed text-body">
        &ldquo;{quote ?? "Good music soothes the mind, heals the heart."}&rdquo;
      </p>
      <LotusMark className="pointer-events-none absolute -right-8 -bottom-10 size-36 text-primary-200/50" />
    </div>
  );
}

/** App shell: rail sidebar on desktop, drawer + bottom tabs on mobile. */
export function AppShell({ children, quote }: { children: React.ReactNode; quote?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.displayName?.trim() || "Administrator";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh bg-surface-tint">
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 bg-[#223240]/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      ) : null}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="App navigation"
        className={cn("fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[85vw] shrink-0 flex-col border-r border-border-soft bg-surface pb-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden", drawerOpen ? "translate-x-0" : "-translate-x-full")}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-4">
          <Link href="/" className="rounded-lg px-1" aria-label="PranaVeda home" onClick={() => setDrawerOpen(false)}><Logo /></Link>
          <button type="button" onClick={() => setDrawerOpen(false)} className="inline-flex size-11 items-center justify-center rounded-full text-body hover:bg-primary-50" aria-label="Close menu"><X className="size-5" aria-hidden="true" /></button>
        </div>
        <nav aria-label="Primary" className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} onNavigate={() => setDrawerOpen(false)} />))}
        </nav>
        <div className="shrink-0 px-3"><QuoteCard quote={quote} /></div>
      </aside>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border-soft bg-surface/70 px-4 py-5 lg:flex">
        <Link href="/" className="rounded-lg px-2" aria-label="PranaVeda home"><Logo /></Link>
        <nav aria-label="Primary" className="mt-6 flex-1 space-y-1 overflow-y-auto">{NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} />))}</nav>
        <QuoteCard quote={quote} />
      </aside>
      <AppMain pathname={pathname} displayName={displayName} onMenu={() => setDrawerOpen(true)}>
        {children}
      </AppMain>
    </div>
  );
}


function AppMain({ pathname, displayName, onMenu, children }: { pathname: string; displayName: string; onMenu: () => void; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-border-soft/70 bg-surface/85 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          <div className="flex items-center gap-1">
            <button type="button" onClick={onMenu} className="inline-flex size-11 items-center justify-center rounded-full text-body transition-colors hover:bg-primary-50 lg:hidden" aria-controls="mobile-drawer" aria-label="Open navigation"><Menu className="size-5" aria-hidden="true" /></button>
            <Link href="/" className="rounded-lg p-1.5 lg:hidden" aria-label="PranaVeda home"><Logo markOnly /></Link>
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <span className="hidden h-6 w-px bg-border-soft sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-1" aria-label={`Account: ${displayName}`}><span className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700"><User className="size-4" aria-hidden="true" /></span><span className="hidden max-w-28 truncate text-sm font-medium text-body sm:inline">{displayName}</span></span>
          </div>
        </div>
      </header>
      <main className="min-w-0 flex-1 px-3 pt-4 pb-24 sm:px-6 sm:py-6 lg:pb-10">{children}</main>
      {/* Bottom tab bar — phones only, accounts for the mini-player above it. */}
      <nav aria-label="Quick navigation" className="safe-area-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface/95 pt-1.5 backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 px-2">
          {TABS.map(({ href, label, Icon }) => {
            const active = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors",
                    active ? "text-primary-700" : "text-muted",
                  )}
                >
                  <Icon className={cn("size-5", active && "scale-110")} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
