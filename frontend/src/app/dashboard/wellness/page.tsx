"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Sparkles, Download, Info } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import {
  BMI_DISCLAIMER,
  type Difficulty,
  type HeightUnit,
  type PracticeTime,
  type WeightUnit,
  type WellnessProfileRequest,
  type WellnessProfileDto,
} from "@/lib/api/types";

const EXPERIENCE: Difficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const PRACTICE_TIMES: PracticeTime[] = ["MORNING", "AFTERNOON", "EVENING", "FLEXIBLE"];

/** Shared class for native selects/textareas to match the Input component. */
const selectCls =
  "h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading transition-colors duration-200 " +
  "focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none sm:h-12 sm:text-base";

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
  const [profile, setProfile] = useState<WellnessProfileDto | null>(null);
  const [form, setForm] = useState<WellnessProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
    setLoading(true);
    meApi
      .wellnessProfile(accessToken)
      .then((p) => {
        setProfile(p);
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
        });
        setError(null);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null);
          setError(null);
        } else {
          setError(err instanceof ApiError ? err.message : "Could not load your profile.");
        }
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof WellnessProfileRequest>(
    key: K,
    value: WellnessProfileRequest[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));
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
      setTimeout(() => setSaved(false), 1800);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!accessToken) return;
    setError(null);
    try {
      await meApi.wellnessProfile(accessToken);
      setError("Profile exported — copy the values above for your records.");
      setTimeout(() => setError(null), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed.");
    }
  };

  const handleDelete = async () => {
    if (!accessToken) return;
    setDeleting(true);
    setConfirmDelete(false);
    try {
      await meApi.saveWellnessProfile(accessToken, {
        ...form,
        dateOfBirth: null,
        heightValue: null,
        heightUnit: null,
        weightValue: null,
        weightUnit: null,
        experienceLevel: null,
        preferredSessionMinutes: null,
        practiceTime: null,
        timezone: null,
        sleepQuality: null,
        energyLevel: null,
        moodScore: null,
        flexibilityScore: null,
        constraintsNotes: null,
        aiPersonalizationConsent: false,
      });
      setProfile(null);
      setForm({});
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not clear your profile.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted">Loading your wellness profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Wellness profile"
        subtitle="Everything is optional and stays private to you."
        action={
          <Button type="button" variant="secondary" size="sm" onClick={handleExport} disabled={deleting}>
            <Download className="size-3.5" aria-hidden="true" />
            Export
          </Button>
        }
      />
      {error ? <Alert tone="error">{error}</Alert> : null}
      {saved ? <Alert tone="success">Profile saved.</Alert> : null}
      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5 sm:p-6">

        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
            Your details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Date of birth"
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(e) => set("dateOfBirth", e.target.value || null)}
              hint="We derive your age from this — it is never stored separately."
            />
            <div>
              <label htmlFor="experience-level" className="mb-1.5 block text-sm font-semibold text-heading">
                Experience level
              </label>
              <select
                id="experience-level"
                value={form.experienceLevel ?? ""}
                onChange={(e) => set("experienceLevel", (e.target.value || null) as Difficulty | null)}
                className={selectCls}
              >
                <option value="">Prefer not to say</option>
                {EXPERIENCE.map((d) => (
                  <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <span id="height-label" className="mb-1.5 block text-sm font-semibold text-heading">Height</span>
              <div className="flex gap-2" role="group" aria-labelledby="height-label">
                <Input
                  label="Height value"
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.heightValue ?? ""}
                  onChange={(e) => set("heightValue", num(e.target.value))}
                  placeholder="170"
                  className="flex-1"
                />
                <div className="w-24 shrink-0">
                  <label htmlFor="height-unit" className="sr-only">Height unit</label>
                  <select
                    id="height-unit"
                    value={form.heightUnit ?? "CM"}
                    onChange={(e) => set("heightUnit", e.target.value as HeightUnit | null)}
                    className={selectCls}
                  >
                    <option value="CM">cm</option>
                    <option value="IN">in</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <span id="weight-label" className="mb-1.5 block text-sm font-semibold text-heading">Weight</span>
              <div className="flex gap-2" role="group" aria-labelledby="weight-label">
                <Input
                  label="Weight value"
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.weightValue ?? ""}
                  onChange={(e) => set("weightValue", num(e.target.value))}
                  placeholder="65"
                  className="flex-1"
                />
                <div className="w-24 shrink-0">
                  <label htmlFor="weight-unit" className="sr-only">Weight unit</label>
                  <select
                    id="weight-unit"
                    value={form.weightUnit ?? "KG"}
                    onChange={(e) => set("weightUnit", e.target.value as WeightUnit | null)}
                    className={selectCls}
                  >
                    <option value="KG">kg</option>
                    <option value="LB">lb</option>
                  </select>
                </div>
              </div>
            </div>
            <Input
              label="Preferred session length (minutes)"
              type="number"
              min={5}
              max={240}
              value={form.preferredSessionMinutes ?? ""}
              onChange={(e) => set("preferredSessionMinutes", num(e.target.value))}
              placeholder="20"
            />
            <div>
              <label htmlFor="practice-time" className="mb-1.5 block text-sm font-semibold text-heading">
                Usual practice time
              </label>
              <select
                id="practice-time"
                value={form.practiceTime ?? ""}
                onChange={(e) => set("practiceTime", (e.target.value || null) as PracticeTime | null)}
                className={selectCls}
              >
                <option value="">Flexible</option>
                {PRACTICE_TIMES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <Input
              label="Timezone"
              value={form.timezone ?? ""}
              onChange={(e) => set("timezone", e.target.value || null)}
              placeholder="e.g. Asia/Kolkata"
              hint="Used for streak day boundaries — never for any health reading."
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
            How you feel (1 = low, 5 = high)
          </legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {([
              ["sleepQuality", "Sleep"],
              ["energyLevel", "Energy"],
              ["moodScore", "Mood"],
              ["flexibilityScore", "Flexibility"],
            ] as const).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                type="number"
                min={1}
                max={5}
                value={form[key] ?? ""}
                onChange={(e) => set(key, num(e.target.value))}
              />
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="constraints" className="mb-1.5 block text-sm font-semibold text-heading">
            Injuries or constraints (optional)
          </label>
          <textarea
            id="constraints"
            rows={3}
            value={form.constraintsNotes ?? ""}
            onChange={(e) => set("constraintsNotes", e.target.value || null)}
            placeholder="e.g. sensitive left knee"
            className={selectCls + " h-auto py-2.5"}
          />
          <p className="mt-1.5 text-xs text-muted">
            Used to soften recommendations — never a diagnosis.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-primary-200 bg-primary-50 p-4">
          <input
            type="checkbox"
            checked={form.aiPersonalizationConsent ?? false}
            onChange={(e) => set("aiPersonalizationConsent", e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary-600"
          />
          <span className="text-sm leading-relaxed text-body">
            <span className="inline-flex items-center gap-1 font-medium text-heading">
              <Sparkles className="size-4 text-primary-600" aria-hidden="true" />
              Let the AI use my profile to personalise suggestions.
            </span>
            <span className="mt-1 block text-xs text-muted">
              Only relevant fields are ever sent, and you can turn this off anytime.
            </span>
          </span>
        </label>

        <Button type="submit" loading={saving} fullWidth className="sm:w-auto">
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>

      {profile ? (
        <section
          aria-labelledby="snapshot-heading"
          className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5 sm:p-6"
        >
          <h2 id="snapshot-heading" className="flex items-center gap-2 font-semibold text-heading">
            <Info className="size-4 text-primary-600" aria-hidden="true" />
            Your snapshot
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface-tint px-3.5 py-3">
              <dt className="text-xs text-muted">Age</dt>
              <dd className="mt-0.5 text-lg font-semibold text-heading">{profile.age ?? "—"}</dd>
            </div>
            <div className="rounded-2xl bg-surface-tint px-3.5 py-3">
              <dt className="text-xs text-muted">BMI</dt>
              <dd className="mt-0.5 text-lg font-semibold text-heading">
                {profile.bmiAvailable && profile.bmiOrNull != null ? profile.bmiOrNull : "—"}
              </dd>
            </div>
            <div className="rounded-2xl bg-surface-tint px-3.5 py-3">
              <dt className="text-xs text-muted">AI personalisation</dt>
              <dd className="mt-0.5 text-lg font-semibold text-heading">
                {profile.aiPersonalizationConsent ? "On" : "Off"}
              </dd>
            </div>
          </dl>
          {profile.bmiAvailable && profile.bmiOrNull != null ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">{BMI_DISCLAIMER}</p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Add your height and weight above to see a BMI estimate — always with its limits noted.
            </p>
          )}
        </section>
      ) : null}

      {profile ? (
        <section className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-heading">Delete your profile</h2>
              <p className="mt-1 max-w-md text-sm text-muted">
                Clearing removes every wellness field you entered. This cannot be undone.
              </p>
            </div>
            {!confirmDelete ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-danger"
              >
                Clear profile
              </Button>
            ) : (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                  Keep it
                </Button>
                <Button type="button" variant="primary" size="sm" loading={deleting} onClick={handleDelete}>
                  Yes, clear it
                </Button>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}