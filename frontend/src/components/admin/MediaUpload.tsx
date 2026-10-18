"use client";

import { useRef, useState } from "react";
import { CheckCircle2, CloudUpload } from "lucide-react";

import { adminMediaApi, MEDIA_LIMITS, type MediaUploadKind } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { DotLoader } from "@/components/motion/DotLoader";
import type { MediaDto } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function humanBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

/**
 * Admin file-upload widget for the Cloudinary pipeline. Mirrors the backend
 * MediaProperties caps (5 MB image / 100 MB video / 50 MB audio) in the
 * browser so an over-limit file never leaves the machine; the server always
 * re-validates size, MIME, and (for images) pixel dimensions.
 *
 * On success the component calls `onUploaded` with the safe MediaDto so the
 * parent can attach the asset id to content/audio or store the URL.
 */
export function MediaUpload({
  accessToken,
  kind,
  contentId,
  onUploaded,
  label,
  className,
}: {
  accessToken: string;
  kind: MediaUploadKind;
  contentId?: number | string;
  onUploaded: (media: MediaDto) => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<MediaDto | null>(null);
  const limits = MEDIA_LIMITS[kind];

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);
    setDone(null);
    if (file.size > limits.maxBytes) {
      setError(`File is ${humanBytes(file.size)} — the limit for ${kind.toLowerCase()} is ${humanBytes(limits.maxBytes)}.`);
      return;
    }
    if (limits.accept && !limits.accept.split(",").some((t) => t === file.type)) {
      setError(`File type "${file.type || "unknown"}" is not accepted. Allowed: ${limits.accept.replaceAll(",", ", ")}.`);
      return;
    }
    setBusy(true);
    adminMediaApi
      .upload(accessToken, file, kind, contentId)
      .then((media) => {
        setDone(media);
        onUploaded(media);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Upload failed. Check your connection and try again.");
      })
      .finally(() => setBusy(false));
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border-soft bg-surface px-4 text-sm font-medium text-body transition-colors hover:border-primary-300 hover:bg-primary-50/60 disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {busy ? (
          <DotLoader text="Uploading…" inline size="sm" />
        ) : done ? (
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
        ) : (
          <CloudUpload className="size-4" aria-hidden="true" />
        )}
        {busy
          ? "Uploading…"
          : label ?? `Upload ${kind === "CONTENT_IMAGE" ? "image" : kind.toLowerCase()}`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={limits.accept}
        onChange={pick}
        className="sr-only"
        aria-label={label ?? `Upload ${kind}`}
      />
      <p className="text-xs text-muted">
        Up to {humanBytes(limits.maxBytes)}
        {limits.accept ? ` · ${limits.accept.split(",").map((t) => t.replace(/^[a-z]+\//, "")).join(", ")}` : ""}
      </p>
      {error ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {done ? (
        <p className="text-xs text-success break-all">
          Uploaded · id {done.id}
          {done.width && done.height ? ` · ${done.width}×${done.height}` : ""}
          {done.bytes ? ` · ${humanBytes(done.bytes)}` : ""}
        </p>
      ) : null}
    </div>
  );
}
