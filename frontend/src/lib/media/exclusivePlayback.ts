const registeredMedia = new Set<HTMLMediaElement>();

/** Pause all HTML audio/video elements, including detached player elements. */
export function pauseAllMedia(active?: HTMLMediaElement) {
  if (typeof document !== "undefined") {
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((element) => {
      if (element !== active) element.pause();
    });
  }
  registeredMedia.forEach((element) => {
    if (element !== active) element.pause();
  });
}

/** Register detached audio elements such as the persistent music player. */
export function registerExclusiveMedia(element: HTMLMediaElement) {
  registeredMedia.add(element);
  const onPlay = () => {
    pauseAllMedia(element);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
  element.addEventListener("play", onPlay);
  return () => {
    element.removeEventListener("play", onPlay);
    registeredMedia.delete(element);
  };
}

/** Install one capture listener for native video/audio controls across routes. */
export function installExclusivePlayback() {
  const onPlay = (event: Event) => {
    const element = event.target;
    if (!(element instanceof HTMLMediaElement)) return;
    pauseAllMedia(element);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };
  document.addEventListener("play", onPlay, true);
  return () => document.removeEventListener("play", onPlay, true);
}
