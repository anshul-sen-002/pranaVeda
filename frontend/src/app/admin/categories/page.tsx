"use client";
import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuth } from "@/hooks/useAuth";
import { listCategories, listTags } from "@/lib/api/content";
import { taxonomyAdminApi } from "@/lib/api/extras";
import { ApiError } from "@/lib/api/client";
import type { CategoryDto, TagDto } from "@/lib/api/types";

export default function AdminTaxonomyPage() {
  return (
    <AdminGuard><TaxonomyStudio /></AdminGuard>
  );
}

function TaxonomyStudio() {
  const { accessToken } = useAuth();
  const [cats, setCats] = useState<CategoryDto[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"category" | "tag">("category");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const [c, t] = await Promise.all([listCategories(), listTags()]);
      setCats(c); setTags(t); setError(null);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not load taxonomy."); }
  };
  useEffect(() => { void load(); }, []);
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !name.trim()) return;
    setBusy(true);
    try {
      if (kind === "category") await taxonomyAdminApi.createCategory(accessToken, { name: name.trim() });
      else await taxonomyAdminApi.createTag(accessToken, { name: name.trim() });
      setName("");
      await load();
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not create entry."); }
    finally { setBusy(false); }
  };
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-heading"><Tags className="size-5 text-primary-600" aria-hidden="true" />Categories &amp; tags</h1>
      <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-3 rounded-3xl border border-border-soft bg-surface p-4">
        <label className="min-w-48 flex-1"><span className="mb-1.5 block text-sm font-medium text-heading">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Yoga" className="h-11 w-full rounded-xl border border-border-soft px-3 text-sm" />
        </label>
        <label><span className="mb-1.5 block text-sm font-medium text-heading">Kind</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as "category" | "tag")} className="h-11 rounded-xl border border-border-soft px-3 text-sm">
            <option value="category">Category</option><option value="tag">Tag</option>
          </select>
        </label>
        <button type="submit" disabled={busy || !name.trim()} className="inline-flex min-h-11 items-center rounded-full bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Creating…" : "Create"}</button>
      </form>
      {error ? <p className="mt-3 rounded-2xl bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5">
          <h2 className="font-semibold text-heading">Categories ({cats.length})</h2>
          <ul className="mt-3 space-y-1.5">{cats.map((c) => <li key={c.id} className="text-sm text-body"><span className="font-medium text-heading">{c.name}</span> <span className="text-xs text-muted">· {c.slug}</span></li>)}</ul>
        </section>
        <section className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5">
          <h2 className="font-semibold text-heading">Tags ({tags.length})</h2>
          <ul className="mt-3 space-y-1.5">{tags.map((t) => <li key={t.id} className="text-sm text-body"><span className="font-medium text-heading">{t.name}</span> <span className="text-xs text-muted">· {t.slug}</span></li>)}</ul>
        </section>
      </div>
    </main>
  );
}
