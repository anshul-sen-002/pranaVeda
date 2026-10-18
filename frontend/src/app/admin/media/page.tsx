"use client";
import { useState } from "react";
import { CloudUpload, FileImage, FileMusic, FileVideo, Info, Shield } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { MediaUploadStudio } from "@/components/admin/MediaUploadStudio";
import { DotLoader } from "@/components/motion/DotLoader";
import { useAuth } from "@/hooks/useAuth";
import type { MediaDto } from "@/lib/api/types";

export default function AdminMediaPage() {
  return <AdminGuard><MediaStudio /></AdminGuard>;
}

function MediaStudio() {
  const { accessToken } = useAuth();
  const [recent, setRecent] = useState<MediaDto[]>([]);
  const onUploaded = (media: MediaDto) => setRecent((prev) => [media, ...prev].slice(0, 20));
  if (!accessToken) {
    return <main className="flex min-h-[60vh] items-center justify-center"><DotLoader alt="Loading" /></main>;
  }
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <header className="overflow-hidden rounded-3xl border border-border-soft bg-gradient-to-br from-primary-50 via-surface-tint to-primary-100 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <CloudUpload className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">Media Studio</h1>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-body sm:text-base">
              Upload images, videos, and audio to Cloudinary. Files get a delivery URL + asset id
              ready to attach to content or audio tracks.
            </p>
          </div>
        </div>
      </header>
      <div className="mt-6"><MediaUploadStudio accessToken={accessToken} onUploaded={onUploaded} /></div>
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border-soft bg-surface p-4">
        <Shield className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-body">
          Uploads are validated server-side: MIME type, file size, and image dimensions are checked
          before storage. Files use generated keys — original filenames are never storage paths.
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-border-soft bg-surface p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
          <Info className="size-4 text-primary-600" aria-hidden="true" /> Upload limits
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-3">
            <FileImage className="size-5 shrink-0 text-primary-600" aria-hidden="true" />
            <div><p className="text-sm font-medium text-heading">Images</p><p className="text-xs text-muted">5 MB · jpg, png, webp, avif</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-3">
            <FileVideo className="size-5 shrink-0 text-primary-600" aria-hidden="true" />
            <div><p className="text-sm font-medium text-heading">Videos</p><p className="text-xs text-muted">100 MB · mp4, webm, mov</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-primary-50 p-3">
            <FileMusic className="size-5 shrink-0 text-primary-600" aria-hidden="true" />
            <div><p className="text-sm font-medium text-heading">Audio</p><p className="text-xs text-muted">50 MB · mp3, m4a, ogg, wav</p></div>
          </div>
        </div>
      </div>
      {recent.length > 0 ? (
        <section className="mt-6" aria-label="Recent uploads">
          <h2 className="text-sm font-semibold text-heading">This session ({recent.length})</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {recent.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  {m.kind === "VIDEO" ? <FileVideo className="size-5" aria-hidden="true" /> : m.kind === "AUDIO" ? <FileMusic className="size-5" aria-hidden="true" /> : <FileImage className="size-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">{m.kind}</p>
                  <p className="truncate text-xs text-muted">id {m.id}{m.width && m.height ? ` · ${m.width}×${m.height}` : ""}</p>
                </div>
                <code className="max-w-40 truncate rounded-lg bg-surface-tint px-2 py-1 text-[11px] text-muted" title={m.url}>{m.url.split("/").pop()}</code>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
