"use client";
import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CONTENT_TYPES, DIFFICULTIES, GOALS } from "@/lib/library/params";
import type { ContentListParams } from "@/lib/api/types";

const SELECT = "h-9 w-full rounded-lg border border-border-soft bg-surface px-2 text-[13px] text-heading focus:border-primary-300 focus:outline-none";

interface Props {
  params: ContentListParams;
  qInput: string;
  onQInput: (v: string) => void;
  onPatch: (p: Partial<ContentListParams>) => void;
  onReset: () => void;
  total: number | null;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-border-soft py-4 last:border-0 last:pb-0 first:pt-0">
      <p className="text-[11px] font-semibold tracking-wide text-heading uppercase">{title}</p>
      <div className="mt-2.5 space-y-2">{children}</div>
    </div>
  );
}

function Check({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-body hover:text-heading">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-3.5 rounded accent-primary-600" />
      {label}
    </label>
  );
}

/** Sidebar filters matching mockup 3 — checkbox groups in sky-blue theme. */
export function LibrarySidebar(props: Props) {
  const { params, onPatch, onReset } = props;
  const hasActive = !!(params.q || params.type || params.difficulty || params.goal || params.category || params.durationMax || (params.tags && params.tags.length));
  return (
    <aside className="rounded-2xl border border-border-soft bg-surface p-5" aria-label="Filters">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">Filters</h2>
        {hasActive ? <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"><X className="size-3" aria-hidden="true" /> Clear all</button> : null}
      </div>
      <div className="mt-3">
        <Group title="Difficulty Level">
          {DIFFICULTIES.map((d) => <Check key={d.value} label={d.label} checked={params.difficulty === d.value} onChange={() => onPatch({ difficulty: params.difficulty === d.value ? undefined : d.value })} />)}
        </Group>
        <Group title="Focus Area">
          {GOALS.slice(0, 5).map((g) => <Check key={g.value} label={g.label} checked={params.goal === g.value} onChange={() => onPatch({ goal: params.goal === g.value ? undefined : g.value })} />)}
        </Group>
        <Group title="Duration">
          {[{ v: 5, l: "< 5 min" }, { v: 10, l: "5 – 10 min" }, { v: 20, l: "10 – 20 min" }, { v: 21, l: "> 20 min" }].map((d) => (
            <Check key={d.l} label={d.l} checked={params.durationMax === d.v} onChange={() => onPatch({ durationMax: params.durationMax === d.v ? undefined : d.v })} />
          ))}
        </Group>
        <Group title="Type">
          {CONTENT_TYPES.map((t) => <Check key={t.value} label={t.label} checked={params.type === t.value} onChange={() => onPatch({ type: params.type === t.value ? undefined : t.value })} />)}
        </Group>
      </div>
      {props.total !== null ? <p className="mt-4 border-t border-border-soft pt-3 text-xs text-muted">{props.total} result{props.total === 1 ? "" : "s"}</p> : null}
    </aside>
  );
}

export function LibrarySearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search poses, focus areas, or difficulty…" aria-label="Search yoga poses" className={cn(SELECT, "h-11 rounded-full pr-4 pl-9")} />
    </div>
  );
}
