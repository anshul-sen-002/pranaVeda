"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { adminContentApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ContentSummary, ContentType } from "@/lib/api/types";

/**
 * Admin content list + create (agents.md 2.15). Creating a pose yields a
 * DRAFT; steps are managed on the dedicated page and publication is an
 * explicit server-checked action.
 */
export default function AdminContentPage() {
  return (
    <AdminGuard>
      <AdminContentList />
    </AdminGuard>
  );
}

function AdminContentList() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ContentType>("ASANA");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const page = await adminContentApi.list(accessToken, { size: 50 });
      setItems(page.content);
    } catch (error) {
      setListError(error instanceof ApiError ? error.message : "Could not load content.");
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading…
          </p>
        ) : items.length === 0 && !listError ? (
          <p className="mt-4 text-sm text-muted">No content yet. Create the first pose above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-heading">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.contentType} · {item.status}
                  </p>
                </div>
                <Link
                  href={`/admin/content/${item.id}/steps`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  Steps
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
