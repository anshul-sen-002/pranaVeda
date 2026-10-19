"use client";

import { Bot, Sparkles } from "lucide-react";

/** Chat header: bot avatar + name + Online pill (screenshot, top of card). */
export function AiChatHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-border-soft/70 px-4 py-3.5 sm:px-5">
      <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
        <Bot className="size-6" aria-hidden="true" />
        <Sparkles className="absolute -top-0.5 -right-0.5 size-3.5 fill-primary-500 text-primary-500" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[15px] font-semibold text-heading sm:text-base">
          PranaVeda AI
          <Sparkles className="size-4 fill-primary-500 text-primary-500" aria-hidden="true" />
        </span>
        <span className="block truncate text-xs text-muted sm:text-[13px]">Your personal wellness companion</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
        <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
        Online
      </span>
    </header>
  );
}
