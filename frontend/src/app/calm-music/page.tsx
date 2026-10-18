import { AppShell } from "@/components/layout/AppShell";
import { MusicView } from "@/components/music/MusicView";

export default function CalmMusicPage() {
  return (
    <AppShell quote="Good music soothes the mind, heals the heart.">
      <MusicView />
    </AppShell>
  );
}
