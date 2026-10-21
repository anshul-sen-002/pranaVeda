"use client";
import { useRef, useState } from "react";
import { CheckCircle2, CloudUpload, FileImage, FileMusic, FileVideo, X } from "lucide-react";
import { DotLoader } from "@/components/motion/DotLoader";
import { adminMediaApi, MEDIA_LIMITS, type MediaUploadKind } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { MediaDto } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function humanBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}
const KIND_META: Record<MediaUploadKind, { label: string; Icon: typeof FileImage; hint: string }> = {
  CONTENT_IMAGE: { label: "Images", Icon: FileImage, hint: "jpg, png, webp, avif" },
  VIDEO: { label: "Videos", Icon: FileVideo, hint: "mp4, webm, mov" },
  AUDIO: { label: "Audios", Icon: FileMusic, hint: "mp3, m4a, ogg, wav" },
};
interface PendingFile {
  key: string; file: File; previewUrl: string | null;
  status: "ready" | "uploading" | "done" | "error";
  progress: number; media?: MediaDto; error?: string;
}
export function MediaUploadStudio({ accessToken, contentId, defaultKind = "CONTENT_IMAGE", lockKind = false, onUploaded, className }: { accessToken: string; contentId?: number | string; defaultKind?: MediaUploadKind; lockKind?: boolean; onUploaded?: (media: MediaDto) => void; className?: string }) {
  const [kind, setKind] = useState<MediaUploadKind>(defaultKind);
  const [items, setItems] = useState<PendingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const limits = MEDIA_LIMITS[kind];

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const accepted = limits.accept ? limits.accept.split(",").map((t) => t.trim()) : [];
    setItems((prev) => {
      const next = [...prev];
      for (const file of arr) {
        const key = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        if (file.size > limits.maxBytes) {
          next.push({ key, file, previewUrl: null, status: "error", progress: 0, error: `${file.name}: too large.` });
          continue;
        }
        // Drag & drop bypasses the picker's `accept` filter, so validate the
        // MIME type here too and reject mismatched files before any upload.
        if (accepted.length > 0 && !accepted.includes(file.type)) {
          next.push({ key, file, previewUrl: null, status: "error", progress: 0,
            error: `${file.name}: unsupported type${file.type ? ` "${file.type}"` : ""}. Allowed: ${accepted.map((t) => t.replace(/^[a-z]+\//, "")).join(", ")}.` });
          continue;
        }
        next.push({ key, file, previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null, status: "ready", progress: 0 });
      }
      return next.slice(-12);
    });
  };

  const uploadOne = async (key: string) => {
    const target = items.find((i) => i.key === key);
    if (!target || target.status === "uploading" || target.status === "done") return;
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "uploading", progress: 8, error: undefined } : i)));
    try {
      const media = await adminMediaApi.upload(accessToken, target.file, kind, contentId);
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "done", progress: 100, media } : i)));
      onUploaded?.(media);
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "error", progress: 0, error: err instanceof ApiError ? err.message : "Upload failed." } : i)));
    }
  };

  const readyCount = items.filter((i) => i.status === "ready").length;
  const doneCount = items.filter((i) => i.status === "done").length;

  const remove = (key: string) => {
    setItems((prev) => {
      const t = prev.find((i) => i.key === key);
      if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((i) => i.key !== key);
    });
  };
  return (
    <div className={cn("mobile-compact rounded-2xl border border-border-soft bg-surface p-3 sm:rounded-3xl sm:p-5", className)}>
      {lockKind ? null : (
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-tint p-1" role="tablist" aria-label="Media type">
          {(Object.keys(KIND_META) as MediaUploadKind[]).map((k) => {
            const meta = KIND_META[k];
            const active = kind === k;
            return (
              <button key={k} type="button" role="tab" aria-selected={active} onClick={() => setKind(k)}
                className={cn("inline-flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold sm:min-h-11 sm:flex-row sm:gap-1.5 sm:text-xs", active ? "bg-surface text-primary-700 shadow-sm" : "text-muted")}>
                <meta.Icon className="size-4" aria-hidden="true" />{meta.label}
              </button>
            );
          })}
        </div>
      )}
      <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files); }}
        className={cn("mt-3 flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-6 text-center sm:py-10", dragOver ? "border-primary-400 bg-primary-50" : "border-border-soft hover:border-primary-300 hover:bg-primary-50/50")}>
        <span className="flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-700"><CloudUpload className="size-5" aria-hidden="true" /></span>
        <span className="text-sm font-semibold text-heading">Tap to choose {KIND_META[kind].label.toLowerCase()}</span>
        <span className="text-xs text-muted">drag &amp; drop · up to {humanBytes(limits.maxBytes)} · {KIND_META[kind].hint}</span>
      </button>
      <input ref={inputRef} type="file" accept={limits.accept} multiple onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} className="sr-only" aria-label={`Upload ${kind}`} />
      {items.length > 0 ? (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-heading">{items.length} file{items.length === 1 ? "" : "s"}{doneCount > 0 ? ` · ${doneCount} uploaded` : ""}</p>
            {readyCount > 1 ? <button type="button" onClick={() => { for (const i of items) if (i.status === "ready") void uploadOne(i.key); }} className="min-h-9 rounded-full bg-primary-600 px-4 text-xs font-semibold text-white">Upload all</button> : null}
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.key} className="overflow-hidden rounded-xl border border-border-soft bg-surface-tint/40">
                <div className="relative aspect-square bg-primary-50">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-primary-400">{kind === "VIDEO" ? <FileVideo className="size-8" aria-hidden="true" /> : kind === "AUDIO" ? <FileMusic className="size-8" aria-hidden="true" /> : <FileImage className="size-8" aria-hidden="true" />}</span>
                  )}
                  <button type="button" onClick={() => remove(item.key)} aria-label={`Remove ${item.file.name}`} className="absolute top-1.5 right-1.5 inline-flex size-8 items-center justify-center rounded-full bg-surface/95 text-muted shadow-sm"><X className="size-4" aria-hidden="true" /></button>
                  {item.status === "done" ? <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-white"><CheckCircle2 className="size-3" aria-hidden="true" />Uploaded</span> : null}
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-heading" title={item.file.name}>{item.file.name}</p>
                  <p className="text-[10px] text-muted">{humanBytes(item.file.size)}{item.media ? ` · id ${item.media.id}` : ""}</p>
                  {item.status === "uploading" ? <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-100" aria-hidden="true"><div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${item.progress}%` }} /></div> : null}
                  {item.error ? <p className="mt-1 line-clamp-2 text-[10px] text-danger" role="alert">{item.error}</p> : null}
                  {item.status === "ready" || (item.status === "error" && !item.media) ? (
                    <button type="button" onClick={() => void uploadOne(item.key)} className="mt-1.5 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary-600 text-[11px] font-semibold text-white"><CloudUpload className="size-3.5" aria-hidden="true" />{item.status === "error" ? "Retry" : "Upload"}</button>
                  ) : item.status === "uploading" ? (
                    <div className="mt-1.5 flex min-h-9 items-center justify-center gap-1.5 text-[11px] font-medium text-muted"><DotLoader text="Uploading…" inline size="sm" /></div>
                  ) : item.media ? (
                    <p className="mt-1 truncate text-[10px] text-success">✓ id {item.media.id} · ready to attach</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}


