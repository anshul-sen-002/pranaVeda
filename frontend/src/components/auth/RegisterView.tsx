"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

/**
 * Same three-state contract as <LoginView>.
 * `redirectTo` lets a protected page send the visitor here with
 * ?next=/dashboard/saved so registration returns them to where they were going.
 */
export function RegisterView({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const { status } = useAuth();

  if (status === "loading") return null;

  return (
    <AuthLayout>
      <AuthRedirect when="authenticated" to={redirectTo}>
        <RegisterForm />
      </AuthRedirect>
    </AuthLayout>
  );
}
