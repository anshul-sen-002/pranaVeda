"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { notificationsApi, type NotificationDto } from "@/lib/api/extras";
import { cn } from "@/lib/cn";

/** Bell with unread badge + dropdown. Member-only; hidden when anonymous. */
export function NotificationBell() {
  const { status, accessToken } = useAuth();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;
    notificationsApi.unreadCount(accessToken).then(
      (r) => setCount(r.unreadCount),
      () => undefined,
    );
  }, [status, accessToken]);
  const load = async () => {
    if (!accessToken) return;
    try {
      setItems(await notificationsApi.list(accessToken));
    } catch { /* noop */ }
  };
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void load();
  };
  const markAll = async () => {
    if (!accessToken) return;
    try {
      const r = await notificationsApi.markAllRead(accessToken);
      setCount(r.unreadCount);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* noop */ }
  };
  if (status !== "authenticated") return null;
  return (
    <div className="relative">
      <button type="button" onClick={toggle} aria-label={`Notifications${count ? `, ${count} unread` : ""}`} aria-expanded={open} className="relative inline-flex size-10 items-center justify-center rounded-full text-body hover:bg-primary-50 hover:text-primary-700">
        <Bell className="size-5" aria-hidden="true" />
        {count > 0 ? <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">{count > 9 ? "9+" : count}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-xl" role="dialog" aria-label="Notifications">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold text-heading">Notifications</p>
            <button type="button" onClick={() => void markAll()} className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"><CheckCheck className="size-3.5" aria-hidden="true" />Mark all read</button>
          </div>
          <ul className="max-h-80 divide-y divide-border-soft overflow-y-auto">
            {items.length === 0 ? <li className="px-4 py-6 text-center text-sm text-muted">All caught up.</li> : items.slice(0, 10).map((n) => (
              <li key={n.id} className={cn("px-4 py-3", !n.read && "bg-primary-50/60")}>
                {n.actionUrl ? <Link href={n.actionUrl} className="block"><span className="block text-sm font-medium text-heading">{n.title}</span><span className="mt-0.5 block text-xs text-muted">{n.body}</span></Link>
                : <><span className="block text-sm font-medium text-heading">{n.title}</span><span className="mt-0.5 block text-xs text-muted">{n.body}</span></>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
