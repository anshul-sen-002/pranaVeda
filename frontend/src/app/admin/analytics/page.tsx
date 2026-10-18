"use client";
import { BarChart3 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";

/** Aggregate analytics placeholder — backend ships no analytics endpoint yet. */
export default function AdminAnalyticsPage() {
  return (
    <AdminGuard>
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-heading"><BarChart3 className="size-5 text-primary-600" aria-hidden="true" />Analytics</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">Aggregate, privacy-respecting platform metrics will live here once the backend analytics endpoint lands (roadmap Phase 8). Private wellness records are never exposed to admin analytics.</p>
        <div className="mt-5 rounded-3xl border border-border-soft bg-surface p-6 text-sm text-muted">No analytics endpoint yet — showing an honest upcoming state instead of mock charts.</div>
      </main>
    </AdminGuard>
  );
}
