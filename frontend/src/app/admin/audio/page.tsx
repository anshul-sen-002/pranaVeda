"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";
import { MediaUploadStudio } from "@/components/admin/MediaUploadStudio";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { adminAudioApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AudioCategory, AudioDetailDto } from "@/lib/api/types";

const CATEGORY_LABEL: Record<AudioCategory, string> = {
  MEDITATION: "Meditation",
  NATURE: "Nature Sounds",
  SINGING_BOWLS: "Singing Bowls",
  SLEEP: "Sleep",
  FOCUS: "Focus",
  GUIDED_BREATHING: "Guided Breathing",
};

/** Admin calm-music studio (draft → attach assets → publish). */
export default function AdminAudioPage() {
  return (
    <AdminGuard>
      <AppShell quote="Add calming audio to the library.">
        <AdminAudioStudio />
      </AppShell>
    </AdminGuard>
  );
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
  const [uploadFor, setUploadFor] = useState<number | null>(null);
  const [msg, setMsg] = useState<Record<number, string>>({});

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

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await adminAudioApi.create(accessToken, {
        title: title.trim(),
        category,
        streamable: true,
        downloadable: false,
      });
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
      const updated =
        role === "audio"
          ? await adminAudioApi.attachAudio(accessToken, id, mediaId)
          : await adminAudioApi.attachCover(accessToken, id, mediaId);
      setTracks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setMsg((prev) => ({ ...prev, [id]: `${role === "audio" ? "Audio" : "Cover"} attached.` }));
    } catch (err) {
      setMsg((prev) => ({ ...prev, [id]: err instanceof ApiError ? err.message : "Could not attach asset." }));
    } finally {
      setUploadFor(null);
    }
  };

  const transition = async (id: number, action: "publish" | "unpublish" | "archive") => {
    if (!accessToken) return;
    try {
      const updated = await adminAudioApi[action](accessToken, id);
      setTracks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setMsg((prev) => ({ ...prev, [id]: `Track ${action}ed.` }));
    } catch (err) {
      setMsg((prev) => ({ ...prev, [id]: err instanceof ApiError ? err.message : `Could not ${action} track.` }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-heading">Calm music studio</h1>
      <p className="mt-1 text-sm text-muted">
        Create a track, upload audio + cover to Cloudinary, attach the assets, then publish.
      </p>

      <form onSubmit={create} className="mt-6 rounded-2xl border border-border-soft bg-surface p-5 space-y-4">
        <h2 className="text-base font-semibold text-heading">New track</h2>
        {createError ? <Alert>{createError}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-heading">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Meditation"
              required
              className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-heading">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AudioCategory)}
              className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          {creating ? "Creating…" : "Create draft"}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-heading">Tracks</h2>
        {error ? (
          <div className="mt-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : tracks.length === 0 && !error ? (
          <p className="mt-4 text-sm text-muted">No tracks yet. Create the first one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
            {tracks.map((t) => (
              <li key={t.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-heading">{t.title}</p>
                    <p className="text-xs text-muted">
                      {CATEGORY_LABEL[t.category]} · {t.durationSeconds ? `${Math.round(t.durationSeconds / 60)} min` : "—"}
                      {t.streamUrl ? " · audio ✓" : ""}
                      {t.coverImageUrl ? " · cover ✓" : ""}
                    </p>
                    {msg[t.id] ? <p className="mt-0.5 text-xs text-success">{msg[t.id]}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadFor((cur) => (cur === t.id ? null : t.id))}
                      className="rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-body hover:border-primary-300 hover:text-primary-700"
                      aria-expanded={uploadFor === t.id}
                    >
                      Upload media
                    </button>
                    {t.status === "PUBLISHED" ? (
                      <button
                        type="button"
                        onClick={() => void transition(t.id, "unpublish")}
                        className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void transition(t.id, "publish")}
                        className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
                {uploadFor === t.id ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-heading">Audio file</p>
                      <MediaUploadStudio
                        accessToken={accessToken ?? ""}
                        contentId={t.id}
                        onUploaded={(media) => void attach(t.id, media.id, "audio")}
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-heading">Cover art</p>
                      <MediaUploadStudio
                        accessToken={accessToken ?? ""}
                        contentId={t.id}
                        onUploaded={(media) => void attach(t.id, media.id, "cover")}
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
