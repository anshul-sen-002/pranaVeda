import { AppShell } from "@/components/layout/AppShell";
import { AudioPlayerProvider } from "@/components/music/PlayerProvider";
import { MusicView } from "@/components/music/MusicView";

export default function CalmMusicPage() {
  return (
    <AudioPlayerProvider>
      <AppShell quote="Good music soothes the mind, heals the heart.">
        <MusicView />
      </AppShell>
    </AudioPlayerProvider>
  );
}
