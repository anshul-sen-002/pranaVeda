"use client";

import { cn } from "@/lib/cn";

/**
 * WhatsApp-style typing indicator: three dots in a horizontal row that pulse
 * (scale + opacity) in sequence, giving a calm "thinking" cue while the AI
 * streams a reply.
 */
export function WhatsAppTypingDots({
  className,
  text,
}: {
  className?: string;
  text?: string;
}) {
  return (
    <span
      aria-label={text ? `${text}…` : "Typing…"}
      role="status"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="typing-dot typing-dot-1" />
        <span className="typing-dot typing-dot-2" />
        <span className="typing-dot typing-dot-3" />
      </span>
      {text ? <span className="text-sm text-muted">{text}…</span> : null}
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2f8b66;
          animation: typingDots 1.4s infinite ease-in-out both;
        }
        .typing-dot-1 { animation-delay: 0s; }
        .typing-dot-2 { animation-delay: 0.18s; }
        .typing-dot-3 { animation-delay: 0.36s; }
        @keyframes typingDots {
          0%, 60%, 100% { transform: translateY(0) scale(0.7); opacity: 0.35; }
          30% { transform: translateY(-5px) scale(1.15); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .typing-dot { animation: none; opacity: 0.7; }
        }
      `}</style>
    </span>
  );
}