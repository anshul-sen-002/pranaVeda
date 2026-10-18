"use client";
import { useRef, useState } from "react";
import { CheckCircle2, CloudUpload, FileImage, FileMusic, FileVideo, Loader2, X } from "lucide-react";
import { adminMediaApi, MEDIA_LIMITS, type MediaUploadKind } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { MediaDto } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function humanBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}
const KIND_META: Record<MediaUploadKind, { label: string; Icon: typeof FileImage; hint: string }> = {
  CONTENT_IMAGE: { label: "Images", Icon: FileImage, hint: "jpg, png, webp, avif" },
  VIDEO: { label: "Videos", Icon: FileVideo, hint: "mp4, webm, mov" },
  AUDIO: { label: "Audios", Icon: FileMusic, hint: "mp3, m4a, ogg, wav" },
};
interface PendingFile {
  key: string; file: File; previewUrl: string | null;
  status: "ready" | "uploading" | "done" | "error";
  progress: number; media?: MediaDto; error?: string;
}
