"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  AlertTriangle,
} from "lucide-react";

import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import type { ContentStep } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const SLIDE_INTERVAL_MS = 3000;

interface StepTutorialProps {
  steps: ContentStep[];
  poseTitle: string;
}

function getMediaTypeLabel(type: ContentStep["mediaType"]): string {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "AUDIO":
      return "Audio";
    default:
      return "Images";
  }
}

function getMediaTypeIcon(type: ContentStep["mediaType"]) {
  switch (type) {
    case "VIDEO":
      return <VideoIcon className="size-5" aria-hidden="true" />;
    case "AUDIO":
      return <Music className="size-5" aria-hidden="true" />;
    default:
      return <ImageIcon className="size-5" aria-hidden="true" />;
  }
}

export function StepTutorial({ steps, poseTitle }: StepTutorialProps) {
  const speech = useSpeechSynthesis();
  const total = steps.length;

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [narratingStep, setNarratingStep] = useState<number | null>(null);

  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechSession = useRef(0);

  const currentStep = steps[Math.min(stepIndex, total - 1)];
  const images =
    currentStep?.mediaType === "IMAGE" && currentStep.imageUrls
      ? currentStep.imageUrls
      : currentStep?.imageUrl
        ? [currentStep.imageUrl]
        : [];
  const currentImage = images[Math.min(slideIndex, images.length - 1)];

  const stepChanged = useRef(stepIndex);

  const resetSlideTimer = useCallback(() => {
    if (slideTimer.current) {
      clearTimeout(slideTimer.current);
      slideTimer.current = null;
    }
    if (
      active &&
      currentStep?.mediaType === "IMAGE" &&
      images.length > 1 &&
      stepIndex < total - 1
    ) {
      slideTimer.current = setTimeout(() => {
        setSlideIndex((prev) => (prev + 1 >= images.length ? 0 : prev + 1));
      }, SLIDE_INTERVAL_MS);
    }
  }, [active, currentStep?.mediaType, images.length, stepIndex, total]);

  useEffect(() => {
    if (stepChanged.current !== stepIndex) {
      stepChanged.current = stepIndex;
      setSlideIndex(0);
      resetSlideTimer();
    }
  }, [stepIndex, resetSlideTimer]);

  useEffect(() => {
    if (!active || !currentStep?.instruction) return;
    const session = ++speechSession.current;
    setIsSpeaking(true);
    speech.speak(currentStep.instruction, {
      onEnd: () => {
        if (session === speechSession.current) {
          setIsSpeaking(false);
          // Auto-advance to the next step when narration finishes.
          if (stepIndex < total - 1) {
            setTimeout(() => {
              if (speechSession.current === session) {
                setStepIndex((prev) => Math.min(prev + 1, total - 1));
                setSlideIndex(0);
              }
            }, 400);
          }
        }
      },
    });
    return () => {
      speechSession.current += 1;
      setIsSpeaking(false);
    };
  }, [active, currentStep?.instruction, speech]);

  // Per-step cap: a step may run at most 2 minutes, then advance automatically.
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      if (stepIndex < total - 1) {
        setStepIndex((prev) => Math.min(prev + 1, total - 1));
        setSlideIndex(0);
        speech.cancel();
        setIsSpeaking(false);
      }
    }, 120000);
    return () => clearTimeout(timer);
  }, [active, stepIndex, total, speech]);

  const togglePlay = useCallback(() => {
    if (!active) {
      setActive(true);
      setStepIndex(0);
      setSlideIndex(0);
    } else {
      speech.cancel();
      setIsSpeaking(false);
      setActive(false);
    }
    if (slideTimer.current) {
      clearTimeout(slideTimer.current);
      slideTimer.current = null;
    }
  }, [active, speech]);

  const nextStep = useCallback(() => {
    if (stepIndex >= total - 1) return;
    setSlideIndex(0);
    setStepIndex((prev) => prev + 1);
    speech.cancel();
    setIsSpeaking(false);
    if (slideTimer.current) {
      clearTimeout(slideTimer.current);
      slideTimer.current = null;
    }
  }, [stepIndex, total, speech]);

  useEffect(() => {
    return () => {
      if (slideTimer.current) clearTimeout(slideTimer.current);
      speech.cancel();
    };
  }, [speech]);

  if (total === 0) return null;

  const isLastStep = stepIndex >= total - 1;
  const isLastImage =
    currentStep?.mediaType === "IMAGE" &&
    images.length > 0 &&
    slideIndex >= images.length - 1;

  const mediaType = currentStep?.mediaType ?? "IMAGE";
  const isVideo = mediaType === "VIDEO" && !!currentStep?.videoUrl;
  const isAudio = mediaType === "AUDIO" && !!currentStep?.audioUrl;
  const isImage = mediaType === "IMAGE" && images.length > 0;

  return (
    <div className="space-y-5">
      {!active ? (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label={`Step-by-step guide for ${poseTitle}`}
          className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_18px_44px_-38px_rgba(29,63,46,.45)] sm:rounded-3xl"
        >
          <header className="flex flex-col gap-3 border-b border-border-soft bg-gradient-gourd-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-heading sm:text-xl">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700">{getMediaTypeIcon(steps[0]?.mediaType ?? "IMAGE")}</span>
                Step-by-step guide
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                Follow each step at your own pace. {speech.supported ? "Play narration using your device’s voice." : "Read each instruction at your own pace."}
              </p>
            </div>
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 sm:self-center"
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              Play full guide <span className="text-xs font-medium text-white/75">({total} {total === 1 ? "step" : "steps"})</span>
            </button>
          </header>

          <ol className="divide-y divide-border-soft">
            {steps.map((item, index) => {
              const image = item.coverImageUrl ?? item.imageUrl ?? item.imageUrls?.[0] ?? null;
              const points = (item.instruction ?? "").split(/\n+|(?<=[.!?])\s+/).map((line) => line.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
              const isNarrating = narratingStep === index && speech.speaking;
              return (
                <li key={item.id} className="grid min-w-0 gap-3 p-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:p-4">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-primary-50 sm:aspect-[4/3]">
                    {item.mediaType === "VIDEO" && item.videoUrl ? (
                      <video src={item.videoUrl} poster={image ?? undefined} controls playsInline preload="metadata" className="h-full w-full object-cover" aria-label={`${poseTitle}, step ${index + 1}`} />
                    ) : image ? (
                      <img src={image} alt={`${poseTitle}, step ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary-500">{getMediaTypeIcon(item.mediaType)}</div>
                    )}
                  </div>

                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-heading">{item.caption?.trim() || `Step ${index + 1}`}</h3>
                      {points.length > 0 ? (
                        <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-body sm:text-sm">
                          {points.map((point, pointIndex) => <li key={`${item.id}-${pointIndex}`} className="flex items-start gap-2"><span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-primary-500" aria-hidden="true" /><span>{point}</span></li>)}
                        </ul>
                      ) : <p className="mt-1.5 text-xs text-muted">Follow the pose image and move gently into position.</p>}
                      {item.mediaType === "AUDIO" && item.audioUrl ? <audio src={item.audioUrl} controls preload="metadata" className="mt-2 h-9 w-full max-w-sm" aria-label={`Audio for step ${index + 1}`} /> : null}
                    </div>
                  </div>

                  {item.instruction?.trim() && speech.supported ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isNarrating) {
                          speech.cancel();
                          setNarratingStep(null);
                        } else {
                          setNarratingStep(index);
                          speech.speak(item.instruction ?? "", { onEnd: () => setNarratingStep(null) });
                        }
                      }}
                      aria-label={`${isNarrating ? "Stop" : "Play"} narration for step ${index + 1}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 justify-self-end rounded-full border border-primary-200 bg-primary-50/60 px-4 text-xs font-semibold text-primary-800 transition-colors hover:border-primary-300 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 sm:min-w-32"
                    >
                      {isNarrating ? <Pause className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
                      {isNarrating ? "Stop narration" : "Play narration"}
                    </button>
                  ) : <span className="hidden sm:block" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </motion.section>
      ) : null}

      {active ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mt-6 flex flex-col gap-0 rounded-3xl border border-border-soft bg-surface overflow-hidden"
    >
      <div className="relative aspect-[16/9] w-full bg-primary-50 overflow-hidden">
        {currentStep?.coverImageUrl ? (
          <motion.img
            src={currentStep.coverImageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary-100">
            <div className="flex flex-col items-center gap-2 text-primary-300">
              {getMediaTypeIcon(mediaType)}
              <span className="text-sm font-medium text-heading">
                {getMediaTypeLabel(mediaType)} step {stepIndex + 1}
              </span>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1">
          <span className="text-xs font-semibold text-white">
            {getMediaTypeLabel(mediaType)}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className="h-full bg-primary-600 transition-all duration-300 ease-out"
            style={{ width: `${((stepIndex) / Math.max(total - 1, 1)) * 100}%` }}
          />
        </div>
        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1.5">
          <span className="text-xs font-semibold text-white">
            Step {stepIndex + 1} of {total}
          </span>
        </div>
      </div>

      {currentStep?.caption && (
        <div className="px-6 py-3 text-sm text-muted border-b border-border-soft/50 bg-surface/50">
          <p className="leading-relaxed">{currentStep.caption}</p>
        </div>
      )}

      <div className="px-6 py-6 bg-surface/30">
        {isVideo && currentStep?.videoUrl ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
            <video
              src={currentStep.videoUrl}
              controls
              playsInline
              className="h-full w-full object-cover"
              poster={currentStep.coverImageUrl ?? undefined}
            />
          </div>
        ) : isAudio && currentStep?.audioUrl ? (
          <div className="rounded-2xl border border-border-soft bg-black/10 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Music className="size-5 text-primary-600" aria-hidden="true" />
              <div className="flex-1">
                <div className="text-sm font-medium text-heading truncate">
                  {currentStep.caption ?? "Audio guidance"}
                </div>
                <div className="text-xs text-muted truncate">
                  {poseTitle} · Step {stepIndex + 1}
                </div>
              </div>
              <audio
                src={currentStep.audioUrl}
                controls
                className="w-full"
                preload="metadata"
              />
            </div>
          </div>
        ) : isImage && currentImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-primary-100 shadow-sm"
          >
            <motion.img
              src={currentImage}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {images.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: i === slideIndex ? 1 : 0.75 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === slideIndex ? "bg-primary-600" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 z-10 text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded">
                {slideIndex + 1} / {images.length}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-soft bg-primary-50">
            <AlertTriangle className="size-6 text-primary-400 mb-2" aria-hidden="true" />
            <p className="text-sm text-muted">
              No media available for this step.
            </p>
          </div>
        )}
      </div>

      {currentStep?.instruction && (
        <div className="px-6 py-4 border-b border-border-soft/50 bg-surface/40">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 shrink-0">
              <Volume2 className="size-4" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-heading">
                {currentStep.instruction}
              </p>
              {isSpeaking && speech.supported && (
                <p className="mt-1 text-xs text-primary-600 flex items-center gap-1">
                  <span className="relative h-1 w-2 rounded-full bg-primary-200 animate-pulse" />
                  Speaking…
                </p>
              )}
              {!speech.supported && (
                <p className="mt-1 text-xs text-muted">
                  Voice narration not supported on this browser — read the text
                  above instead.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-5 bg-gradient-to-t from-surface/90 via-surface to-transparent border-t border-border-soft/60 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isSpeaking ? "Pause narration" : "Resume narration"}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95",
                isSpeaking && "bg-primary-700",
              )}
            >
              {isSpeaking ? (
                <>
                  <Pause className="size-4" aria-hidden="true" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="size-4" aria-hidden="true" />
                  Resume
                </>
              )}
            </button>
            {!isLastStep || (isImage && !isLastImage && images.length > 1) ? (
              <button
                type="button"
                onClick={() => {
                  if (isImage && images.length > 1 && !isLastImage) {
                    setSlideIndex((prev) =>
                      prev + 1 >= images.length ? 0 : prev + 1,
                    );
                  } else {
                    nextStep();
                  }
                }}
                aria-label="Next step"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-5 py-2.5 text-sm font-semibold text-heading shadow-sm hover:bg-primary-50 hover:text-primary-700 transition-all active:scale-95",
                )}
              >
                <SkipForward className="size-4" aria-hidden="true" />
                {isImage && images.length > 1 && !isLastImage
                  ? "Next image"
                  : "Next step"}
              </button>
            ) : null}
          </div>

          {isLastStep && isLastImage && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
              <span className="text-primary-600" aria-hidden="true">
                ✓
              </span>
              Tutorial complete
            </div>
          )}
        </div>
      </div>
    </motion.div>
      ) : null}
    </div>
  );
}
