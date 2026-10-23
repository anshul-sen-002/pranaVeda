"use client";

import { cn } from "@/lib/cn";

/**
 * WhatsApp-style typing indicator: three dots that animate top-to-bottom
 * in sequence, giving a calm "thinking" cue while the AI streams a reply.
 */
export function WhatsAppTypingDots({
  className,
  text = "Thinking",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <span
      aria-label={`${text}…`}
      role="status"
      className={cn("inline-flex items-center gap-1 text-sm font-medium text-body", className)}
    >
      <span className="flex flex-col gap-0.5">
        <span className="typing-dot typing-dot-1" aria-hidden="true" />
        <span className="typing-dot typing-dot-2" aria-hidden="true" />
        <span className="typing-dot typing-dot-3" aria-hidden="true" />
      </span>
      <span className="text-muted">{text}…</span>
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2f8b66;
          animation: typingDots 1.4s infinite ease-in-out both;
        }
        .typing-dot-1 { animation-delay: -0.32s; }
        .typing-dot-2 { animation-delay: -0.16s; }
        .typing-dot-3 { animation-delay: 0s; }
        @keyframes typingDots {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}