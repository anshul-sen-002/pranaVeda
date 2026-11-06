"use client";

import type { ReactNode } from "react";

/** AuthProvider still validates the refresh cookie in the background. */
export function HomeAuthGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
