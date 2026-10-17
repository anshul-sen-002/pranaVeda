"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BookOpen, CalendarDays, ChevronDown, ClipboardList,
  Home, Leaf, ListMusic, Settings, Sparkles, Trophy, User,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { LotusMark } from "@/components/brand/LotusMark";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/history", label: "Sessions", icon: CalendarDays },
  { href: "/dashboard/routines", label: "Routines", icon: ListMusic },
  { href: "/dashboard/challenges", label: "Challenges", icon: Trophy },
  { href: "/dashboard/wellness", label: "Wellness", icon: Leaf },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/yoga", label: "Yoga Asanas", icon: User },
  { href: "/calm-music", label: "Library", icon: BookOpen },
  { href: "/dashboard/saved", label: "Saved", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavLink({ href, label, Icon, active }: { href: string; label: string; Icon: typeof Home; active: boolean }) {
  return (
    <Link
      href={href}
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

/** App shell matching the mockups: sidebar + topbar + tinted content. */
export function AppShell({ children, quote }: { children: React.ReactNode; quote?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const displayName = user?.displayName?.trim() || "Administrator";
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="flex min-h-dvh bg-surface-tint">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border-soft bg-surface/70 px-4 py-5 lg:flex">
        <Link href="/" className="rounded-lg px-2" aria-label="PranaVeda home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} />
          ))}
        </nav>
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border-soft bg-primary-50/60 p-4">
          <LotusMark className="size-8 text-primary-300" />
          <p className="mt-2 text-sm leading-relaxed text-body">
            &ldquo;{quote ?? "Good music soothes the mind, heals the heart."}&rdquo;
          </p>
          <LotusMark className="pointer-events-none absolute -right-8 -bottom-10 size-36 text-primary-200/50" />
        </div>
      </aside>
      <AppMain pathname={pathname} displayName={displayName}>
        {children}
      </AppMain>
    </div>
  );
}

function AppMain({ pathname, displayName, children }: { pathname: string; displayName: string; children: React.ReactNode }) {
  const strip = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/yoga", label: "Asanas" },
    { href: "/calm-music", label: "Library" },
    { href: "/dashboard/routines", label: "Routines" },
    { href: "/dashboard/challenges", label: "Challenges" },
  ];
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-border-soft/70 bg-surface/85 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-lg lg:hidden" aria-label="PranaVeda home">
            <Logo markOnly />
          </Link>
          <div className="hidden lg:block" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-body transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-primary-500" aria-hidden="true" />
            </button>
            <span className="hidden h-6 w-px bg-border-soft sm:block" aria-hidden="true" />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-primary-50"
              aria-label={`Account: ${displayName}`}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <User className="size-4.5" aria-hidden="true" />
              </span>
              <span className="hidden text-sm font-medium text-body sm:inline">{displayName}</span>
              <ChevronDown className="hidden size-4 text-muted sm:inline" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav aria-label="Primary" className="border-t border-border-soft/60 lg:hidden">
          <ul className="scrollbar-none flex items-center gap-1 overflow-x-auto px-3 py-2">
            {strip.map((item) => (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full px-3 text-sm font-medium",
                    pathname === item.href ? "bg-primary-100/70 text-primary-700" : "text-body",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}