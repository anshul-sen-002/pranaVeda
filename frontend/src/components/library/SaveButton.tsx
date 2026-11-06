"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Heart } from "lucide-react";
import { meApi } from "@/lib/api/me";
import { useAuth } from "@/hooks/useAuth";
import type { BookmarkTarget } from "@/lib/api/types";
import { cn } from "@/lib/cn";

/** Auth-gated save button: anonymous users get a ?next= login redirect. */
export function SaveButton({ targetType, targetId, savedAtStart, iconOnly = false, itemLabel, className }: { targetType: BookmarkTarget; targetId: number; savedAtStart?: boolean; iconOnly?: boolean; itemLabel?: string; className?: string }) {
  const { status, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(!!savedAtStart);
  const [checkingSaved, setCheckingSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setSaved(!!savedAtStart);
      return;
    }
    let active = true;
    setCheckingSaved(true);
    void meApi.bookmarks(accessToken, { targetType, page: 0, size: 100 })
      .then((page) => {
        if (active) setSaved(page.content.some((entry) => entry.targetId === targetId && entry.targetType === targetType));
      })
      .catch(() => {
        // Keep the server-provided initial state if saved-items lookup is unavailable.
      })
      .finally(() => {
        if (active) setCheckingSaved(false);
      });
    return () => { active = false; };
  }, [accessToken, savedAtStart, status, targetId, targetType]);

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
    <span className={cn("inline-flex flex-col items-end gap-1", className)}>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || checkingSaved || status === "loading"}
        aria-pressed={saved}
        aria-label={iconOnly ? (saved ? `Remove ${itemLabel ?? "item"} from saved library` : `Save ${itemLabel ?? "item"} to library`) : undefined}
        title={saved ? "Saved to your library" : "Save to your library"}
        className={cn(
          "inline-flex items-center justify-center border transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
          iconOnly
            ? "size-9 rounded-full border-white/80 bg-white/95 text-muted shadow-sm backdrop-blur hover:bg-white sm:size-10"
            : "h-10 gap-2 rounded-full border-border-soft bg-surface px-4 text-sm font-medium text-heading",
          saved && iconOnly && "text-primary-700",
        )}
      >
        {iconOnly ? <Heart className={cn("size-4", saved && "fill-current")} aria-hidden="true" /> : saved ? <BookmarkCheck className="size-4 text-primary-600" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
        {!iconOnly ? busy ? "Saving…" : saved ? "Saved" : "Save Pose" : null}
      </button>
      {err ? <span className={cn("text-xs text-danger", iconOnly && "absolute top-full right-0 mt-1 w-44 rounded-lg bg-white p-2 text-right shadow-md")} role="alert">{err}</span> : null}
    </span>
  );
}
