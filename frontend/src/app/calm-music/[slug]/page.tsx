import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackDetailView } from "@/components/music/TrackDetailView";
import { AppShell } from "@/components/layout/AppShell";
import { audioApi } from "@/lib/api/audio";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const track = await audioApi.bySlug(slug).catch(() => null);
  if (!track) return { title: "Not found | PranaVeda" };
  return { title: `${track.title} | Calm Music`, description: track.description ?? undefined };
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = await audioApi.bySlug(slug).catch(() => null);
  if (!track) notFound();
  return (
    <AppShell quote="Good music soothes the mind, heals the heart.">
      <TrackDetailView track={track} />
    </AppShell>
  );
}
