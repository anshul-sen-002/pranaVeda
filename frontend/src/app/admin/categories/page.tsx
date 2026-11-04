"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FolderOpen, Hash, Plus, Search, Tags } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { listCategories, listTags } from "@/lib/api/content";
import { taxonomyAdminApi } from "@/lib/api/extras";
import type { CategoryDto, TagDto } from "@/lib/api/types";

type Kind = "category" | "tag";

export default function AdminTaxonomyPage() {
  return <AdminGuard><AppShell quote="Organize your yoga library."><TaxonomyStudio /></AppShell></AdminGuard>;
}

function TaxonomyStudio() {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("category");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [categoryItems, tagItems] = await Promise.all([listCategories(), listTags()]);
      setCategories(categoryItems);
      setTags(tagItems);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load categories and tags.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredCategories = useMemo(() => filterItems(categories, query), [categories, query]);
  const filteredTags = useMemo(() => filterItems(tags, query), [tags, query]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !name.trim()) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (kind === "category") await taxonomyAdminApi.createCategory(accessToken, { name: name.trim() });
      else await taxonomyAdminApi.createTag(accessToken, { name: name.trim() });
      setNotice(`${kind === "category" ? "Category" : "Tag"} created.`);
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not create ${kind}.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary-700 uppercase">Content studio</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-heading sm:text-3xl"><Tags className="size-6 text-primary-700" aria-hidden="true" />Categories &amp; tags</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">Keep the public yoga library easy to browse by organizing content into categories and searchable tags.</p>
      </header>

      <form onSubmit={create} className="rounded-2xl border border-border-soft bg-gradient-gourd-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="mb-4"><h2 className="font-semibold text-heading">Add to your taxonomy</h2><p className="mt-0.5 text-xs text-muted">Names are converted to URL-friendly slugs automatically.</p></div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto] sm:items-end">
          <label className="block min-w-0"><span className="mb-1.5 block text-sm font-medium text-heading">Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === "category" ? "e.g. Morning Yoga" : "e.g. beginner-friendly"} maxLength={100} required className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-heading">Type</span><select value={kind} onChange={(event) => setKind(event.target.value as Kind)} className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"><option value="category">Category</option><option value="tag">Tag</option></select></label>
          <button type="submit" disabled={busy || !name.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-700 px-5 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="size-4" aria-hidden="true" />{busy ? "Creating…" : `Create ${kind}`}</button>
        </div>
      </form>

      {error ? <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</div> : null}
      {notice ? <div className="mt-4 flex items-center gap-2 rounded-2xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success" role="status"><Check className="size-4" aria-hidden="true" />{notice}</div> : null}

      <section className="mt-7" aria-label="Taxonomy entries">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-lg font-semibold text-heading">Your library taxonomy</h2><p className="text-xs text-muted">{categories.length} categories · {tags.length} tags</p></div>
          <label className="relative block w-full sm:max-w-xs"><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" /><span className="sr-only">Search categories and tags</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search taxonomy…" className="h-10 w-full rounded-full border border-border-soft bg-white pr-4 pl-10 text-sm text-heading focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200" /></label>
        </div>
        {loading ? <div className="grid gap-4 md:grid-cols-2" aria-hidden="true"><div className="h-56 animate-pulse rounded-2xl bg-surface" /><div className="h-56 animate-pulse rounded-2xl bg-surface" /></div> : (
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <TaxonomyPanel title="Categories" icon="category" count={categories.length} visibleCount={filteredCategories.length} empty={categories.length === 0 ? "No categories yet. Create one above to organize related content." : "No categories match your search."}>
              {filteredCategories.map((item) => <TaxonomyItem key={item.id} name={item.name} slug={item.slug} detail={item.description} kind="category" />)}
            </TaxonomyPanel>
            <TaxonomyPanel title="Tags" icon="tag" count={tags.length} visibleCount={filteredTags.length} empty={tags.length === 0 ? "No tags yet. Add tags to make content easier to find." : "No tags match your search."}>
              {filteredTags.map((item) => <TaxonomyItem key={item.id} name={item.name} slug={item.slug} kind="tag" />)}
            </TaxonomyPanel>
          </div>
        )}
      </section>
    </main>
  );
}

function filterItems<T extends { name: string; slug: string }>(items: T[], query: string) {
  const normalized = query.trim().toLowerCase();
  return normalized ? items.filter((item) => item.name.toLowerCase().includes(normalized) || item.slug.toLowerCase().includes(normalized)) : items;
}

function TaxonomyPanel({ title, icon, count, visibleCount, empty, children }: { title: string; icon: "category" | "tag"; count: number; visibleCount: number; empty: string; children: React.ReactNode }) {
  const Icon = icon === "category" ? FolderOpen : Hash;
  return <section className="min-w-0 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_12px_30px_-28px_rgba(29,63,46,.5)] sm:rounded-3xl"><div className="flex items-center justify-between border-b border-border-soft bg-gradient-gourd-white px-4 py-3 sm:px-5"><div className="flex items-center gap-2"><span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700"><Icon className="size-4" aria-hidden="true" /></span><h3 className="font-semibold text-heading">{title}</h3></div><span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-primary-800">{count}</span></div>{visibleCount > 0 ? <ul className="divide-y divide-border-soft">{children}</ul> : <p className="px-4 py-8 text-center text-sm text-muted sm:px-6">{empty}</p>}</section>;
}

function TaxonomyItem({ name, slug, detail, kind }: { name: string; slug: string; detail?: string | null; kind: "category" | "tag" }) {
  return <li className="flex min-w-0 items-start gap-3 px-4 py-3.5 sm:px-5"><span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${kind === "category" ? "bg-primary-50 text-primary-700" : "bg-surface-tint text-body"}`}>{kind === "category" ? <FolderOpen className="size-4" aria-hidden="true" /> : <Hash className="size-4" aria-hidden="true" />}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-heading">{name}</p>{detail ? <p className="mt-0.5 line-clamp-2 text-xs text-muted">{detail}</p> : null}<code className="mt-1 inline-block max-w-full truncate rounded bg-surface-tint px-1.5 py-0.5 text-[10px] text-muted">/{slug}</code></div></li>;
}
