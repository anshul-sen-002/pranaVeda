"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen, CalendarDays, ChevronDown, ClipboardList,
  FileMusic, Flower2, HelpCircle, Home, Layers, Leaf, LogOut, Menu,
  Search, Settings, Sparkles, User, Video, Wind, X,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileBackButton } from "@/components/layout/MobileBackButton";


const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/history", label: "Sessions", icon: CalendarDays },
  { href: "/dashboard/routines", label: "Routines", icon: Flower2 },
  { href: "/dashboard/wellness", label: "Wellness", icon: Leaf },
  { href: "/ai", label: "AI Assistant", icon: Sparkles },
  { href: "/breathing", label: "Breathing", icon: Wind },
  { href: "/yoga", label: "Yoga Asanas", icon: User },
  { href: "/videos", label: "Yoga Videos", icon: Video },
  { href: "/calm-music", label: "Library", icon: BookOpen },
];

/** Admin-only nav links, shown when the user has role ADMIN. */
const ADMIN_NAV = [
  { href: "/admin/content", label: "Content Studio", icon: Layers },
  { href: "/admin/audio", label: "Audio Studio", icon: FileMusic },
  { href: "/admin/categories", label: "Categories & Tags", icon: ClipboardList },
];

function NavLink({ href, label, Icon, active, onNavigate }: { href: string; label: string; Icon: typeof Home; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
        // Active item: soft light-green fill + deeper green text (mockup).
        active
          ? "rounded-l-md border-l-[3px] border-primary-600 bg-[#eaf1e5] pl-[9px] text-primary-800"
          : "text-body hover:bg-primary-50/60 hover:text-heading",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}
/** App shell: rail sidebar on desktop, drawer + bottom tabs on mobile. */
export function AppShell({ children }: { children: React.ReactNode; quote?: string }) {
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
    <div className="flex min-h-dvh bg-[#f7f8f4]">
      {drawerOpen ? (
        <div className="fixed inset-0 z-[55] bg-[#223240]/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      ) : null}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="App navigation"
        className={cn("fixed inset-y-0 left-0 z-[60] flex w-[17rem] max-w-[88vw] shrink-0 flex-col border-r border-border-soft bg-[#fbfcf8] pb-4 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden", drawerOpen ? "translate-x-0" : "-translate-x-full")}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-4">
          <Link href="/" className="rounded-lg px-1" aria-label="PranaVeda home" onClick={() => setDrawerOpen(false)}><Logo markOnly /></Link>
          <button type="button" onClick={() => setDrawerOpen(false)} className="inline-flex size-11 items-center justify-center rounded-full text-body hover:bg-primary-50" aria-label="Close menu"><X className="size-5" aria-hidden="true" /></button>
        </div>
        <nav aria-label="Primary" className="scrollbar-none mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} onNavigate={() => setDrawerOpen(false)} />))}
          {isAdmin ? (<><div className="mx-3.5 my-2 border-t border-border-soft" /><p className="px-3.5 pb-1 text-[11px] font-semibold tracking-widest text-muted uppercase">Admin</p>{ADMIN_NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} onNavigate={() => setDrawerOpen(false)} />))}</>) : null}
        </nav>
      </aside>
      <aside className="sticky top-0 hidden h-dvh w-[13.5rem] shrink-0 flex-col border-r border-[#e6eadd] bg-[#fbfcf8] px-3.5 pt-5 pb-5 lg:flex xl:w-56 xl:px-4">
        {/* Brand sits at the very top of the rail (mockup). */}
        <Link href="/" className="shrink-0 rounded-lg px-2" aria-label="PranaVeda home"><Logo /></Link>
        <nav aria-label="Primary" className="scrollbar-none mt-6 flex-1 space-y-1 overflow-y-auto">
          {NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} />))}
          {isAdmin ? (<><div className="mx-3.5 my-2 border-t border-border-soft" /><p className="px-3.5 pb-1 text-[11px] font-semibold tracking-widest text-muted uppercase">Admin</p>{ADMIN_NAV.map((item) => (<NavLink key={item.label} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} />))}</>) : null}
        </nav>
      </aside>
      <AppMain pathname={pathname} displayName={displayName} isAdmin={isAdmin} onMenu={() => setDrawerOpen(true)}>
        {children}
      </AppMain>
      <BottomNav />
    </div>
  );
}


