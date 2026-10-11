"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { LogIn, Mail } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { loginSchema, type LoginValues } from "@/lib/validation/authSchemas";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  // Where to go after signing in. agents.md 2.2: return the user to the page
  // they originally wanted. Defaults to the dashboard.
  const redirectTo = searchParams.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await login({ email: values.email, password: values.password });
      // `replace` so Back does not bounce through the login page again.
      router.replace(redirectTo);
    } catch (error) {
      if (error instanceof ApiError) {
        // The backend returns one generic message for both "unknown email" and
        // "wrong password", so we show it verbatim and never leak which it was.
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please check your connection and try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-body">
          Sign in to continue your wellness journey.
        </p>
      </motion.header>

      {/* Form-level errors are announced here rather than next to a field. */}
      <div aria-live="polite" className="mt-6">
        {formError ? <Alert tone="error">{formError}</Alert> : null}
      </div>

      <div className="mt-6 space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="size-4.5" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? null : <LogIn className="size-4" aria-hidden="true" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </div>

      <p className="mt-7 text-center text-sm text-body">
        New to PranaVeda?{" "}
        <Link
          href="/register"
          className="font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
