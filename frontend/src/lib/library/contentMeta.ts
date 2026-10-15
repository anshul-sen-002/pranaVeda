import { FileText, PersonStanding, PlayCircle, type LucideIcon } from "lucide-react";

import type { ContentType, Difficulty } from "@/lib/api/types";

/**
 * Presentation metadata for enums. Values come straight from the backend
 * enums so we never render a label for a value the API would reject.
 *
 * The tinted chip colours are deliberately soft (low-saturation background,
 * darker accessible text) to stay calm and readable — never colour alone,
 * every chip also carries an icon + text label (agents.md 6).
 */
export const CONTENT_TYPE_META: Record<
  ContentType,
  { label: string; icon: LucideIcon; chip: string }
> = {
  ASANA: {
    label: "Asana",
    icon: PersonStanding,
    chip: "bg-primary-100 text-primary-800",
  },
  ARTICLE: {
    label: "Article",
    icon: FileText,
    chip: "bg-[#fbeed0] text-[#8a6d1f]",
  },
  VIDEO: {
    label: "Video",
    icon: PlayCircle,
    chip: "bg-[#fbe3e0] text-[#a24a42]",
  },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; dot: string }> = {
  BEGINNER: { label: "Beginner", dot: "bg-success" },
  INTERMEDIATE: { label: "Intermediate", dot: "bg-warning" },
  ADVANCED: { label: "Advanced", dot: "bg-danger" },
};
