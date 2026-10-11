import { z } from "zod";

/**
 * Client-side validation.
 *
 * These mirror the backend's Bean Validation rules (agents.md 2.3) so users get
 * instant feedback. They are NOT a security control - the backend re-validates
 * everything and remains the source of truth.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .max(80, "Name must be 80 characters or fewer")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  // Transparent consent, as required by agents.md 2.8.
  acceptTerms: z.literal(true, {
    message: "Please accept the terms to continue",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
