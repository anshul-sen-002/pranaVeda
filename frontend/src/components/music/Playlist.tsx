"use client";

import { EllipsisVertical, ListMusic, Pause } from "lucide-react";

import { CoverImage } from "@/components/media/CoverImage";
import type { AudioTrackSummary } from "@/lib/api/types";
import { cn } from "@/lib/cn";

/** Right-rail queue list (session-only; persistence comes later). */
export function Playlist({
  ids, byId, currentId, playing, onSelect, onClear, minutesOf,
}: {
  ids: number[];
  byId: Map<number, AudioTrackSummary>;
  currentId: number | null;
  playing: boolean;
  onSelect: (id: number) => void;
  onClear: () => void;
  minutesOf: (t: AudioTrackSummary) => string;
}) {
  const queued = ids.map((id) => byId.get(id)).filter((t): t is AudioTrackSummary => Boolean(t));
  return (
    <section aria-label="Your playlist" className="rounded-3xl border border-border-soft bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
          <ListMusic className="size-4 text-primary-600" aria-hidden="true" />
          Your Playlist
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-primary-700"
        >
          Clear
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {queued.length === 0 ? (
          <li className="rounded-xl px-2 py-4 text-center text-xs text-muted">Press play on any track to build your queue.</li>
        ) : (
          queued.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-primary-50",
                  currentId === t.id && "bg-primary-50",
                )}
              >
                <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-primary-50">
                  <CoverImage src={t.coverImageUrl} alt="" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-heading">{t.title}</span>
                  <span className="block text-xs text-muted">{minutesOf(t)}</span>
                </span>
                {currentId === t.id && playing ? (
                  <Pause className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                ) : (
                  <EllipsisVertical className="size-4 shrink-0 text-muted" aria-hidden="true" />
                )}
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
