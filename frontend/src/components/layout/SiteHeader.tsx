"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { LinkButton } from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

/**
 * Sticky public header.
 *
 * It reacts to the resolved auth state, not a guess:
 *  - authenticated -> Dashboard + Sign out
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
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-border-soft bg-surface/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" className="rounded-lg" aria-label="PranaVeda home" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <HeaderLink href="/yoga">Yoga</HeaderLink>
          <HeaderLink href="/calm-music">Calm Music</HeaderLink>
          <HeaderLink href="/breathing">Breathing</HeaderLink>
          <HeaderLink href="/about">About</HeaderLink>
        </div>

        <div className="flex items-center gap-2.5">
          {signedIn ? (
            <>
              <span className="hidden max-w-32 truncate text-sm text-body sm:inline" title={user?.email ?? ""}>
                {user?.displayName?.trim() || user?.email}
              </span>
              <LinkButton href="/dashboard" size="sm" className="hidden sm:inline-flex">
                Dashboard
              </LinkButton>
              <Button size="sm" variant="secondary" onClick={() => void logout()}>
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
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </Button>
        </div>
      </nav>

      {/* Mobile panel */}
      {menuOpen ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border-soft bg-surface/95 backdrop-blur-md md:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-5 py-4 sm:px-8">
            {[
              { href: "/yoga", label: "Yoga" },
              { href: "/calm-music", label: "Calm Music" },
              { href: "/breathing", label: "Breathing" },
              { href: "/about", label: "About" },
              ...(signedIn
                ? [{ href: "/dashboard", label: "Dashboard" }]
                : [
                    { href: "/login", label: "Sign in" },
                    { href: "/register", label: "Get started" },
                  ]),
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium text-heading transition-colors hover:bg-primary-50 active:bg-primary-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {signedIn ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                  className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-[15px] font-medium text-heading transition-colors hover:bg-primary-50 active:bg-primary-100"
                >
                  Sign out
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      ) : null}
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
