"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowRight, Lock, Mail } from "lucide-react";
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
  const [remember, setRemember] = useState(false);

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
      <div className="flex flex-col gap-5 sm:gap-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-heading sm:text-[30px]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Continue your wellness journey
          </p>
        </motion.header>

        {/* Form-level errors are announced here rather than next to a field. */}
        <div aria-live="polite">
          {formError ? <Alert tone="error">{formError}</Alert> : null}
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            icon={<Mail className="size-4.5" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock className="size-4.5" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center">
            {/* Visual only: the session cookie already keeps this device signed in. */}
            <label htmlFor="remember-me" className="flex cursor-pointer items-center gap-2 text-sm text-body">
              <input
                id="remember-me"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4.5 shrink-0 rounded accent-primary-600"
              />
              Remember me
            </label>
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Log In"}
            {isSubmitting ? null : <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>

        <p className="text-center text-sm text-body">
          New to yoga?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}

