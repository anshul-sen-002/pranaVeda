import { Logo } from "@/components/brand/Logo";

/**
 * Shown while the server verdict on the session is pending.
 *
 * This matters for UX: without it, visiting `/login` with a valid cookie would
 * briefly show the sign-in form and then bounce to `/dashboard`, which feels
 * broken. Instead we hold a calm, quiet screen until we actually know.
 *
 * It is announced politely and is visually matched to the auth shell so there
 * is no layout jump when the real form replaces it.
 */
export function AuthCheckingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-surface-tint px-5">
      <Logo />

      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 text-sm text-body"
      >
        <svg className="size-4 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        Checking your session...
      </div>

      {/* Skeleton that mirrors the auth card so the swap feels seamless. */}
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border-soft bg-surface p-7 sm:p-9" aria-hidden="true">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-surface-tint-2" />
        <div className="h-4 w-56 animate-pulse rounded bg-surface-tint" />
        <div className="mt-6 space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-surface-tint" />
          <div className="h-12 animate-pulse rounded-xl bg-surface-tint" />
          <div className="h-12 animate-pulse rounded-full bg-surface-tint-2" />
        </div>
      </div>
    </div>
  );
}
