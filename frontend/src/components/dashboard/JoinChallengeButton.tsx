"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { DotLoader } from "@/components/motion/DotLoader";
import { useAuthedFetch } from "@/hooks/useAuthedFetch";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";

/** Discovers published challenges, then joins the chosen one (idempotent). */
export function JoinChallengeButton({ onJoined }: { onJoined: () => void }) {
  const run = useAuthedFetch();
  const [pending, setPending] = useState(false);
  const [options, setOptions] = useState<{ id: number; title: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const discover = async () => {
    setPending(true);
    setError(null);
    try {
      const published = await meApi.publishedChallenges();
      if (published.length === 0) setError("No open challenges right now — check back soon.");
      else setOptions(published.map((c) => ({ id: c.id, title: c.title })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not find challenges.");
    } finally {
      setPending(false);
    }
  };

  const join = async (id: number) => {
    setPending(true);
    setError(null);
    try {
      await run((token) => meApi.joinChallenge(token, id));
      onJoined();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join the challenge.");
      setPending(false);
    }
  };

  const btn =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-medium text-white disabled:opacity-60";

  if (!options) {
    return (
      <div>
        {error ? <p role="alert" className="mb-2 text-sm text-danger">{error}</p> : null}
        <button type="button" onClick={() => void discover()} disabled={pending} className={btn}>
          {pending ? <DotLoader inline size="sm" /> : null}
          Find the 7-day challenge
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((c) => (
        <button key={c.id} type="button" disabled={pending} onClick={() => void join(c.id)} className={btn}>
          Join: {c.title}
        </button>
      ))}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
