/** Loading state while calm music tracks are fetched. */
export default function CalmMusicLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" aria-hidden="true" />
        <span className="text-sm font-medium text-body">Loading calming sounds…</span>
      </div>
    </div>
  );
}
