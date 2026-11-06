"use client"

import { useCallback, useEffect, useState } from "react";
import { Save, User, Calendar, Trophy, Ruler, Scale, Clock, Globe, Moon, Zap, Smile, Activity, HeartPulse, Info, ShieldCheck, Sparkles } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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

const selectCls =
  "h-11 w-full rounded-xl border border-[#e2e8dd] bg-white px-3 text-sm text-heading transition-colors duration-200 " +
  "focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none sm:h-12 sm:text-base";

const inputCls =
  "h-11 w-full rounded-xl border border-[#e2e8dd] bg-white px-3 text-sm text-heading transition-colors duration-200 " +
  "focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none sm:h-12 sm:text-base";

function calculateBmi(form: WellnessProfileRequest): number | null {
  const { heightValue, heightUnit, weightValue, weightUnit } = form;
  if (!heightValue || !heightUnit || !weightValue || !weightUnit) return null;

  const heightCm = heightUnit === "CM" ? heightValue : heightValue * 2.54;
  const weightKg = weightUnit === "KG" ? weightValue : weightValue * 0.45359237;
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) return null;

  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (!accessToken) return;
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
      });
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof WellnessProfileRequest>(
    key: K,
    value: WellnessProfileRequest[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));
  const bmiEstimate = calculateBmi(form);

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

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-[#dfe9dc] bg-gradient-gourd-white p-5 shadow-[0_14px_40px_-30px_rgba(29,63,46,.3)] sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-12 size-44 rounded-full bg-white/45 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm sm:size-14"><HeartPulse className="size-6 sm:size-7" aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[.14em] text-primary-700 uppercase">Your personal space</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Wellness profile</h1>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-body sm:text-base">Share only what feels useful. These details help tailor your practice and remain private to you.</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/90 bg-white/75 px-3.5 py-2 text-xs font-medium text-primary-800 sm:shrink-0"><ShieldCheck className="size-4" aria-hidden="true" /> Private to your account</span>
        </div>
      </section>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {saved ? <Alert tone="success">Profile saved.</Alert> : null}
      <form onSubmit={submit} className="min-w-0 space-y-4 rounded-3xl border border-[#e6eadd] bg-white/90 p-2.5 shadow-[0_16px_50px_-40px_rgba(29,63,46,.35)] sm:space-y-5 sm:p-6">
        <fieldset className="m-0 rounded-2xl border border-[#edf0e9] bg-[#fafbf8] p-4 sm:p-5">
          <legend className="mb-3 flex items-center gap-2 rounded-full border border-[#e8eee4] bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-800 uppercase sm:mb-4">
            <User className="size-4 text-primary-600" aria-hidden="true" />
            Your details
          </legend>
          <div className="grid min-w-0 gap-3.5 sm:grid-cols-2 sm:gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="date-of-birth" className="mb-1.5 block text-sm font-semibold text-heading">
                <Calendar className="mr-1.5 size-4 text-primary-600" aria-hidden="true" />
                Date of birth
              </label>
              <Input
                id="date-of-birth"
                type="date"
                value={form.dateOfBirth ?? ""}
                onChange={(e) => set("dateOfBirth", e.target.value || null)}
                label=""
                hint="We derive your age from this — it is never stored separately."
                className="h-11 sm:h-12"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="experience-level" className="mb-1.5 block text-sm font-semibold text-heading">
                <Trophy className="mr-1.5 size-4 text-primary-600" aria-hidden="true" />
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
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-1.5 block text-sm font-semibold text-heading flex items-center gap-1.5">
                <Ruler className="size-4 text-primary-600" aria-hidden="true" />
                Height
              </div>
              <div className="flex items-end gap-2">
                <Input
                  label=""
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.heightValue ?? ""}
                  onChange={(e) => {
                    const value = num(e.target.value);
                    setForm((prev) => ({ ...prev, heightValue: value, heightUnit: value === null ? null : prev.heightUnit ?? "CM" }));
                  }}
                  placeholder="170"
                  className="flex-1 h-11 sm:h-12"
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
            <div className="col-span-2 sm:col-span-1">
              <div className="mb-1.5 block text-sm font-semibold text-heading flex items-center gap-1.5">
                <Scale className="size-4 text-primary-600" aria-hidden="true" />
                Weight
              </div>
              <div className="flex items-end gap-2">
                <Input
                  label=""
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.weightValue ?? ""}
                  onChange={(e) => {
                    const value = num(e.target.value);
                    setForm((prev) => ({ ...prev, weightValue: value, weightUnit: value === null ? null : prev.weightUnit ?? "KG" }));
                  }}
                  placeholder="65"
                  className="flex-1 h-11 sm:h-12"
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
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-heading flex items-center gap-1.5">
                <Clock className="mr-1.5 size-4 text-primary-600" aria-hidden="true" />
                Preferred session length (minutes)
              </label>
              <Input
                type="number"
                min={5}
                max={240}
                value={form.preferredSessionMinutes ?? ""}
                onChange={(e) => set("preferredSessionMinutes", num(e.target.value))}
                placeholder="20"
                label=""
                className="h-11 sm:h-12"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="practice-time" className="mb-1.5 block text-sm font-semibold text-heading flex items-center gap-1.5">
                <Globe className="mr-1.5 size-4 text-primary-600" aria-hidden="true" />
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
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="timezone" className="mb-1.5 block text-sm font-semibold text-heading flex items-center gap-1.5">
                <Globe className="mr-1.5 size-4 text-primary-600" aria-hidden="true" />
                Timezone
              </label>
              <Input
                id="timezone"
                value={form.timezone ?? ""}
                onChange={(e) => set("timezone", e.target.value || null)}
                placeholder="e.g. Asia/Kolkata"
                hint="Used for streak day boundaries; never for any health reading."
                label=""
                className="h-11 sm:h-12"
              />
            </div>
          </div>
        </fieldset>
        <section aria-labelledby="bmi-calculator-title" className="rounded-2xl border border-[#dce9df] bg-gradient-gourd-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary-700 shadow-sm"><Scale className="size-5" aria-hidden="true" /></span>
              <div>
                <h2 id="bmi-calculator-title" className="text-sm font-semibold text-heading">BMI calculator</h2>
                <p className="text-xs text-muted">A live estimate from your height and weight</p>
              </div>
            </div>
            <output aria-live="polite" className="rounded-xl border border-white bg-white/80 px-4 py-2 text-lg font-semibold tabular-nums text-primary-800 shadow-sm">
              {bmiEstimate === null ? "—" : bmiEstimate.toFixed(1)}
            </output>
          </div>
          {bmiEstimate === null ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">Enter a height and weight above to calculate your estimate. The value updates as you type.</p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-muted">{BMI_DISCLAIMER}</p>
          )}
        </section>
        <fieldset className="m-0 min-w-0 rounded-2xl border border-[#edf0e9] bg-[#fafbf8] p-3 sm:p-5">
          <legend className="mb-3 max-w-full rounded-full border border-[#e8eee4] bg-white px-2.5 py-1.5 text-[10px] font-semibold leading-tight tracking-wide text-primary-800 uppercase sm:mb-4 sm:px-3 sm:text-xs">
            <span className="inline-flex items-center gap-1.5">
            <HeartPulse className="size-4 text-primary-600" aria-hidden="true" />
            How you feel (1 = low, 5 = high)
            </span>
          </legend>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {([
              ["sleepQuality", "Sleep", Moon],
              ["energyLevel", "Energy", Zap],
              ["moodScore", "Mood", Smile],
              ["flexibilityScore", "Flexibility", Activity],
            ] as const).map(([key, label, Icon]) => {
              const val = form[key] ?? 0;
              return (
                <div key={key} className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-[#e5ebe0] bg-white p-2.5 transition-colors hover:border-primary-200 sm:gap-2 sm:p-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:size-9"><Icon className="size-4 sm:size-4.5" aria-hidden="true" /></span>
                  <span className="text-[11px] font-semibold text-heading sm:text-xs">{label}</span>
                  <div className="grid w-full max-w-32 grid-cols-5 gap-1 text-[10px] text-muted">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set(key, n)}
                        aria-pressed={val === n}
                        className={`inline-flex aspect-square min-w-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                          val >= n
                            ? "bg-primary-600 text-white text-[9px] font-bold"
                            : "bg-[#f7f9f6] text-muted hover:bg-primary-50/70"
                        }`}
                        aria-label={`${label} ${n}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
        <div>
          <label htmlFor="constraints" className="mb-1.5 mt-4 block text-sm font-semibold text-heading">
            Injuries or constraints (optional)
          </label>
          <textarea
            id="constraints"
            rows={3}
            value={form.constraintsNotes ?? ""}
            onChange={(e) => set("constraintsNotes", e.target.value || null)}
            placeholder="e.g. sensitive left knee"
            className={inputCls + " h-auto py-2.5"}
          />
          <p className="mt-1.5 text-xs text-muted">
            Used to soften recommendations; never a diagnosis.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#dce9d9] bg-[#f2f7f0] p-4 transition-colors hover:bg-[#edf4ea] sm:p-5">
          <input
            type="checkbox"
            checked={form.aiPersonalizationConsent ?? false}
            onChange={(e) => set("aiPersonalizationConsent", e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary-600"
          />
          <span className="text-sm leading-relaxed text-body">
            <span className="inline-flex items-center gap-1 font-medium text-heading">
              <Info className="size-4 text-primary-600" aria-hidden="true" />
              Let the AI use my profile to personalise suggestions.
            </span>
            <span className="mt-1 block text-xs text-muted">
              Only relevant fields are ever sent, and you can turn this off anytime.
            </span>
          </span>
        </label>

        <div className="sticky bottom-20 z-10 -mx-1 flex flex-col gap-2 rounded-2xl border border-[#e6eadd] bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(29,63,46,.35)] backdrop-blur sm:bottom-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4 shrink-0 text-primary-600" aria-hidden="true" /> You can update or clear these details at any time.</p>
          <Button type="submit" loading={saving} fullWidth className="sm:w-auto">
          <Save className="size-4" aria-hidden="true" />
          {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
      {profile ? (
        <section
          aria-labelledby="snapshot-heading"
          className="rounded-3xl border border-[#dfe9dc] bg-gradient-gourd-white p-5 shadow-[0_12px_35px_-30px_rgba(29,63,46,.32)] sm:p-6"
        >
          <h2 id="snapshot-heading" className="flex items-center gap-2 font-semibold text-heading">
            <Info className="size-4 text-primary-600" aria-hidden="true" />
            Your snapshot
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e5ebe0] bg-white/75 px-3.5 py-3">
              <dt className="text-xs text-muted">Age</dt>
              <dd className="mt-0.5 text-lg font-semibold text-heading">{profile.age ?? ""}</dd>
            </div>
            <div className="rounded-2xl border border-[#e5ebe0] bg-white/75 px-3.5 py-3">
              <dt className="text-xs text-muted">BMI</dt>
              <dd className="mt-0.5 text-lg font-semibold text-heading">
                {profile.bmiAvailable && profile.bmiOrNull != null ? profile.bmiOrNull : ""}
              </dd>
            </div>
            <div className="rounded-2xl border border-[#e5ebe0] bg-white/75 px-3.5 py-3">
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
              Add your height and weight above to see a BMI estimate; always with its limits noted.
            </p>
          )}
        </section>
      ) : null}

      {profile ? (
        <section className="rounded-3xl border border-[#e6eadd] bg-white/90 p-5 shadow-[0_12px_35px_-30px_rgba(29,63,46,.32)] sm:p-6">
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
