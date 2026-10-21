"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3, BookOpen, CalendarDays, ChevronDown, ClipboardList,
  CloudUpload, FileMusic, Flower2, HelpCircle, History, Home, Layers, Leaf, LogOut, Menu,
  Settings, Sparkles, Trophy, User, Video, Wind, X, Bell,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { LotusMark } from "@/components/brand/LotusMark";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/history", label: "Sessions", icon: CalendarDays },
  { href: "/dashboard/routines", label: "Routines", icon: Flower2 },
  { href: "/dashboard/challenges", label: "Challenges", icon: Trophy },
  { href: "/dashboard/wellness", label: "Wellness", icon: Leaf },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/breathing", label: "Breathing", icon: Wind },
  { href: "/yoga", label: "Yoga Asanas", icon: User },
  { href: "/videos", label: "Yoga Videos", icon: Video },
  { href: "/calm-music", label: "Library", icon: BookOpen },
  { href: "/ai/history", label: "History", icon: History },
  { href: "/dashboard/saved", label: "Saved", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/** Admin-only nav links, shown when the user has role ADMIN. */
const ADMIN_NAV = [
  { href: "/admin/content", label: "Content Studio", icon: Layers },
  { href: "/admin/audio", label: "Audio Studio", icon: FileMusic },
  { href: "/admin/media", label: "Media Studio", icon: CloudUpload },
  { href: "/admin/categories", label: "Categories & Tags", icon: ClipboardList },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
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
    <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-b from-primary-50/80 to-primary-100/50 p-4">
      <LotusMark className="size-8 text-primary-300" />
      <p className="mt-2 text-sm leading-relaxed text-body">
        &ldquo;{quote ?? "Good music soothes the mind, heals the heart."}&rdquo;
      </p>
      <span className="mt-2 block h-0.5 w-6 rounded bg-primary-300" aria-hidden="true" />
      <LotusMark className="pointer-events-none absolute -right-8 -bottom-10 size-36 text-primary-200/50" />
    </div>
  );
}

/** App shell: rail sidebar on desktop, drawer + bottom tabs on mobile. */
export function AppShell({ children, quote }: { children: React.ReactNode; quote?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  // Fall back to the email, never to a fake role label: a USER account must not
  // appear to be an "Administrator" just because it has no display name.
  const displayName = user?.displayName?.trim() || user?.email || "Account";
  const isAdmin = user?.role === "ADMIN";
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
        <nav aria-label="Primary" className="scrollbar-none mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} onNavigate={() => setDrawerOpen(false)} />))}
          {isAdmin ? (<><div className="mx-3.5 my-2 border-t border-border-soft" /><p className="px-3.5 pb-1 text-[11px] font-semibold tracking-widest text-muted uppercase">Admin</p>{ADMIN_NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} onNavigate={() => setDrawerOpen(false)} />))}</>) : null}
        </nav>
        <div className="shrink-0 px-3"><QuoteCard quote={quote} /></div>
      </aside>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border-soft bg-surface/70 px-4 py-5 lg:flex">
        <Link href="/" className="rounded-lg px-2" aria-label="PranaVeda home"><Logo /></Link>
        <nav aria-label="Primary" className="scrollbar-none mt-6 flex-1 space-y-1 overflow-y-auto">
          {NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} />))}
          {isAdmin ? (<><div className="mx-3.5 my-2 border-t border-border-soft" /><p className="px-3.5 pb-1 text-[11px] font-semibold tracking-widest text-muted uppercase">Admin</p>{ADMIN_NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} />))}</>) : null}
        </nav>
        <QuoteCard quote={quote} />
      </aside>
      <AppMain pathname={pathname} displayName={displayName} onMenu={() => setDrawerOpen(true)}>
        {children}
      </AppMain>
    </div>
  );
}


