import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, letting later Tailwind utilities win.
 * Standard shadcn/ui convention so component variants stay overridable.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
