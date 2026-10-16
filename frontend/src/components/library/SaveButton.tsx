"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { meApi } from "@/lib/api/me";
import { useAuth } from "@/hooks/useAuth";
import type { BookmarkTarget } from "@/lib/api/types";

/** Auth-gated save button: anonymous users get a ?next= login redirect. */
export function SaveButton({ targetType, targetId, savedAtStart }: { targetType: BookmarkTarget; targetId: number; savedAtStart?: boolean }) {
  const { status, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(!!savedAtStart);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function toggle() {
    setErr(null);
    if (status !== "authenticated" || !accessToken) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await meApi.removeBookmark(accessToken, targetType, targetId);
        setSaved(false);
      } else {
        await meApi.saveBookmark(accessToken, targetType, targetId);
        setSaved(true);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || status === "loading"}
        aria-pressed={saved}
        title={saved ? "Saved to your library" : "Save to your library"}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border-soft bg-surface px-4 text-sm font-medium text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-50"
      >
        {saved ? <BookmarkCheck className="size-4 text-primary-600" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
        {busy ? "Saving…" : saved ? "Saved" : "Save Pose"}
      </button>
      {err ? <span className="text-xs text-danger" role="alert">{err}</span> : null}
    </span>
  );
}
