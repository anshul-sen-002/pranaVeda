"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ImagePlus, Loader2, Plus, Video } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";
import { MediaUploadStudio } from "@/components/admin/MediaUploadStudio";
import { Alert } from "@/components/ui/Alert";
import { DotLoader } from "@/components/motion/DotLoader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { adminContentApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ContentSummary, ContentType, MediaDto } from "@/lib/api/types";

/**
 * Admin content list + create (agents.md 2.15). Creating a pose yields a
 * DRAFT; steps are managed on the dedicated page and publication is an
 * explicit server-checked action. Each row can set its featured cover via
 * the Cloudinary pipeline (upload → PUT featuredImageUrl).
 */
export default function AdminContentPage() {
  return (
    <AdminGuard>
      <AppShell quote="Create, edit, publish yoga poses and articles.">
        <AdminContentList />
      </AppShell>
    </AdminGuard>
  );
}

function AdminContentList() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [coverFor, setCoverFor] = useState<number | null>(null);
  const [coverMsg, setCoverMsg] = useState<Record<number, string>>({});
  const [videoFor, setVideoFor] = useState<number | null>(null);
  const [videoMsg, setVideoMsg] = useState<Record<number, string>>({});
  const [deletingContent, setDeletingContent] = useState<Set<number>>(new Set());

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("ASANA");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const page = await adminContentApi.list(accessToken, { size: 50 });
      setItems(page.content);
      setListError(null);
    } catch (error) {
      setListError(error instanceof ApiError ? error.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const removeContent = async (id: number) => {
    if (!window.confirm("Delete this content and all its media?")) return;
    setDeletingContent((prev) => new Set([...prev, id]));
    try {
      await adminContentApi.remove(accessToken!, id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (error) {
      alert(error instanceof ApiError ? error.message : "Delete failed.");
    } finally {
      setDeletingContent((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await adminContentApi.create(accessToken, {
        title: title.trim(),
        contentType: type,
        summary: "",
      });
      // Continue straight into step management for the new pose.
      router.push(`/admin/content/${created.summary.id}/steps`);
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.message : "Could not create content.");
      setCreating(false);
    }
  };

  /** Merge the new cover URL into the existing content and PUT it back. */
  const saveCover = async (id: number, media: MediaDto) => {
    if (!accessToken) return;
    try {
      const detail = await adminContentApi.get(accessToken, id);
      const s = detail.summary;
      await adminContentApi.update(accessToken, id, {
        title: s.title,
        slug: s.slug,
        summary: s.summary ?? "",
        description: detail.description ?? undefined,
        commonName: s.commonName ?? undefined,
        sanskritName: s.sanskritName ?? undefined,
        contentType: s.contentType,
        difficulty: s.difficulty ?? undefined,
        durationMinutes: s.durationMinutes ?? undefined,
        featuredImageUrl: media.url,
        featuredVideoUrl: s.featuredVideoUrl ?? undefined,
        instructions: detail.instructions ?? undefined,
        breathingNotes: detail.breathingNotes ?? undefined,
        modifications: detail.modifications ?? undefined,
        safetyPrecautions: detail.safetyPrecautions ?? undefined,
        benefits: detail.benefits ?? undefined,
        evidenceNotes: detail.evidenceNotes ?? undefined,
        seoTitle: detail.seoTitle ?? undefined,
        seoDescription: detail.seoDescription ?? undefined,
        categorySlugs: s.categories.map((c) => c.slug),
        tagSlugs: s.tags.map((t) => t.slug),
        goals: s.goals,
        targetAreas: detail.targetAreas,
      });
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, featuredImageUrl: media.url } : it)));
      setCoverMsg((prev) => ({ ...prev, [id]: "Cover saved." }));
    } catch (error) {
      setCoverMsg((prev) => ({
        ...prev,
        [id]: error instanceof ApiError ? error.message : "Could not save cover.",
      }));
    } finally {
      setCoverFor(null);
    }
  };

  /** Merge the new video URL into the existing content and PUT it back. */
  const saveVideo = async (id: number, media: MediaDto) => {
    if (!accessToken) return;
    try {
      const detail = await adminContentApi.get(accessToken, id);
      const s = detail.summary;
      await adminContentApi.update(accessToken, id, {
        title: s.title,
        slug: s.slug,
        summary: s.summary ?? "",
        description: detail.description ?? undefined,
        commonName: s.commonName ?? undefined,
        sanskritName: s.sanskritName ?? undefined,
        contentType: s.contentType,
        difficulty: s.difficulty ?? undefined,
        durationMinutes: s.durationMinutes ?? undefined,
        featuredImageUrl: s.featuredImageUrl ?? undefined,
        featuredVideoUrl: media.url,
        instructions: detail.instructions ?? undefined,
        breathingNotes: detail.breathingNotes ?? undefined,
        modifications: detail.modifications ?? undefined,
        safetyPrecautions: detail.safetyPrecautions ?? undefined,
        benefits: detail.benefits ?? undefined,
        evidenceNotes: detail.evidenceNotes ?? undefined,
        seoTitle: detail.seoTitle ?? undefined,
        seoDescription: detail.seoDescription ?? undefined,
        categorySlugs: s.categories.map((c) => c.slug),
        tagSlugs: s.tags.map((t) => t.slug),
        goals: s.goals,
        targetAreas: detail.targetAreas,
      });
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, featuredVideoUrl: media.url } : it)));
      setVideoMsg((prev) => ({ ...prev, [id]: "Video saved — it appears on Yoga Videos once published." }));
    } catch (error) {
      setVideoMsg((prev) => ({
        ...prev,
        [id]: error instanceof ApiError ? error.message : "Could not save video.",
      }));
    } finally {
      setVideoFor(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-heading">Content studio</h1>
      <p className="mt-1 text-sm text-muted">
        Create a pose, add ordered images with narration, then publish.
      </p>

      <form
        onSubmit={create}
        className="mt-6 rounded-2xl border border-border-soft bg-surface p-5 space-y-4"
      >
        <h2 className="text-base font-semibold text-heading">New content</h2>
        {createError ? <Alert>{createError}</Alert> : null}
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tree Pose"
            required
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-heading">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentType)}
              className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              <option value="ASANA">Asana</option>
              <option value="ARTICLE">Article</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>
        </div>
        <Button type="submit" loading={creating} disabled={!title.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          Create draft
        </Button>
      </form>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-heading">All content</h2>
        {listError ? (
          <div className="mt-3">
            <Alert>{listError}</Alert>
          </div>
        ) : null}
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <DotLoader text="Loading…" inline size="sm" />
          </div>
        ) : items.length === 0 && !listError ? (
          <p className="mt-4 text-sm text-muted">No content yet. Create the first pose above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.contentType} · {item.status}
                    {item.featuredImageUrl ? " · cover ✓" : ""}
                    {item.featuredVideoUrl ? " · video ✓" : ""}
                  </p>
                  {coverMsg[item.id] ? (
                    <p className="mt-0.5 text-xs text-success">{coverMsg[item.id]}</p>
                  ) : null}
                  {videoMsg[item.id] ? (
                    <p className="mt-0.5 text-xs text-success">{videoMsg[item.id]}</p>
                  ) : null}
                  {coverFor === item.id ? (
                    <div className="mt-2">
                      <MediaUploadStudio
                        accessToken={accessToken ?? ""}
                        contentId={item.id}
                        defaultKind="CONTENT_IMAGE"
                        lockKind
                        onUploaded={(media) => void saveCover(item.id, media)}
                      />
                    </div>
                  ) : null}
                  {videoFor === item.id ? (
                    <div className="mt-2">
                      <MediaUploadStudio
                        accessToken={accessToken ?? ""}
                        contentId={item.id}
                        defaultKind="VIDEO"
                        lockKind
                        onUploaded={(media) => void saveVideo(item.id, media)}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCoverFor((cur) => (cur === item.id ? null : item.id))}
                    className="inline-flex items-center gap-1 text-sm font-medium text-body underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    aria-expanded={coverFor === item.id}
                  >
                    <ImagePlus className="size-4" aria-hidden="true" />
                    {item.featuredImageUrl ? "Change cover" : "Set cover"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoFor((cur) => (cur === item.id ? null : item.id))}
                    className="inline-flex items-center gap-1 text-sm font-medium text-body underline-offset-2 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    aria-expanded={videoFor === item.id}
                  >
                    <Video className="size-4" aria-hidden="true" />
                    {item.featuredVideoUrl ? "Change video" : "Set video"}
                  </button>
                  <Link
                    href={`/admin/content/${item.id}/steps`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    Steps
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => void removeContent(item.id)}
                    disabled={deletingContent.has(item.id)}
                    className="rounded-full border border-destructive/40 px-3 py-1 text-xs font-medium text-destructive disabled:opacity-60"
                  >
                    {deletingContent.has(item.id) ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
