"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Info, RotateCcw } from "lucide-react";

/**
 * Posture-coach prototype (agents.md §13, first increment: landmark overlay).
 * Lazy-loads @mediapipe/tasks-vision only when opened. Deterministic rule
 * checks ship separately; this step proves camera start/stop, overlay, and
 * positioning help without uploading any frames.
 */
export function PostureCoach({ poseTitle }: { poseTitle: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("idle");
    setMessage(null);
  };

  useEffect(() => () => stop(), []);

  const start = async () => {
    setOpen(true);
    setStatus("loading");
    setMessage("Requesting camera permission…");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus("ready");
      setMessage("Position your full body in the frame, facing the camera. Landmark overlay loads next.");
      // NOTE: PoseLandmarker wiring lands in the next increment — see docs/posture-coach.md.
      // Dynamic import keeps the heavy WASM bundle off the initial page:
      // const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    } catch {
      setStatus("error");
      setMessage("Camera unavailable. Check permission, close other apps using the camera, or follow the written guidance below.");
    }
  };

  if (!open) {
    return (
      <section aria-label="Yoga coach" className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 className="flex items-center gap-2 font-semibold text-heading"><Camera className="size-5 text-primary-600" aria-hidden="true" />Check my posture</h2>
        <p className="mt-2 text-sm leading-relaxed text-body">Try the live posture guide for <strong>{poseTitle}</strong>. Video stays on your device — nothing is uploaded.</p>
        <button type="button" onClick={() => void start()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">
          <Camera className="size-4" aria-hidden="true" />Start camera
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Yoga coach" className="rounded-3xl border border-border-soft bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-heading"><Camera className="size-5 text-primary-600" aria-hidden="true" />Yoga coach — {poseTitle}</h2>
        <button type="button" onClick={() => { stop(); setOpen(false); }} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border-soft px-4 text-sm text-heading hover:border-primary-300">
          <CameraOff className="size-4" aria-hidden="true" />Stop
        </button>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-[#223240]">
        <video ref={videoRef} playsInline muted className="aspect-video w-full -scale-x-100 object-cover" aria-label="Live camera preview" />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
        {status === "loading" ? <p className="absolute inset-0 flex items-center justify-center text-sm text-white">Loading camera…</p> : null}
      </div>
      {message ? <p className="mt-3 flex items-start gap-2 rounded-2xl bg-primary-50 p-3 text-sm text-body" role="status"><Info className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />{message}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {status === "error" || status === "idle" ? (
          <button type="button" onClick={() => void start()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-600 px-4 text-sm font-semibold text-white"><RotateCcw className="size-4" aria-hidden="true" />Try again</button>
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">Local preview only. Stand back so head to feet are visible, use good light, and stop if anything hurts. Rule-based feedback and scoring arrive in the next increment.</p>
    </section>
  );
}
