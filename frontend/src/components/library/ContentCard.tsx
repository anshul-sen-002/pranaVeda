import Link from "next/link";
import { ArrowRight, Clock3, Play } from "lucide-react";

import { cn } from "@/lib/cn";
import { CoverImage } from "@/components/media/CoverImage";
import { CONTENT_TYPE_META, DIFFICULTY_META } from "@/lib/library/contentMeta";
import { GOALS } from "@/lib/library/params";
import { SaveButton } from "@/components/library/SaveButton";
import type { ContentSummary } from "@/lib/api/types";

const GOAL_CHIP: Record<string, string> = {
  flexibility: "bg-primary-100 text-primary-800",
  relaxation: "bg-[#eee9fb] text-[#6957a8]",
  balance: "bg-[#e2f2f7] text-[#34748d]",
  mobility: "bg-[#e3f2ee] text-[#34765f]",
  posture: "bg-[#f6efdf] text-[#826a36]",
  sleep_routine: "bg-[#eceafa] text-[#625a9b]",
  general_fitness: "bg-[#f5e9df] text-[#94643b]",
};

function goalName(value: string) {
  return GOALS.find((goal) => goal.value === value)?.label ?? value.replaceAll("_", " ");
}

/** Responsive yoga library card with a real, auth-gated saved action. */
export function ContentCard({ item }: { item: ContentSummary }) {
  const type = CONTENT_TYPE_META[item.contentType];
  const difficulty = item.difficulty ? DIFFICULTY_META[item.difficulty] : null;
  const goal = item.goals[0];
  const chipClass = goal ? GOAL_CHIP[goal.toLowerCase()] ?? "bg-primary-100 text-primary-800" : type.chip;

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#e3ebe1] bg-white p-2.5 shadow-[0_12px_32px_-28px_rgba(29,63,46,.48)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_18px_38px_-26px_rgba(29,111,84,.28)] sm:rounded-3xl sm:p-3">
      <Link href={`/yoga/${item.slug}`} aria-label={`View ${item.title}`} className="block rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[13px] bg-primary-50 sm:rounded-2xl">
          <CoverImage src={item.featuredImageUrl} alt={`${item.title} pose`} imgClassName="transition-transform duration-500 group-hover:scale-[1.035]" />
          {item.featuredVideoUrl ? <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-primary-800 shadow-sm backdrop-blur"><Play className="size-3 fill-current" aria-hidden="true" />Video</span> : null}
        </div>

        <div className="px-1.5 pt-2.5 pb-1 sm:px-2 sm:pt-3 sm:pb-2">
          <span className={cn("inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-[11px]", chipClass)}>{goal ? goalName(goal) : type.label}</span>
          <h2 className="mt-2 line-clamp-1 pr-8 text-[13px] font-semibold leading-snug text-heading transition-colors group-hover:text-primary-700 sm:text-sm">{item.title}</h2>
          <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-muted sm:min-h-10 sm:text-xs">{item.summary}</p>
          <div className="mt-2.5 flex min-w-0 items-center gap-3 pr-9 text-[10px] font-medium text-body sm:mt-3 sm:gap-4 sm:text-[11px]">
            <span className="inline-flex min-w-0 items-center gap-1 whitespace-nowrap"><Clock3 className="size-3.5 shrink-0 text-primary-600" aria-hidden="true" />{item.durationMinutes ? `${item.durationMinutes} min` : "Self-paced"}</span>
            {difficulty ? <span className="inline-flex min-w-0 items-center gap-1.5 truncate"><span className={cn("size-1.5 shrink-0 rounded-full", difficulty.dot)} aria-hidden="true" />{difficulty.label}</span> : null}
          </div>
        </div>
        <span aria-hidden="true" className="absolute right-3 bottom-3 inline-flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white sm:right-4 sm:bottom-4 sm:size-9">
          <ArrowRight className="size-4" />
        </span>
      </Link>
      <SaveButton targetType="CONTENT" targetId={item.id} itemLabel={item.title} iconOnly className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4" />
    </article>
  );
}
