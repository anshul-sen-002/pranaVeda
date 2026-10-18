"use client";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mediaApi } from "@/lib/api/extras";
import { ApiError } from "@/lib/api/client";

/** Member-only download button resolving a short-lived signed URL. */
export function DownloadButton({ mediaId, label }: { mediaId: number; label?: string }) {
  const { status, accessToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (status !== "authenticated") return null;
  const go = async () => {
    if (!accessToken) return;
    setBusy(true); setError(null);
    try {
      const d = await mediaApi.download(accessToken, mediaId);
      const a = document.createElement("a");
      a.href = d.url;
      a.download = d.filename || "pranaveda-media";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Download unavailable.");
    } finally { setBusy(false); }
  };
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" onClick={() => void go()} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border-soft bg-surface px-4 text-sm font-medium text-heading hover:border-primary-300 hover:text-primary-700 disabled:opacity-50">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}{busy ? "Preparing…" : (label ?? "Download")}
      </button>
      {error ? <span className="text-xs text-danger" role="alert">{error}</span> : null}
    </span>
  );
}
