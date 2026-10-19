"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { registerSchema, type RegisterValues } from "@/lib/validation/authSchemas";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      // Must be true to satisfy z.literal(true); unchecked by default.
      acceptTerms: false as unknown as true,
    },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    try {
      await registerAccount({
        email: values.email,
        password: values.password,
        // Send undefined rather than "" so the backend keeps it null.
        displayName: values.displayName?.trim() ? values.displayName.trim() : undefined,
      });
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        // 409 DUPLICATE_EMAIL lands here and reads naturally as a field error.
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
            Join PranaVeda
          </h1>
          <p className="mt-1.5 text-[15px] text-body">
            Begin your wellness journey
          </p>
        </motion.header>

        <div aria-live="polite">
          {formError ? <Alert tone="error">{formError}</Alert> : null}
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Input
            label="Name"
            autoComplete="name"
            placeholder="Enter your name"
            icon={<UserRound className="size-4.5" />}
            error={errors.displayName?.message}
            {...register("displayName")}
          />

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
            autoComplete="new-password"
            placeholder="Create a password"
            icon={<Lock className="size-4.5" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            icon={<Lock className="size-4.5" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Consent checkbox - explicit, not pre-ticked (agents.md 1). */}
          <div>
            <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-3">
              <input
                id="acceptTerms"
                type="checkbox"
                aria-invalid={errors.acceptTerms ? true : undefined}
                aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
                className="mt-0.5 size-4.5 shrink-0 accent-primary-600"
                {...register("acceptTerms")}
              />
              <span className="text-sm leading-relaxed text-body">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.acceptTerms ? (
              <p
                id="acceptTerms-error"
                role="alert"
                className="mt-1.5 text-xs text-danger"
              >
                {errors.acceptTerms.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
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
            onClick={() => setGoogleMsg("Google sign-up is coming soon — please continue with email for now.")}
          >
            <GoogleG />
            Continue with Google
          </Button>
          {googleMsg ? <p className="mt-2 text-center text-xs text-muted" role="status">{googleMsg}</p> : null}
        </div>

        <p className="text-center text-sm text-body">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            Sign in
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
