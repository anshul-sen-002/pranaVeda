"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

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
 */
export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signedIn = status === "authenticated";

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled
          ? "border-b border-border-soft bg-surface/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" className="rounded-lg" aria-label="PranaVeda home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <HeaderLink href="/yoga">Yoga</HeaderLink>
          <HeaderLink href="/calm-music">Calm Music</HeaderLink>
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
              <LinkButton href="/login" size="sm" variant="ghost">
                Sign in
              </LinkButton>
              <LinkButton href="/register" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>
      </nav>
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
