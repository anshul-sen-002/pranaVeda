"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Flower2, Home, LogIn, LogOut, Menu, Music2, UserPlus, Video, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { LinkButton } from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

/**
 * Sticky public header.
 *
 * It reacts to the resolved auth state, not a guess:
 *  - authenticated -> Dashboard, with sign out in the mobile menu
 *  - anonymous     -> Sign in + Get started
 *
 * While "loading" we render the anonymous actions immediately rather than a
 * blank bar, so the header never feels broken on first paint.
 *
 * Mobile (<md): the links collapse behind a menu button. The panel is a real
 * <nav>, traps nothing, closes on Escape/link tap, and every row meets the
 * 44px touch target. Desktop keeps the inline links unchanged.
 */
export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on Escape; lock body scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const signedIn = status === "authenticated";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "sticky top-0 z-40 w-full transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-border-soft bg-[#fbfbf7]/95 backdrop-blur-xl"
          : "border-b border-border-soft/50 bg-[#fbfbf7]/80 backdrop-blur-lg",
      ].join(" ")}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-10"
      >
        <Link href="/" className="rounded-lg" aria-label="PranaVeda home" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <HeaderLink href="/videos">Videos</HeaderLink>
          <HeaderLink href="/calm-music">Audio</HeaderLink>
          <HeaderLink href="/yoga">Guided yoga asanas</HeaderLink>
        </div>

        <div className="flex items-center gap-2.5">
          {signedIn ? (
            <>
              <span className="hidden max-w-32 truncate text-sm text-body sm:inline" title={user?.email ?? ""}>
                {user?.displayName?.trim()}
              </span>
              <LinkButton href="/dashboard" size="sm" className="hidden sm:inline-flex">
                Dashboard
              </LinkButton>
              <Button size="sm" variant="secondary" onClick={() => void logout()} className="hidden md:inline-flex">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <LinkButton href="/login" size="sm" variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </LinkButton>
              <LinkButton href="/register" size="sm" className="hidden sm:inline-flex">
                Get started
              </LinkButton>
            </>
          )}

          {/* Mobile menu button: 44px target, labelled state */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex !h-11 !min-w-11 !px-0 md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={menuOpen ? "close" : "menu"} initial={{ opacity: 0, rotate: -35, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 35, scale: 0.8 }} transition={{ duration: 0.16 }} className="flex">
                {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      {/* Mobile panel */}
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.985 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-3 left-3 z-50 mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-3xl border border-[#e2e9df] bg-[#fbfcf8]/[.98] p-3 shadow-[0_24px_70px_-28px_rgba(24,52,37,.35)] backdrop-blur-2xl md:hidden sm:left-auto sm:right-6 sm:w-[22rem]"
          >
            {signedIn ? (
              <div className="mb-2 flex items-center gap-3 rounded-2xl bg-gradient-gourd-white p-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-800"><Home className="size-5" aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-heading">{user?.displayName?.trim() || "Your account"}</span><span className="block truncate text-xs text-muted">{user?.email}</span></span>
              </div>
            ) : (
              <div className="mb-2 rounded-2xl bg-gradient-gourd-white px-4 py-3.5"><p className="text-sm font-semibold text-heading">Find your moment of calm</p><p className="mt-0.5 text-xs text-muted">Explore at your own pace, with or without an account.</p></div>
            )}
            <ul className="space-y-1">
              {[
                { href: "/videos", label: "Videos", Icon: Video },
                { href: "/calm-music", label: "Audio", Icon: Music2 },
                { href: "/yoga", label: "Guided yoga asanas", Icon: Flower2 },
                ...(signedIn ? [{ href: "/dashboard", label: "Dashboard", Icon: Home }] : [
                  { href: "/login", label: "Sign in", Icon: LogIn },
                  { href: "/register", label: "Create account", Icon: UserPlus },
                ]),
              ].map((item, index) => (
                <motion.li key={item.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18, delay: index * 0.025 }}>
                  <Link href={item.href} onClick={() => setMenuOpen(false)} className="group flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-body transition-colors hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary-700 shadow-sm transition-colors group-hover:bg-primary-100"><item.Icon className="size-4" aria-hidden="true" /></span>
                    <span className="flex-1">{item.label}</span>
                    <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-700" aria-hidden="true" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            {signedIn ? (
              <div className="mt-2 border-t border-border-soft pt-2">
                <button type="button" onClick={() => { setMenuOpen(false); void logout(); }} className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium text-body transition-colors hover:bg-danger/5 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-white text-muted shadow-sm"><LogOut className="size-4" aria-hidden="true" /></span>
                  Sign out
                </button>
              </div>
            ) : null}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative text-sm font-medium text-body transition-colors hover:text-primary-700"
    >
      {children}
    </a>
  );
}




