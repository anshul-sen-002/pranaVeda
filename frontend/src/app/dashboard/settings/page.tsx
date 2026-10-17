"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, LogOut, Trash2, UserRound } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function SettingsPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <SettingsView />
      </DashboardShell>
    </MemberGuard>
  );
}

function SettingsView() {
  const { accessToken, logout, revalidate, user } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accessToken) return;
    meApi
      .profilePhoto(accessToken)
      .then((res) => setPhotoUrl(res.photoUrl))
      .catch(() => setPhotoUrl(null));
  }, [accessToken]);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !accessToken) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoMsg("That image is too large — the limit is 5 MB.");
      return;
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoMsg("JPEG, PNG, WebP, or AVIF images only.");
      return;
    }
    setPhotoBusy(true);
    setPhotoMsg(null);
    meApi
      .setProfilePhoto(accessToken, file)
      .then((res) => {
        setPhotoUrl(res.photoUrl);
        setPhotoMsg("Profile photo updated.");
        void revalidate();
      })
      .catch((err: unknown) => {
        setPhotoMsg(err instanceof ApiError ? err.message : "Could not upload the photo.");
      })
      .finally(() => setPhotoBusy(false));
  };

  const remove = () => {
    if (!accessToken) return;
    setPhotoBusy(true);
    meApi
      .clearProfilePhoto(accessToken)
      .then(() => {
        setPhotoUrl(null);
        setPhotoMsg("Profile photo removed.");
        void revalidate();
      })
      .catch((err: unknown) => {
        setPhotoMsg(err instanceof ApiError ? err.message : "Could not remove the photo.");
      })
      .finally(() => setPhotoBusy(false));
  };

  const signOut = () => {
    setSigningOut(true);
    void logout().finally(() => setSigningOut(false));
  };


  return <SettingsBody user={user} photoUrl={photoUrl} photoBusy={photoBusy} photoMsg={photoMsg} signingOut={signingOut} onPick={() => inputRef.current?.click()} onRemove={remove} onSignOut={signOut} inputRef={inputRef} onFile={pick} />;
}

function SettingsBody({
  user, photoUrl, photoBusy, photoMsg, signingOut, onPick, onRemove, onSignOut, inputRef, onFile,
}: {
  user: { displayName: string | null; email: string; role: string } | null;
  photoUrl: string | null;
  photoBusy: boolean;
  photoMsg: string | null;
  signingOut: boolean;
  onPick: () => void;
  onRemove: () => void;
  onSignOut: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const displayName = user?.displayName?.trim() || "Member";
  const msgError = photoMsg?.startsWith("Could") || photoMsg?.startsWith("That") || photoMsg?.startsWith("JPEG");
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Settings" subtitle="Your account, photo, and session." />
      <section aria-labelledby="photo-heading" className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 id="photo-heading" className="flex items-center gap-2 font-semibold text-heading">
          <UserRound className="size-5 text-primary-600" aria-hidden="true" />
          Profile photo
        </h2>
        <div className="mt-4 flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Your profile photo" className="size-16 rounded-full object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onPick} disabled={photoBusy} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
              <Camera className="size-4" aria-hidden="true" />
              {photoBusy ? "Working…" : photoUrl ? "Change photo" : "Upload photo"}
            </button>
            {photoUrl ? (
              <button type="button" onClick={onRemove} disabled={photoBusy} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border-soft px-4 text-sm font-medium text-danger disabled:opacity-50">
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </button>
            ) : null}
          </div>
          <input ref={inputRef} type="file" accept={ALLOWED_PHOTO_TYPES.join(",")} onChange={onFile} className="sr-only" aria-label="Choose a profile photo" />
        </div>
        <p className="mt-3 text-xs text-muted">Up to 5 MB · jpeg, png, webp, avif. Stored on Cloudinary, private to you.</p>
        {photoMsg ? <p className={cn("mt-2 text-sm", msgError ? "text-danger" : "text-success")}>{photoMsg}</p> : null}
      </section>
      <section aria-labelledby="account-heading" className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 id="account-heading" className="font-semibold text-heading">Account</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Name</dt>
            <dd className="font-medium text-heading">{displayName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-heading">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-heading">{user?.role === "ADMIN" ? "Administrator" : "Member"}</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-2xl bg-surface-tint p-4 text-xs leading-relaxed text-muted">
          Name, email, and password edits need a backend account endpoint, which this build does not ship yet.
          They are shown as upcoming rather than buttons that pretend to work.
        </p>
        <button type="button" onClick={onSignOut} disabled={signingOut} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border-soft px-5 text-sm font-medium text-heading disabled:opacity-50">
          <LogOut className="size-4" aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out everywhere"}
        </button>
      </section>
    </div>
  );
}