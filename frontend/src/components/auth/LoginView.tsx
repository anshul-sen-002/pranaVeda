"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCheckingScreen } from "@/components/auth/AuthCheckingScreen";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

/**
 * Client counterpart of app/login/page.tsx.
 *
 * This is the "check the token in the background" behaviour:
 *  1. status is "loading"  -> a calm checking screen, so the form never flashes
 *  2. status is "authenticated" -> the token is valid, so leave for /dashboard
 *  3. status is "anonymous" -> no valid token, so stay here and show the form
 */
export function LoginView() {
  const { status } = useAuth();

  if (status === "loading") return <AuthCheckingScreen />;

  return (
    <AuthLayout>
      <AuthRedirect when="authenticated" to="/dashboard">
        <LoginForm />
      </AuthRedirect>
    </AuthLayout>
  );
}
