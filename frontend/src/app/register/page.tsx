import type { Metadata } from "next";

import { RegisterView } from "@/components/auth/RegisterView";

export const metadata: Metadata = {
  title: "Create account | PranaVeda",
  description: "Create a free PranaVeda account to save routines, track streaks, and more.",
};

/**
 * Server Component so `metadata` stays exportable.
 * Session logic lives in <RegisterView>.
 */
export default function RegisterPage() {
  return <RegisterView />;
}
