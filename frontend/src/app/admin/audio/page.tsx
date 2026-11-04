"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, FileAudio2, ImagePlus, Music2, Plus, Trash2, Upload, X } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { MediaUploadStudio } from "@/components/admin/MediaUploadStudio";
import { AppShell } from "@/components/layout/AppShell";
import { CoverImage } from "@/components/media/CoverImage";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { adminAudioApi } from "@/lib/api/admin";
import { ApiError, apiBaseUrl } from "@/lib/api/client";
import type { AudioCategory, AudioDetailDto } from "@/lib/api/types";

const CATEGORY_LABEL: Record<AudioCategory, string> = {
  MEDITATION: "Meditation", NATURE: "Nature Sounds", SINGING_BOWLS: "Singing Bowls",
  SLEEP: "Sleep", FOCUS: "Focus", GUIDED_BREATHING: "Guided Breathing",
};
type UploadTarget = { trackId: number; role: "audio" | "cover" } | null;

export default function AdminAudioPage() {
  return <AdminGuard><AppShell quote="Add calming audio to the library."><AdminAudioStudio /></AppShell></AdminGuard>;
}

function AdminAudioStudio() {
  const { accessToken } = useAuth();
  const [tracks, setTracks] = useState<AudioDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AudioCategory>("MEDITATION");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget>(null);
  const [messages, setMessages] = useState<Record<number, { text: string; error?: boolean }>>({});
  const [busyTracks, setBusyTracks] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const page = await adminAudioApi.list(accessToken);
      setTracks(page.content);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load tracks.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await adminAudioApi.create(accessToken, { title: title.trim(), category, streamable: true, downloadable: false });
      setTitle("");
      await load();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Could not create track.");
    } finally {
      setCreating(false);
    }
  };

  const attach = async (id: number, mediaId: number, role: "audio" | "cover") => {
    if (!accessToken) return;
    try {
      const updated = role === "audio"
        ? await adminAudioApi.attachAudio(accessToken, id, mediaId)
        : await adminAudioApi.attachCover(accessToken, id, mediaId);
      setTracks((previous) => previous.map((track) => track.id === id ? updated : track));
      const current = tracks.find((track) => track.id === id);
      const replacing = role === "audio" ? Boolean(current?.streamUrl) : Boolean(current?.coverImageUrl);
      setMessages((previous) => ({ ...previous, [id]: { text: `${role === "audio" ? "Audio file" : "Cover art"} ${replacing ? "replaced" : "attached"}.` } }));
      setUploadTarget(null);
    } catch (err) {
      setMessages((previous) => ({ ...previous, [id]: { text: err instanceof ApiError ? err.message : "Could not attach the uploaded file.", error: true } }));
    }
  };

  const removeTrack = async (id: number) => {
    if (!accessToken || !window.confirm("Delete this track and its attached media?")) return;
    setBusyTracks((previous) => new Set(previous).add(id));
    try {
      await adminAudioApi.remove(accessToken, id);
      setTracks((previous) => previous.filter((track) => track.id !== id));
      setUploadTarget((target) => target?.trackId === id ? null : target);
    } catch (err) {
      setMessages((previous) => ({ ...previous, [id]: { text: err instanceof ApiError ? err.message : "Could not delete track.", error: true } }));
    } finally {
      setBusyTracks((previous) => { const next = new Set(previous); next.delete(id); return next; });
    }
  };

  const transition = async (id: number, action: "publish" | "unpublish" | "archive") => {
    if (!accessToken) return;
    setBusyTracks((previous) => new Set(previous).add(id));
    try {
      const updated = await adminAudioApi[action](accessToken, id);
      setTracks((previous) => previous.map((track) => track.id === id ? updated : track));
      const verb = action === "unpublish" ? "unpublished" : action === "archive" ? "archived" : "published";
      setMessages((previous) => ({ ...previous, [id]: { text: `Track ${verb}.` } }));
    } catch (err) {
      setMessages((previous) => ({ ...previous, [id]: { text: err instanceof ApiError ? err.message : `Could not ${action} track.`, error: true } }));
    } finally {
      setBusyTracks((previous) => { const next = new Set(previous); next.delete(id); return next; });
    }
  };

  const openUploader = (track: AudioDetailDto, role: "audio" | "cover") => {
    setMessages((previous) => ({ ...previous, [track.id]: { text: "" } }));
    setUploadTarget((target) => target?.trackId === track.id && target.role === role ? null : { trackId: track.id, role });
  };

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 px-3 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary-700 uppercase">Content studio</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Calm music</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">Create a track, add its audio and optional cover art, then publish it to the library.</p>
      </header>

      <form onSubmit={create} className="rounded-2xl border border-border-soft bg-gradient-gourd-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Plus className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-heading">Create a track</h2><p className="text-xs text-muted">Start with a title and category. You can add media next.</p></div></div>
        {createError ? <div className="mb-4"><Alert>{createError}</Alert></div> : null}
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end">
          <label className="block min-w-0"><span className="mb-1.5 block text-sm font-medium text-heading">Track title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Deep Meditation" required maxLength={160} className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-heading">Category</span><select value={category} onChange={(event) => setCategory(event.target.value as AudioCategory)} className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200">{Object.entries(CATEGORY_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button type="submit" disabled={creating || !title.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-700 px-5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:opacity-50"><Plus className="size-4" aria-hidden="true" />{creating ? "Creating…" : "Create draft"}</button>
        </div>
      </form>

      <section className="mt-8 sm:mt-10" aria-labelledby="audio-tracks-heading">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 id="audio-tracks-heading" className="text-lg font-semibold text-heading">Tracks</h2><p className="text-xs text-muted">Audio is required to publish. Cover art is optional.</p></div><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">{tracks.length} {tracks.length === 1 ? "track" : "tracks"}</span></div>
        {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
        {loading ? <div className="rounded-2xl border border-border-soft bg-white p-6 text-sm text-muted">Loading tracks…</div> : tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-soft bg-white px-5 py-12 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700"><Music2 className="size-6" aria-hidden="true" /></span><h3 className="mt-3 font-semibold text-heading">No tracks yet</h3><p className="mt-1 text-sm text-muted">Create your first draft above to begin.</p></div>
        ) : (
          <ul className="space-y-3">
            {tracks.map((track) => {
              const panel = uploadTarget?.trackId === track.id ? uploadTarget : null;
              const hasAudio = Boolean(track.streamUrl);
              const hasCover = Boolean(track.coverImageUrl);
              const busy = busyTracks.has(track.id);
              return (
                <li key={track.id} className="min-w-0 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_12px_30px_-28px_rgba(29,63,46,.5)] sm:rounded-3xl">
                  <div className="flex min-w-0 flex-col gap-4 p-3 sm:flex-row sm:items-center sm:p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-primary-50 sm:size-16">{hasCover ? <CoverImage src={track.coverImageUrl} alt={`${track.title} cover`} /> : <div className="flex h-full items-center justify-center text-primary-500"><Music2 className="size-6" aria-hidden="true" /></div>}</div>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="max-w-full truncate text-sm font-semibold text-heading sm:text-base">{track.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${track.status === "PUBLISHED" ? "bg-success/10 text-success" : track.status === "ARCHIVED" ? "bg-muted/10 text-muted" : "bg-warning/10 text-warning"}`}>{track.status === "PUBLISHED" ? "Published" : track.status === "ARCHIVED" ? "Archived" : "Draft"}</span></div><p className="mt-1 text-xs text-muted">{CATEGORY_LABEL[track.category]}{track.durationSeconds ? ` · ${Math.round(track.durationSeconds / 60)} min` : ""}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${hasAudio ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{hasAudio ? <Check className="size-3" aria-hidden="true" /> : <FileAudio2 className="size-3" aria-hidden="true" />}{hasAudio ? "Audio attached" : "Audio required"}</span><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${hasCover ? "bg-success/10 text-success" : "bg-surface-tint text-muted"}`}>{hasCover ? <Check className="size-3" aria-hidden="true" /> : <ImagePlus className="size-3" aria-hidden="true" />}{hasCover ? "Cover attached" : "Cover optional"}</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                      <button type="button" onClick={() => openUploader(track, "audio")} aria-expanded={panel?.role === "audio"} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-primary-200 px-3 text-xs font-semibold text-primary-800 hover:bg-primary-50"><Upload className="size-3.5" aria-hidden="true" />{hasAudio ? "Replace audio" : "Add audio"}</button>
                      <button type="button" onClick={() => openUploader(track, "cover")} aria-expanded={panel?.role === "cover"} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-border-soft px-3 text-xs font-semibold text-body hover:bg-surface-tint"><ImagePlus className="size-3.5" aria-hidden="true" />{hasCover ? "Replace cover" : "Add cover"}</button>
                      {track.status === "PUBLISHED" ? <button type="button" disabled={busy} onClick={() => void transition(track.id, "unpublish")} className="col-span-2 min-h-10 rounded-full border border-warning/30 bg-warning/5 px-3 text-xs font-semibold text-warning disabled:opacity-50 sm:col-span-1">Unpublish</button> : <button type="button" disabled={busy || !hasAudio || track.status === "ARCHIVED"} onClick={() => void transition(track.id, "publish")} title={!hasAudio ? "Attach an audio file before publishing" : undefined} className="col-span-2 min-h-10 rounded-full bg-primary-700 px-4 text-xs font-semibold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-45 sm:col-span-1">{track.status === "ARCHIVED" ? "Archived" : "Publish"}</button>}
                      <button type="button" disabled={busy} onClick={() => void removeTrack(track.id)} aria-label={`Delete ${track.title}`} className="col-span-2 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-danger/30 px-3 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-50 sm:col-span-1"><Trash2 className="size-3.5" aria-hidden="true" />Delete</button>
                    </div>
                  </div>
                  {track.streamUrl ? <div className="border-t border-border-soft px-3 py-2 sm:px-4"><audio controls preload="none" src={track.streamUrl.startsWith("/") ? `${apiBaseUrl}${track.streamUrl}` : track.streamUrl} className="h-9 w-full" aria-label={`Preview ${track.title}`} /></div> : null}
                  {messages[track.id]?.text ? <p role={messages[track.id].error ? "alert" : "status"} className={`border-t border-border-soft px-4 py-2 text-xs ${messages[track.id].error ? "text-danger" : "text-success"}`}>{messages[track.id].text}</p> : null}
                  {panel ? (
                    <div className="border-t border-border-soft bg-surface-tint/30 p-3 sm:p-4">
                      <div className="mb-3 flex items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-heading">{panel.role === "audio" ? `${hasAudio ? "Replace" : "Add"} audio file` : `${hasCover ? "Replace" : "Add"} cover art`}</h4><p className="mt-0.5 text-xs text-muted">{panel.role === "audio" ? "MP3, M4A, OGG, or WAV · up to 50 MB" : "JPG, PNG, WebP, or AVIF · up to 5 MB"}. Upload attaches it to this track.</p></div><button type="button" onClick={() => setUploadTarget(null)} aria-label="Close uploader" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border-soft bg-white text-muted hover:text-heading"><X className="size-4" aria-hidden="true" /></button></div>
                      <MediaUploadStudio key={`${track.id}-${panel.role}`} accessToken={accessToken ?? ""} defaultKind={panel.role === "audio" ? "AUDIO" : "CONTENT_IMAGE"} lockKind onUploaded={(media) => void attach(track.id, media.id, panel.role)} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