function AppMain({ pathname, displayName, isAdmin, onMenu, children }: { pathname: string; displayName: string; isAdmin: boolean; onMenu: () => void; children: React.ReactNode }) {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const roleLabel = isAdmin ? "Administrator" : "Member";
  const pageTitle = routeTitle(pathname);
  const rootTitle = pathname.startsWith("/admin") ? "Admin" : pathname.startsWith("/dashboard") ? "Dashboard" : "Explore";
  const focusedMobilePage = pathname !== "/dashboard" && !pathname.startsWith("/admin");
  const aiPage = pathname === "/ai";
  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/yoga?q=${encodeURIComponent(q)}`);
  };

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
      <header className={cn("sticky top-0 z-30 border-b border-[#e6eadd]/90 bg-[#fbfcf8]/90 shadow-[0_4px_24px_-20px_rgba(24,52,37,.35)] backdrop-blur-xl", focusedMobilePage && "hidden sm:block")}>
        <div className="flex h-[4.25rem] items-center justify-between gap-2 px-3 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-1">
            <button type="button" onClick={onMenu} className="inline-flex size-11 items-center justify-center rounded-2xl text-primary-900 transition-colors hover:bg-primary-50 active:scale-95 lg:hidden" aria-controls="mobile-drawer" aria-label="Open navigation"><Menu className="size-[1.35rem]" aria-hidden="true" /></button>
            <div className="min-w-0 pl-1 lg:hidden">
              <p className="truncate text-[15px] font-semibold leading-5 tracking-[-.02em] text-heading">{pageTitle}</p>
              <p className="text-xs leading-4 text-[#78958a]">PranaVeda</p>
            </div>
          </div>
          
          <form onSubmit={search} role="search" className="hidden min-w-0 max-w-md flex-1 lg:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search poses, areas, or difficulty..." aria-label="Search yoga library" className="h-10 w-full rounded-full border border-[#e5e9df] bg-white/90 pr-4 pl-10 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
            </label>
          </form>

          <div className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
            <span className="text-muted">{rootTitle}</span><ChevronDown className="size-4 -rotate-90 text-muted" aria-hidden="true" />
            <span className="truncate font-medium text-primary-800" aria-current="page">{pageTitle}</span>
          </div>

          <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Account: ${displayName}`}
                className={cn("group inline-flex max-w-[45vw] items-center gap-2 rounded-full border border-transparent p-1 transition-all duration-200 hover:border-[#dce8df] hover:bg-white/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 sm:max-w-none", menuOpen && "border-[#dce8df] bg-white shadow-sm")}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#e5f0e8] to-[#cfe5d8] text-primary-800 ring-1 ring-white transition-transform group-hover:scale-[1.03]"><User className="size-[1.1rem]" aria-hidden="true" /></span>
                <span className="hidden min-w-0 pr-1 text-left sm:block"><span className="block max-w-36 truncate text-sm font-semibold leading-4 text-heading">{isAdmin ? "Administrator" : displayName}</span><span className="mt-0.5 block max-w-36 truncate text-[11px] leading-3 text-muted">{isAdmin ? displayName : "Your account"}</span></span>
                {/* Role chip — the mockup shows "Administrator" next to the name. */}
                <span className="hidden items-center gap-1.5 lg:inline-flex">
                </span>
                <ChevronDown className={cn("mr-1 hidden size-4 text-muted transition-transform duration-200 sm:inline", menuOpen && "rotate-180")} aria-hidden="true" />
              </button>
              <AnimatePresence>
              {menuOpen ? (
                <motion.div role="menu" initial={{ opacity: 0, y: -7, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.98 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 z-40 mt-2.5 w-[min(19rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-[1.35rem] border border-[#e1e9df] bg-[#fcfdf9]/95 p-1.5 shadow-[0_22px_60px_-24px_rgba(24,52,37,.4)] backdrop-blur-2xl">
                  {/* Screenshot-style header: avatar + name + email + role pill */}
                  <div className="m-1 flex items-center gap-3 rounded-2xl bg-gradient-gourd-white p-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-primary-700 shadow-sm ring-1 ring-white">
                      <User className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-heading">{isAdmin ? "Administrator" : displayName}</p>
                      <p className="truncate text-xs text-muted">{user?.email ?? "—"}</p>
                      <span className="mt-1 inline-flex rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-800 ring-1 ring-primary-100">
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                  <div className="mx-2 my-1 border-t border-[#e9eee7]" aria-hidden="true" />
                  <Link href="/dashboard/wellness" role="menuitem" onClick={() => setMenuOpen(false)} className="mx-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-body transition-colors hover:bg-white hover:text-heading">
                    <User className="size-4" aria-hidden="true" /> Profile
                  </Link>
                  <Link href="/dashboard/settings" role="menuitem" onClick={() => setMenuOpen(false)} className="mx-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-body transition-colors hover:bg-white hover:text-heading">
                    <Settings className="size-4" aria-hidden="true" /> Settings
                  </Link>
                  <Link href="/safety" role="menuitem" onClick={() => setMenuOpen(false)} className="mx-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-body transition-colors hover:bg-white hover:text-heading">
                    <HelpCircle className="size-4" aria-hidden="true" /> Help &amp; Support
                  </Link>
                  <div className="mx-2 my-1 border-t border-[#e9eee7]" aria-hidden="true" />
                  {status === "authenticated" ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); void logout(); }}
                      className="mx-1 flex min-h-11 w-[calc(100%-0.5rem)] items-center gap-3 rounded-xl px-3 text-left text-sm text-[#a34e45] transition-colors hover:bg-[#fff2ef]"
                    >
                      <LogOut className="size-4" aria-hidden="true" /> Log Out
                    </button>
                  ) : (
                    <Link href="/login" role="menuitem" onClick={() => setMenuOpen(false)} className="mx-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-body transition-colors hover:bg-white hover:text-heading">
                      <User className="size-4" aria-hidden="true" /> Sign in
                    </Link>
                  )}
                </motion.div>
              ) : null}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className={cn("min-w-0 flex-1", focusedMobilePage
          ? "relative flex h-[100dvh] min-h-0 flex-col overflow-hidden p-0 sm:h-auto sm:overflow-y-auto sm:px-6 sm:py-6 sm:pb-6 lg:px-8 lg:pb-8"
          : "overflow-y-auto px-3 py-4 pb-20 sm:px-6 sm:py-6 sm:pb-6 lg:px-8 lg:pb-8")}>
          {focusedMobilePage && !aiPage ? (
            <MobileBackButton label={`Go back from ${pageTitle}`} className="absolute top-[max(.5rem,env(safe-area-inset-top))] left-2 z-30 sm:hidden" />
          ) : null}
          {focusedMobilePage && !aiPage ? <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 pt-14 pb-[max(1rem,env(safe-area-inset-bottom))] sm:contents">{children}</div> : children}
        </main>
      </div>
  );
}

function routeTitle(pathname: string) {
  const titles: Record<string, string> = {
    "/dashboard": "Overview", "/dashboard/history": "Sessions", "/dashboard/routines": "Routines",
    "/dashboard/wellness": "Wellness", "/dashboard/saved": "Saved library",
    "/dashboard/settings": "Settings", "/yoga": "Yoga Asanas", "/videos": "Yoga Videos",
    "/calm-music": "Calm Music", "/breathing": "Breathing", "/ai": "AI Assistant",
    "/ai/history": "AI History", "/admin/content": "Content Studio", "/admin/audio": "Audio Studio",
    "/admin/categories": "Categories & Tags",
  };
  const detail = pathname.match(/^\/(?:yoga|calm-music)\/([^/]+)/);
  if (detail) return decodeURIComponent(detail[1]).replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (pathname.startsWith("/dashboard/routines/")) return "Routine details";
  if (pathname.startsWith("/admin/content/")) return "Content steps";
  return titles[pathname] ?? "PranaVeda";
}
