"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Trash2 } from "lucide-react";
import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ListeningHistory } from "@/components/music/ListeningHistory";
import { useAuth } from "@/hooks/useAuth";
import { aiHistoryApi } from "@/lib/api/extras";
import type { AiConversationSummary } from "@/lib/api/ai";

export default function AiHistoryPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <div className="space-y-5">
          <PageHeader title="AI history" subtitle="Your saved conversations — private and deletable." />
          <AiHistoryList />
          <ListeningHistory />
          <p className="text-sm"><Link href="/ai" className="font-medium text-primary-700 hover:underline">Back to the AI companion</Link></p>
        </div>
      </DashboardShell>
    </MemberGuard>
  );
}

function AiHistoryList() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<AiConversationSummary[]>([]);
  useEffect(() => {
    if (!accessToken) return;
    aiHistoryApi.list(accessToken).then(setItems, () => undefined);
  }, [accessToken]);
  const remove = async (id: number) => {
    if (!accessToken) return;
    setItems((prev) => prev.filter((c) => c.id !== id));
    try { await aiHistoryApi.remove(accessToken, id); } catch { /* reload on failure */ }
  };
  if (items.length === 0) return <p className="rounded-3xl border border-border-soft bg-surface p-5 text-sm text-muted">No saved conversations yet.</p>;
  return (
    <section aria-label="Saved conversations" className="rounded-3xl border border-border-soft bg-surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-heading"><History className="size-4 text-primary-600" aria-hidden="true" />Saved conversations</h2>
      <ul className="mt-3 divide-y divide-border-soft">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="truncate text-sm text-heading">{c.title || `Conversation ${c.id}`}</span>
            <button type="button" onClick={() => void remove(c.id)} aria-label={`Delete conversation ${c.id}`} className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"><Trash2 className="size-4" aria-hidden="true" /></button>
          </li>
        ))}
      </ul>
    </section>
  );
}