function AppMain({ pathname, displayName, onMenu, children }: { pathname: string; displayName: string; onMenu: () => void; children: React.ReactNode }) {
  const { status, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-border-soft/70 bg-surface/85 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          <div className="flex items-center gap-1">
            <button type="button" onClick={onMenu} className="inline-flex size-11 items-center justify-center rounded-full text-body transition-colors hover:bg-primary-50 lg:hidden" aria-controls="mobile-drawer" aria-label="Open navigation"><Menu className="size-5" aria-hidden="true" /></button>
            <Link href="/" className="rounded-lg p-1.5 lg:hidden" aria-label="PranaVeda home"><Logo markOnly /></Link>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Bell — visual only for now; no notification backend exists yet. */}
            <button
              type="button"
              aria-label="Notifications (none yet)"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-body transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span className="absolute top-2 right-2.5 size-1.5 rounded-full bg-primary-500" aria-hidden="true" />
            </button>
            <span className="hidden h-6 w-px bg-border-soft sm:block" aria-hidden="true" />
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Account: ${displayName}`}
                className="inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-primary-50"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700"><User className="size-4" aria-hidden="true" /></span>
                <span className="hidden max-w-28 truncate text-sm font-medium text-body sm:inline">{displayName}</span>
                <ChevronDown className={cn("hidden size-4 text-muted transition-transform sm:inline", menuOpen && "rotate-180")} aria-hidden="true" />
              </button>
              {menuOpen ? (
                <div role="menu" className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-border-soft bg-surface py-1.5 shadow-[0_20px_50px_-20px_rgba(23,137,199,0.5)]">
                  {/* Screenshot-style header: avatar + name + email + role pill */}
                  <div className="flex items-center gap-3 px-4 pt-2 pb-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      <User className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-heading">{displayName}</p>
                      <p className="truncate text-xs text-muted">{user?.email ?? "—"}</p>
                      <span className="mt-1 inline-flex rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                        {user?.role === "ADMIN" ? "Administrator" : "Member"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border-soft" aria-hidden="true" />
                  <Link href="/dashboard/wellness" role="menuitem" onClick={() => setMenuOpen(false)} className="mt-1 flex items-center gap-2.5 px-4 py-2.5 text-sm text-body transition-colors hover:bg-primary-50 hover:text-heading">
                    <User className="size-4" aria-hidden="true" /> Profile
                  </Link>
                  <Link href="/dashboard/settings" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-body transition-colors hover:bg-primary-50 hover:text-heading">
                    <Settings className="size-4" aria-hidden="true" /> Settings
                  </Link>
                  <Link href="/safety" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-body transition-colors hover:bg-primary-50 hover:text-heading">
                    <HelpCircle className="size-4" aria-hidden="true" /> Help &amp; Support
                  </Link>
                  <div className="border-t border-border-soft" aria-hidden="true" />
                  {status === "authenticated" ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); void logout(); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-body transition-colors hover:bg-primary-50 hover:text-heading"
                    >
                      <LogOut className="size-4" aria-hidden="true" /> Log Out
                    </button>
                  ) : (
                    <Link href="/login" role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-body transition-colors hover:bg-primary-50 hover:text-heading">
                      <User className="size-4" aria-hidden="true" /> Sign in
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <main className="min-w-0 flex-1 px-3 pt-4 pb-24 sm:px-6 sm:py-6 lg:pb-10">{children}</main>
      {/* Bottom tab bar — phones only, pill-shaped like the mobile app. */}
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-[3px] z-40 lg:hidden">
        <div className="mx-auto max-w-md w-full rounded-[1.5rem] border border-border-soft bg-white backdrop-blur-md shadow-lg p-2.5">
          <ul className="flex justify-around items-center">
            {TABS.map(({ href, label, Icon }) => {
              const active = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 min-h-[44px] px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors",
                      active ? "bg-primary-100 text-primary-600" : "text-muted hover:text-primary-600",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        active ? "text-primary-600" : "text-muted",
                      )}
                      aria-hidden="true"
                    />
                    <span className={cn("text-[11px] font-medium", active ? "text-primary-600" : "text-muted")}>
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
