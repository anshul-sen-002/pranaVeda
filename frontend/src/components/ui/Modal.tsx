"use client";

import { useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showExternalLink?: boolean;
  width?: string;
  height?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  showExternalLink = true,
  width = "max-w-[700px]",
  height = "max-h-[90vh]",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-50 w-full rounded-3xl border border-white/60 bg-white shadow-2xl flex flex-col animate-[fade-in-up_0.4s_cubic-bezier(0.22,1,0.36,1)_both]",
          width,
          height
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/40 bg-white/80 rounded-t-3xl">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-heading">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {showExternalLink && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:bg-primary-50 hover:text-heading transition-colors"
                aria-label="Open in new tab"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:bg-primary-50 hover:text-heading transition-colors"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="border-t border-white/40 bg-white/80 rounded-b-3xl px-6 py-4 flex items-center justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
/** Reusable left-panel item: icon + title + description + status badge */
export function ModalListItem({
  icon: Icon,
  title,
  description,
  status,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "incomplete";
  onClick?: () => void;
  className?: string;
}) {
  const statusConfig = {
    completed: {
      label: "Completed",
      color: "text-success bg-success/10 border-success/20",
      icon: <span className="size-4 text-success">✓</span>,
    },
    "in-progress": {
      label: "In progress",
      color: "text-warning bg-warning/10 border-warning/20",
      icon: (
        <span className="flex size-4 items-center justify-center rounded-full bg-amber-400 text-white">
          <span className="size-2.5 animate-spin">↻</span>
        </span>
      ),
    },
    incomplete: {
      label: "Incomplete",
      color: "text-danger bg-danger/10 border-danger/20",
      icon: <span className="size-4 text-danger">✗</span>,
    },
  }[status];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 transition-colors cursor-pointer",
        "hover:bg-primary-50 hover:border-primary-200",
        className
      )}
    >
      <div className="shrink-0 rounded-lg bg-primary-50 p-1.5 text-primary-600">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-heading">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
            statusConfig.color
          )}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
}

/** Reusable right-panel integration card: icon + title + description + toggle + status + settings */
export function ModalIntegrationCard({
  icon: Icon,
  title,
  description,
  connected,
  onToggle,
  onSettings,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  connected: boolean;
  onToggle?: () => void;
  onSettings?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="shrink-0 rounded-lg bg-primary-50 p-1.5 text-primary-600">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-heading">{title}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={connected}
            onChange={onToggle}
            aria-label={`Toggle ${title} connection`}
          />
          <span className={cn(
            "inline-block size-4 rounded-full border-2 transition-colors",
            connected
              ? "border-success bg-success"
              : "border-border-soft bg-white peer-checked:border-success peer-checked:bg-success"
          )} />
        </label>
        <span className={`text-xs font-medium ${connected ? "text-success" : "text-muted"}`}>
          {connected ? "Connected" : "Not Connected"}
        </span>
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            className="p-1.5 rounded-lg text-muted hover:bg-primary-50 hover:text-heading transition-colors"
            aria-label={`Settings for ${title}`}
          >
            <span className="size-3">⚙</span>
          </button>
        )}
      </div>
    </div>
  );
}