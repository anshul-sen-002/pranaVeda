"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Sparkles, Trash2 } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { adminContentApi, adminStepApi } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { ContentStep, ContentStatus } from "@/lib/api/types";

/**
 * Guided-step editor: upload ordered images through the Cloudinary pipeline,
 * review/edit narration (AI drafts included), reorder, and publish.
 * Publication is re-validated server-side - every step must have text.
 */
export default function AdminStepsPage() {
  return (
    <AdminGuard>
      <StepsEditor />
    </AdminGuard>
  );
}

function StepsEditor() {
  const { accessToken } = useAuth();
  const params = useParams<{ id: string }>();
  const contentId = params.id;

  const [steps, setSteps] = useState<ContentStep[]>([]);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Upload form state.
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Inline editing: step id -> draft narration text.
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fail = (e: unknown) =>
    setError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [detail, list] = await Promise.all([
        adminContentApi.get(accessToken, contentId),
        adminStepApi.list(accessToken, contentId),
      ]);
      setTitle(detail.summary.title);
      setStatus(detail.summary.status);
      setSteps(list);
      setDrafts(Object.fromEntries(list.map((s) => [s.id, s.instruction ?? ""])));
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, contentId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const uploadStep = () =>
    run(async () => {
      if (!accessToken || !file) return;
      await adminStepApi.add(accessToken, contentId, file, caption);
      setFile(null);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      setNotice("Image added.");
      await refresh();
    });

  const saveInstruction = (stepId: number) =>
    run(async () => {
      if (!accessToken) return;
      const updated = await adminStepApi.update(accessToken, contentId, stepId, {
        instruction: drafts[stepId] ?? "",
      });
      setSteps((prev) => prev.map((s) => (s.id === stepId ? updated : s)));
      setNotice("Narration saved.");
    });

  const generate = (overwrite: boolean) =>
    run(async () => {
      if (!accessToken) return;
      const list = await adminStepApi.generate(accessToken, contentId, { overwrite });
      setSteps(list);
      setDrafts(Object.fromEntries(list.map((s) => [s.id, s.instruction ?? ""])));
      setNotice(
        overwrite
          ? "AI drafts regenerated for every step - review before publishing."
          : "AI filled the steps that had no text - review before publishing.",
      );
    });

  const move = (index: number, delta: number) =>
    run(async () => {
      if (!accessToken) return;
      const target = index + delta;
      if (target < 0 || target >= steps.length) return;
      const next = [...steps];
      [next[index], next[target]] = [next[target], next[index]];
      setSteps(next); // optimistic; server persists the authoritative order
      await adminStepApi.reorder(accessToken, contentId, next.map((s) => s.id));
    });

  const remove = (stepId: number) =>
    run(async () => {
      if (!accessToken) return;
      await adminStepApi.remove(accessToken, contentId, stepId);
      setConfirmDelete(null);
      setNotice("Step removed.");
      await refresh();
    });

  const publish = () =>
    run(async () => {
      if (!accessToken) return;
      await adminContentApi.publish(accessToken, contentId);
      setStatus("PUBLISHED");
      setNotice("Published. The guided practice is now live.");
    });

  const unpublish = () =>
    run(async () => {
      if (!accessToken) return;
      await adminContentApi.unpublish(accessToken, contentId);
      setStatus("DRAFT");
      setNotice("Unpublished - now visible only in the studio.");
    });


  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading steps…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Guided steps</p>
          <h1 className="text-2xl font-bold text-heading">{title}</h1>
        </div>
        <span
          className={
            "rounded-full px-3 py-1 text-xs font-medium " +
            (status === "PUBLISHED" ? "bg-success/10 text-success" : "bg-surface-tint text-muted")
          }
        >
          {status ?? "DRAFT"}
        </span>
      </header>

      <div className="mt-4 space-y-3">
        {error ? <Alert>{error}</Alert> : null}
        {notice ? <Alert tone="success">{notice}</Alert> : null}
      </div>

      {/* Upload one image as the next ordered step. */}
      <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
          <ImagePlus className="size-5 text-primary-600" aria-hidden="true" />
          Add a step image
        </h2>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-heading">Image</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-tint file:px-4 file:py-2 file:text-sm file:font-medium file:text-heading"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-heading">Caption (optional)</span>
            <input
              type="text"
              value={caption}
              maxLength={300}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Shift your weight onto your left foot"
              className="h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
            />
          </label>
          <Button onClick={uploadStep} loading={busy} disabled={!file}>
            Upload step
          </Button>
        </div>
      </section>

      {/* AI narration drafts for admin review (OpenRouter, server-side key). */}
      <section className="mt-6 rounded-2xl border border-border-soft bg-surface p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
          <Sparkles className="size-5 text-primary-600" aria-hidden="true" />
          AI narration
        </h2>
        <p className="mt-1 text-sm text-muted">
          Generates short, beginner-friendly text (posture, breathing, safety) for each
          step. Always review and edit before publishing - publication requires text on
          every step.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => generate(false)} loading={busy} disabled={steps.length === 0}>
            Fill missing steps
          </Button>
          <Button variant="secondary" size="sm" onClick={() => generate(true)} loading={busy} disabled={steps.length === 0}>
            Regenerate all
          </Button>
        </div>
      </section>


      {/* Ordered steps: thumbnail, editable narration, reorder, delete. */}
      <section className="mt-6">
        <h2 className="text-base font-semibold text-heading">Steps ({steps.length})</h2>
        {steps.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border-soft bg-surface px-4 py-6 text-center text-sm text-muted">
            No steps yet. Upload an image above to start the guided sequence.
          </p>
        ) : (
          <ol className="mt-3 space-y-4">
            {steps.map((step, i) => (
              <li key={step.id} className="rounded-2xl border border-border-soft bg-surface p-4">
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.imageUrl}
                    alt={step.caption ?? `Step ${i + 1}`}
                    className="size-20 shrink-0 rounded-xl border border-border-soft object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-heading">Step {i + 1}</span>
                      {step.instructionSource === "AI" ? (
                        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                          AI draft
                        </span>
                      ) : step.instructionSource === "ADMIN" ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                          Edited
                        </span>
                      ) : null}
                      <span className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={busy || i === 0}
                          aria-label={`Move step ${i + 1} up`}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-border-soft text-muted hover:border-primary-300 hover:text-primary-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                        >
                          <ArrowUp className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={busy || i === steps.length - 1}
                          aria-label={`Move step ${i + 1} down`}
                          className="inline-flex size-8 items-center justify-center rounded-full border border-border-soft text-muted hover:border-primary-300 hover:text-primary-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                        >
                          <ArrowDown className="size-4" aria-hidden="true" />
                        </button>
                      </span>
                    </div>
                    {step.caption ? (
                      <p className="mt-1 truncate text-xs text-muted">{step.caption}</p>
                    ) : null}
                  </div>
                </div>


                <label className="mt-3 block text-sm">
                  <span className="mb-1.5 block font-medium text-heading">
                    Narration for this step
                  </span>
                  <textarea
                    value={drafts[step.id] ?? ""}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [step.id]: e.target.value }))}
                    rows={3}
                    maxLength={2000}
                    placeholder="What should the voice say? Posture guidance + breathing cue + safety note."
                    className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm leading-relaxed text-heading focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
                  />
                </label>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted">{(drafts[step.id] ?? "").length}/2000</span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        confirmDelete === step.id ? remove(step.id) : setConfirmDelete(step.id)
                      }
                      onBlur={() => setConfirmDelete((v) => (v === step.id ? null : v))}
                      aria-label={
                        confirmDelete === step.id
                          ? `Confirm deleting step ${i + 1}`
                          : `Delete step ${i + 1}`
                      }
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border-soft text-muted hover:border-danger/40 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => saveInstruction(step.id)}
                      loading={busy}
                    >
                      Save narration
                    </Button>
                  </span>
                </div>

                {confirmDelete === step.id ? (
                  <p className="mt-3 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
                    Delete this step and its image? Click the trash icon again to confirm.
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>


      {/* Publication - the approval gate; server re-checks narration text. */}
      <section className="mt-8 flex flex-wrap items-center gap-3 border-t border-border-soft pt-6">
        <Button
          onClick={publish}
          loading={busy}
          disabled={steps.length === 0 || status === "PUBLISHED"}
        >
          Publish
        </Button>
        {status === "PUBLISHED" ? (
          <Button variant="secondary" onClick={unpublish} loading={busy}>
            Unpublish
          </Button>
        ) : null}
        <p className="text-xs text-muted">
          Publishing requires narration on every step. Drafts are never visible to visitors.
        </p>
      </section>
    </main>
  );
}

