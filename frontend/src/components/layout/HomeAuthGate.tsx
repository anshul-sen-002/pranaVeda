"use client";

import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

/** Covers the landing page until the server validates the refresh cookie. */
export function HomeAuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  return (
    <>
      {children}
      <AnimatePresence>
        {status === "loading" ? (
          <LoadingOverlay
            key="session-check"
            title="Checking your space"
            description="We’re confirming your session so we can open the right home view."
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
