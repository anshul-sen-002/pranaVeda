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
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);

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
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-heading sm:text-[32px]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[15px] text-body">
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

          <div className="flex items-center justify-between">
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
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Log In"}
            {isSubmitting ? null : <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border-soft" />
          <span className="text-xs text-muted">or continue with</span>
          <span className="h-px flex-1 bg-border-soft" />
        </div>

        <div>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setGoogleMsg("Google sign-in is coming soon — please continue with email for now.")}
          >
            <GoogleG />
            Continue with Google
          </Button>
          {googleMsg ? <p className="mt-2 text-center text-xs text-muted" role="status">{googleMsg}</p> : null}
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

/** Inline multicolor "G" (no extra asset needed). */
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

