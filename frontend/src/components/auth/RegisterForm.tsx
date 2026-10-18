"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { ArrowRight, Mail, UserRound } from "lucide-react";
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
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-body sm:mt-2">
          Start your personal yoga and wellness journey.
        </p>
      </motion.header>

      <div aria-live="polite" className="mt-4 sm:mt-6">
        {formError ? <Alert tone="error">{formError}</Alert> : null}
      </div>

      <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">
        <Input
          label="Name"
          autoComplete="name"
          placeholder="Your name (optional)"
          hint="We only ask for this so we can greet you."
          icon={<UserRound className="size-4.5" />}
          error={errors.displayName?.message}
          {...register("displayName")}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
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
            <p id="acceptTerms-error" role="alert" className="mt-1.5 text-xs text-danger">
              {errors.acceptTerms.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? null : <ArrowRight className="size-4" aria-hidden="true" />}
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>

      <p className="mt-5 text-center text-sm text-body sm:mt-7">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
