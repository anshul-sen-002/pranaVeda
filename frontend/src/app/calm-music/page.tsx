import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { MusicView } from "@/components/music/MusicView";

export const metadata: Metadata = {
  title: "Calm Music | PranaVeda",
  description: "Relax your mind with curated meditation, sleep, focus, and nature sounds.",
};

export default function CalmMusicPage() {
  return (
    <AppShell>
      <MusicView />
    </AppShell>
  );
}
