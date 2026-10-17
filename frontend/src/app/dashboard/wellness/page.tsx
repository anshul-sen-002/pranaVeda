"use client";

import { useEffect, useState } from "react";
import { Save, Sparkles } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import {
  type Difficulty,
  type HeightUnit,
  type PracticeTime,
  type WeightUnit,
  type WellnessProfileRequest,
} from "@/lib/api/types";
import { cn } from "@/lib/cn";

const EXPERIENCE: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const PRACTICE_TIMES: PracticeTime[] = ["MORNING", "AFTERNOON", "EVENING", "FLEXIBLE"];
const inputCls =
  "h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none";

export default function WellnessPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <WellnessView />
      </DashboardShell>
    </MemberGuard>
  );
}

function WellnessView() {
  const { accessToken } = useAuth();
  const [form, setForm] = useState<WellnessProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    meApi
      .wellnessProfile(accessToken)
      .then((p) =>
        setForm({
          dateOfBirth: p.dateOfBirth,
          heightValue: p.heightValue,
          heightUnit: p.heightUnit,
          weightValue: p.weightValue,
          weightUnit: p.weightUnit,
          experienceLevel: p.experienceLevel,
          preferredSessionMinutes: p.preferredSessionMinutes,
          practiceTime: p.practiceTime,
          sleepQuality: p.sleepQuality,
          energyLevel: p.energyLevel,
          moodScore: p.moodScore,
          flexibilityScore: p.flexibilityScore,
          timezone: p.timezone,
          constraintsNotes: p.constraintsNotes,
          aiPersonalizationConsent: p.aiPersonalizationConsent,
        }),
      )
      .catch(() => {
        // 404 = no profile yet; keep the empty form.
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const set = <K extends keyof WellnessProfileRequest>(key: K, value: WellnessProfileRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await meApi.saveWellnessProfile(accessToken, form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-5">
      <PageHeader title="Wellness profile" subtitle="Everything is optional and stays private to you." />
      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border-soft bg-surface p-5">
        {error ? <p className="rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        {saved ? <p className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">Profile saved.</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth">
            <input type="date" value={form.dateOfBirth ?? ""} onChange={(e) => set("dateOfBirth", e.target.value || null)} className={inputCls} />
          </Field>
          <Field label="Experience level">
            <select value={form.experienceLevel ?? ""} onChange={(e) => set("experienceLevel", (e.target.value || null) as Difficulty | null)} className={inputCls}>
              <option value="">Prefer not to say</option>
              {EXPERIENCE.map((d) => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
            </select>
          </Field>
          <Field label="Height">
            <div className="flex gap-2">
              <input type="number" step="0.1" min="1" value={form.heightValue ?? ""} onChange={(e) => set("heightValue", num(e.target.value))} className={cn(inputCls, "flex-1")} placeholder="170" />
              <select value={form.heightUnit ?? "CM"} onChange={(e) => set("heightUnit", e.target.value as HeightUnit)} className={cn(inputCls, "w-24")}>
                <option value="CM">cm</option>
                <option value="IN">in</option>
              </select>
            </div>
          </Field>
          <Field label="Weight">
            <div className="flex gap-2">
              <input type="number" step="0.1" min="1" value={form.weightValue ?? ""} onChange={(e) => set("weightValue", num(e.target.value))} className={cn(inputCls, "flex-1")} placeholder="65" />
              <select value={form.weightUnit ?? "KG"} onChange={(e) => set("weightUnit", e.target.value as WeightUnit)} className={cn(inputCls, "w-24")}>
                <option value="KG">kg</option>
                <option value="LB">lb</option>
              </select>
            </div>
          </Field>
          <Field label="Preferred session length (minutes)">
            <input type="number" min="5" max="240" value={form.preferredSessionMinutes ?? ""} onChange={(e) => set("preferredSessionMinutes", num(e.target.value))} className={inputCls} placeholder="20" />
          </Field>
          <Field label="Usual practice time">
            <select value={form.practiceTime ?? ""} onChange={(e) => set("practiceTime", (e.target.value || null) as PracticeTime | null)} className={inputCls}>
              <option value="">Flexible</option>
              {PRACTICE_TIMES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-heading">How you feel (1 = low, 5 = high)</legend>
          <div className="grid gap-4 sm:grid-cols-4">
            {([["sleepQuality", "Sleep"], ["energyLevel", "Energy"], ["moodScore", "Mood"], ["flexibilityScore", "Flexibility"]] as const).map(([key, label]) => (
              <Field key={key} label={label}>
                <input type="number" min="1" max="5" value={form[key] ?? ""} onChange={(e) => set(key, num(e.target.value))} className={inputCls} />
              </Field>
            ))}
          </div>
        </fieldset>

        <Field label="Injuries or constraints (optional)">
          <textarea rows={3} value={form.constraintsNotes ?? ""} onChange={(e) => set("constraintsNotes", e.target.value || null)} placeholder="e.g. sensitive left knee" className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-heading focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none" />
        </Field>

        <label className="flex items-start gap-3 rounded-2xl bg-primary-50 p-4">
          <input type="checkbox" checked={form.aiPersonalizationConsent ?? false} onChange={(e) => set("aiPersonalizationConsent", e.target.checked)} className="mt-0.5 size-4 accent-primary-600" />
          <span className="text-sm leading-relaxed text-body">
            <span className="inline-flex items-center gap-1 font-medium text-heading"><Sparkles className="size-4 text-primary-600" aria-hidden="true" /> Let the AI use my profile to personalise suggestions.</span>
            <span className="mt-1 block text-xs text-muted">Only relevant fields are ever sent, and you can turn this off anytime.</span>
          </span>
        </label>

        <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-6 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Save className="size-4 animate-pulse" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-heading">{label}</span>
      {children}
    </label>
  );
}