"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, FileText, ImagePlus, Plus, Video } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";
import { MediaUploadQueue } from "@/components/admin/MediaUploadQueue";
import { CoverImage } from "@/components/media/CoverImage";
import { Alert } from "@/components/ui/Alert";
import { DotLoader } from "@/components/motion/DotLoader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { adminContentApi } from "@/lib/api/admin";
import { listCategories } from "@/lib/api/content";
import { ApiError } from "@/lib/api/client";
import type { CategoryDto, ContentSummary, ContentType, MediaDto } from "@/lib/api/types";

/**
 * Admin content list + create (agents.md 2.15). Creating a pose yields a
 * DRAFT; steps are managed on the dedicated page and publication is an
 * explicit server-checked action. Each row can set its featured cover via
 * the Cloudinary pipeline (upload → PUT featuredImageUrl).
 */
export default function AdminContentPage() {
  return (
    <AdminGuard>
      <AppShell quote="Create and publish guided yoga asanas and videos.">
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
  const [transitioningVideos, setTransitioningVideos] = useState<Set<number>>(new Set());

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("ASANA");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
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

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

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
        summary: type === "VIDEO" ? videoDescription.trim().slice(0, 500) : "",
        ...(type === "VIDEO" ? {
          description: videoDescription.trim(),
          categorySlugs: videoCategory ? [videoCategory] : [],
        } : {}),
      });
      if (type === "ASANA") {
        router.push(`/admin/content/${created.summary.id}/steps`);
      } else {
        setItems((previous) => [created.summary, ...previous.filter((item) => item.id !== created.summary.id)]);
        setVideoFor(created.summary.id);
        setTitle("");
        setVideoDescription("");
        setVideoCategory("");
        setCreating(false);
      }
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
      setVideoMsg((prev) => ({ ...prev, [id]: "Video attached. Publish it from this row when ready." }));
    } catch (error) {
      setVideoMsg((prev) => ({
        ...prev,
        [id]: error instanceof ApiError ? error.message : "Could not save video.",
      }));
    } finally {
      setVideoFor(null);
    }
  };

  const transitionVideo = async (item: ContentSummary) => {
    if (!accessToken) return;
    const action = item.status === "PUBLISHED" ? "unpublish" : "publish";
    setTransitioningVideos((previous) => new Set(previous).add(item.id));
    setVideoMsg((previous) => ({ ...previous, [item.id]: "" }));
    try {
      const updated = action === "publish"
        ? await adminContentApi.publish(accessToken, item.id)
        : await adminContentApi.unpublish(accessToken, item.id);
      setItems((previous) => previous.map((current) => current.id === item.id ? { ...current, ...updated.summary } : current));
      setVideoMsg((previous) => ({ ...previous, [item.id]: action === "publish" ? "Video published to the library." : "Video unpublished." }));
    } catch (error) {
      setVideoMsg((previous) => ({ ...previous, [item.id]: error instanceof ApiError ? error.message : `Could not ${action} video.` }));
    } finally {
      setTransitioningVideos((previous) => { const next = new Set(previous); next.delete(item.id); return next; });
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 px-3 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary-700 uppercase">Admin workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Content studio</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">Create guided yoga asanas with narrated steps, or add a video and publish it to the video library.</p>
      </header>

      <form
        onSubmit={create}
        className="rounded-2xl border border-border-soft bg-gradient-gourd-white p-4 shadow-sm sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Plus className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-heading">Create content</h2><p className="text-xs text-muted">Start a draft, then add guided steps or media.</p></div></div>
        {createError ? <div className="mb-4"><Alert>{createError}</Alert></div> : null}
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px_auto] sm:items-end">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "ASANA" ? "e.g. Tree Pose" : "e.g. Morning Flow"}
            required
            maxLength={160}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-heading">Type</span>
            <span className="relative block">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="h-11 w-full appearance-none rounded-xl border border-border-soft bg-white px-3 pr-10 text-sm text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="ASANA">Guided yoga asana</option>
                <option value="VIDEO">Video</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            </span>
          </label>
        </div>
        {type === "VIDEO" ? (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-heading">Video description</span>
              <textarea
                value={videoDescription}
                onChange={(event) => setVideoDescription(event.target.value)}
                rows={4}
                maxLength={5000}
                placeholder="Describe what viewers will practice, the pace, and what they may need."
                className="w-full rounded-xl border border-border-soft bg-white px-4 py-3 text-sm leading-relaxed text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
              />
              <span className="mt-1 block text-xs text-muted">Shown on the video page. The first 500 characters also appear in the video card.</span>
            </label>
            <label className="block sm:max-w-md">
              <span className="mb-1.5 block text-sm font-medium text-heading">Category (optional)</span>
              <select
                value={videoCategory}
                onChange={(event) => setVideoCategory(event.target.value)}
                className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="">Choose a category</option>
                {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
              </select>
              {categories.length === 0 ? <span className="mt-1 block text-xs text-muted">Create categories in Admin → Categories to make them available here.</span> : null}
            </label>
          </div>
        ) : null}
        <Button type="submit" loading={creating} disabled={!title.trim()} className="mt-4 min-h-11 w-full rounded-full sm:mt-4 sm:w-auto">
          <Plus className="size-4" aria-hidden="true" />
          Create draft
        </Button>
      </form>

      <section className="mt-8 sm:mt-10" aria-labelledby="all-content-heading">
        <div className="mb-3 flex items-center justify-between gap-3"><div className="min-w-0"><h2 id="all-content-heading" className="text-lg font-semibold text-heading">All content</h2><p className="text-xs text-muted">Manage asanas, video assets, and publishing.</p></div><span className="shrink-0 whitespace-nowrap rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-800">{items.length} {items.length === 1 ? "item" : "items"}</span></div>
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
          <div className="rounded-2xl border border-dashed border-border-soft bg-white px-5 py-12 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700"><FileText className="size-6" aria-hidden="true" /></span><h3 className="mt-3 font-semibold text-heading">No content yet</h3><p className="mt-1 text-sm text-muted">Create your first asana or video draft above to begin.</p></div>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="min-w-0 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_12px_30px_-28px_rgba(29,63,46,.5)] sm:rounded-3xl"
              >
                <div className="flex min-w-0 gap-3 p-3 sm:p-4">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-primary-50 text-primary-600 sm:size-16">{item.featuredImageUrl ? <CoverImage src={item.featuredImageUrl} alt={`${item.title} cover`} /> : <div className="flex h-full items-center justify-center">{item.contentType === "VIDEO" ? <Video className="size-6" aria-hidden="true" /> : <FileText className="size-6" aria-hidden="true" />}</div>}</div>
                  <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="max-w-full truncate text-sm font-semibold text-heading sm:text-base">{item.title}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.status === "PUBLISHED" ? "bg-success/10 text-success" : item.status === "ARCHIVED" ? "bg-muted/10 text-muted" : "bg-warning/10 text-warning"}`}>{item.status === "PUBLISHED" ? "Published" : item.status === "ARCHIVED" ? "Archived" : "Draft"}</span><span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800">{item.contentType === "ASANA" ? "Asana" : "Video"}</span></div>
                  <p className="text-xs text-muted">
                    {item.contentType} · {item.status}
                    {item.featuredImageUrl ? " · cover ✓" : ""}
                    {item.featuredVideoUrl ? " · video ✓" : ""}
                  </p>
                  {coverMsg[item.id] ? (
                    <p role="status" className="mt-1 text-xs text-success">{coverMsg[item.id]}</p>
                  ) : null}
                  {videoMsg[item.id] ? (
                    <p role="status" className="mt-1 text-xs text-success">{videoMsg[item.id]}</p>
                  ) : null}
                  </div>
                </div>
                {coverFor === item.id ? <div className="border-t border-border-soft bg-surface-tint/30 p-3 sm:p-4"><MediaUploadQueue accessToken={accessToken ?? ""} contentId={item.id} defaultKind="CONTENT_IMAGE" lockKind onUploaded={(media) => void saveCover(item.id, media)} /></div> : null}
                {videoFor === item.id ? <div className="border-t border-border-soft bg-surface-tint/30 p-3 sm:p-4"><MediaUploadQueue accessToken={accessToken ?? ""} contentId={item.id} defaultKind="VIDEO" lockKind onUploaded={(media) => void saveVideo(item.id, media)} /></div> : null}
                <div className="grid grid-cols-2 items-center gap-2 border-t border-border-soft bg-surface-tint/30 p-3 sm:flex sm:flex-wrap sm:gap-2 sm:p-4">
                  <button
                    type="button"
                    onClick={() => setCoverFor((cur) => (cur === item.id ? null : item.id))}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-border-soft px-3 text-xs font-semibold text-body hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    aria-expanded={coverFor === item.id}
                  >
                    <ImagePlus className="size-3.5" aria-hidden="true" />
                    {item.featuredImageUrl ? "Change cover" : "Set cover"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoFor((cur) => (cur === item.id ? null : item.id))}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-border-soft px-3 text-xs font-semibold text-body hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    aria-expanded={videoFor === item.id}
                  >
                    <Video className="size-3.5" aria-hidden="true" />
                    {item.featuredVideoUrl ? "Change video" : "Set video"}
                  </button>
                  {item.contentType === "ASANA" ? (
                    <Link
                      href={`/admin/content/${item.id}/steps`}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-primary-200 px-3 text-xs font-semibold text-primary-800 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      Guided steps <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void transitionVideo(item)}
                      disabled={transitioningVideos.has(item.id) || (!item.featuredVideoUrl && item.status !== "PUBLISHED")}
                      title={!item.featuredVideoUrl && item.status !== "PUBLISHED" ? "Upload a video before publishing" : undefined}
                      className={`col-span-2 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45 sm:col-span-1 ${item.status === "PUBLISHED" ? "border border-warning/30 bg-warning/5 text-warning" : "bg-primary-700 text-white hover:bg-primary-800"}`}
                    >
                      {transitioningVideos.has(item.id) ? "Saving…" : item.status === "PUBLISHED" ? "Unpublish video" : "Publish video"}
                      {item.status !== "PUBLISHED" ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
                    </button>
                  )}
                    <button
                    type="button"
                    onClick={() => void removeContent(item.id)}
                    disabled={deletingContent.has(item.id)}
                    className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-full border border-danger/30 px-3 text-xs font-semibold text-danger hover:bg-danger/5 disabled:opacity-60 sm:col-span-1"
                  >
                    {deletingContent.has(item.id) ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
