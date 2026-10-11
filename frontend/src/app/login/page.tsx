import type { Metadata } from "next";

import { LoginView } from "@/components/auth/LoginView";

export const metadata: Metadata = {
  title: "Sign in | PranaVeda",
  description: "Sign in to your PranaVeda account to continue your wellness journey.",
};

/**
 * Server Component so `metadata` stays exportable (a Client Component cannot
 * export it). All session logic lives in <LoginView>.
 */
export default function LoginPage() {
  return <LoginView />;
}

