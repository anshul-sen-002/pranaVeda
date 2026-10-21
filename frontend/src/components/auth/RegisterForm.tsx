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
          <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-heading sm:text-[30px]">
            Join PranaVeda
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
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
