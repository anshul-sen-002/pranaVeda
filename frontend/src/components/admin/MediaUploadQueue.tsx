"use client";
import { useRef, useState } from "react";
import { CloudUpload, FileImage, FileMusic, FileVideo, X } from "lucide-react";
import { DotLoader } from "@/components/motion/DotLoader";
import { adminMediaApi, MEDIA_LIMITS, type MediaUploadKind } from "@/lib/api/admin";
import type { MediaDto } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function humanBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

/** Normalize formats the Java ImageIO validator may not decode and resize
 * oversized cover images before sending them to the API. The backend still
 * performs its own MIME, size, and pixel checks. */
async function prepareContentImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const needsResize = scale < 1 || bitmap.width * bitmap.height > 12_000_000;
    const supportedByBackend = file.type === "image/jpeg" || file.type === "image/png";
    if (!needsResize && supportedByBackend && file.size <= MEDIA_LIMITS.CONTENT_IMAGE.maxBytes) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not process this image. Try a JPG or PNG file.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const preferPng = file.type === "image/png";
    let outputType = preferPng ? "image/png" : "image/jpeg";
    let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.88));
    if (blob && blob.size > MEDIA_LIMITS.CONTENT_IMAGE.maxBytes && preferPng) {
      outputType = "image/jpeg";
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.82));
    }
    if (!blob) throw new Error("Could not process this image. Try a JPG or PNG file.");
    if (blob.size > MEDIA_LIMITS.CONTENT_IMAGE.maxBytes) {
      throw new Error("The processed cover image is still over 5 MB. Choose a smaller image.");
    }
    const baseName = file.name.replace(/\.[^.]+$/, "") || "cover";
    const extension = outputType === "image/png" ? "png" : "jpg";
    return new File([blob], `${baseName}.${extension}`, { type: outputType, lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
const KIND_META: Record<MediaUploadKind, { label: string; Icon: typeof FileImage; hint: string }> = {
  CONTENT_IMAGE: { label: "Images", Icon: FileImage, hint: "jpg, png, webp, avif · large images are resized" },
  VIDEO: { label: "Videos", Icon: FileVideo, hint: "mp4, webm, mov" },
  AUDIO: { label: "Audios", Icon: FileMusic, hint: "mp3, m4a, ogg, wav" },
};
interface PendingFile {
  key: string; file: File; previewUrl: string | null;
  status: "ready" | "uploading" | "done" | "error";
  progress: number; media?: MediaDto; error?: string;
}
export function MediaUploadQueue({ accessToken, contentId, defaultKind = "CONTENT_IMAGE", lockKind = false, onUploaded, className }: { accessToken: string; contentId?: number | string; defaultKind?: MediaUploadKind; lockKind?: boolean; onUploaded?: (media: MediaDto) => void; className?: string }) {
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
        if (file.size > limits.maxBytes && kind !== "CONTENT_IMAGE") {
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
      const uploadFile = kind === "CONTENT_IMAGE" ? await prepareContentImage(target.file) : target.file;
      const media = await adminMediaApi.upload(accessToken, uploadFile, kind, contentId);
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "done", progress: 100, media } : i)));
      onUploaded?.(media);
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: "error", progress: 0, error: err instanceof Error ? err.message : "Upload failed." } : i)));
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
    <div className={cn("min-w-0 rounded-2xl border border-border-soft bg-white/80 p-3 sm:rounded-2xl sm:p-4", className)}>
      {lockKind ? null : (
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-tint p-1" role="tablist" aria-label="Media type">
          {(["VIDEO", "AUDIO"] as MediaUploadKind[]).map((k) => {
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
        className={cn("mt-2 grid min-h-[68px] w-full grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-x-3 rounded-xl border border-dashed px-3 py-2.5 text-left transition-colors sm:min-h-[72px]", dragOver ? "border-primary-400 bg-primary-50" : "border-border-soft hover:border-primary-300 hover:bg-primary-50/50")}>
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><CloudUpload className="size-4" aria-hidden="true" /></span>
        <span className="min-w-0"><span className="block truncate text-xs font-semibold text-heading">Choose {KIND_META[kind].label.toLowerCase()} or drop here</span><span className="mt-0.5 block truncate text-[10px] text-muted">Up to {humanBytes(limits.maxBytes)} · {KIND_META[kind].hint}</span></span>
      </button>
      <input ref={inputRef} type="file" accept={limits.accept} multiple onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} className="sr-only" aria-label={`Upload ${kind}`} />
      {items.length > 0 ? (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-heading">{items.length} file{items.length === 1 ? "" : "s"}{doneCount > 0 ? ` · ${doneCount} uploaded` : ""}</p>
            {readyCount > 1 ? <button type="button" onClick={() => { for (const i of items) if (i.status === "ready") void uploadOne(i.key); }} className="min-h-9 rounded-full bg-primary-600 px-4 text-xs font-semibold text-white">Upload all</button> : null}
          </div>
          <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.key} className="flex min-w-0 items-center gap-2 rounded-xl border border-border-soft bg-surface-tint/30 p-2 sm:gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-primary-50">
                  {item.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-primary-500">{kind === "VIDEO" ? <FileVideo className="size-5" aria-hidden="true" /> : kind === "AUDIO" ? <FileMusic className="size-5" aria-hidden="true" /> : <FileImage className="size-5" aria-hidden="true" />}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 p-1">
                  <p className="truncate text-[11px] font-medium text-heading" title={item.file.name}>{item.file.name}</p>
                  <p className="text-[10px] text-muted">{humanBytes(item.file.size)}{item.media ? ` · id ${item.media.id}` : ""}</p>
                  {item.status === "uploading" ? <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-100" aria-hidden="true"><div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${item.progress}%` }} /></div> : null}
                  {item.error ? <p className="mt-1 line-clamp-2 text-[10px] text-danger" role="alert">{item.error}</p> : null}
                  {item.status === "ready" || (item.status === "error" && !item.media) ? (
                    <button type="button" onClick={() => void uploadOne(item.key)} className="mt-1 inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-primary-700 px-2.5 text-[10px] font-semibold text-white"><CloudUpload className="size-3" aria-hidden="true" />{item.status === "error" ? "Retry" : "Upload"}</button>
                  ) : item.status === "uploading" ? (
                    <div className="mt-1 flex min-h-7 items-center gap-1 text-[10px] font-medium text-muted"><DotLoader text="Uploading" inline size="sm" /></div>
                  ) : item.media ? (
                    <p className="mt-1 truncate text-[10px] text-success">✓ id {item.media.id} · ready to attach</p>
                  ) : null}
                </div>
                <button type="button" onClick={() => remove(item.key)} aria-label={`Remove ${item.file.name}`} className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white hover:text-heading"><X className="size-4" aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}


