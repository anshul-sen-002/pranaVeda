"use client";

import { Bot, History, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { MobileBackButton } from "@/components/layout/MobileBackButton";

/** Chat identity, educational scope, and new-conversation action. */
export function AiChatHeader({ onNewChat, newChatDisabled = false }: { onNewChat?: () => void; newChatDisabled?: boolean }) {
  return (
    <header className="flex items-center gap-2 border-b border-[#e8ede4]/80 bg-gradient-to-r from-white via-[#fcfdf9] to-[#f5f8f3] px-2.5 py-2 sm:gap-3 sm:px-5 sm:py-4">
      <MobileBackButton label="Go back" className="-ml-2 size-10 sm:hidden" />
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf3ec] text-primary-700 sm:size-12 sm:rounded-2xl">
        <Bot className="size-[18px] sm:size-6" aria-hidden="true" />
        <Sparkles className="absolute -top-0.5 -right-0.5 size-3.5 fill-primary-500 text-primary-500" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold leading-5 tracking-[-.01em] text-heading sm:gap-1.5 sm:text-base">
          PranaVeda AI
          <span className="size-1.5 rounded-full bg-[#52a77d] sm:hidden" role="img" aria-label="Available" />
          <Sparkles className="hidden size-4 fill-primary-500 text-primary-500 sm:block" aria-hidden="true" />
        </span>
        <span className="hidden truncate text-[13px] text-muted sm:block">A calm space for everyday wellness</span>
      </span>
      <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1.5 text-[11px] font-medium text-primary-800 sm:inline-flex"><ShieldCheck className="size-3.5" aria-hidden="true" /> Educational</span>
      <Link href="/ai/history" aria-label="View chat history" title="Chat history" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#668176] transition-colors hover:bg-white hover:text-primary-700 sm:size-10 sm:rounded-xl sm:border sm:border-[#e6eadd] sm:bg-white"><History className="size-4" aria-hidden="true" /></Link>
      {onNewChat ? <button type="button" onClick={onNewChat} disabled={newChatDisabled} aria-label="Start a new chat" title="Start a new chat" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-primary-700 transition-colors hover:bg-white disabled:opacity-50 sm:size-10 sm:w-auto sm:gap-2 sm:rounded-xl sm:border sm:border-[#e6eadd] sm:bg-white sm:px-3"><Plus className="size-4" aria-hidden="true" /><span className="hidden text-xs font-medium sm:inline">New chat</span></button> : null}
    </header>
  );
}
