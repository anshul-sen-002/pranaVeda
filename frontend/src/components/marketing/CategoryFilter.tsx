"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

type Goal = "flexibility" | "relaxation" | "balance" | "mobility" | "posture" | "sleep-routine" | "general-fitness";
type Difficulty = "beginner" | "intermediate" | "advanced";
type ContentType = "asana" | "article" | "video";

interface CategoryFilterProps {
  defaultGoal?: Goal;
  defaultDifficulty?: Difficulty;
  defaultType?: ContentType;
}

export function CategoryFilter({ defaultGoal, defaultDifficulty, defaultType }: CategoryFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlGoal = searchParams.get("goal") as Goal | null;
  const urlDifficulty = searchParams.get("difficulty") as Difficulty | null;
  const urlType = searchParams.get("type") as ContentType | null;

  const [goal, setGoal] = useState<Goal | undefined>(urlGoal || defaultGoal);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(urlDifficulty || defaultDifficulty);
  const [type, setType] = useState<ContentType | undefined>(urlType || defaultType);

  // Refs to track previous URL values - prevents infinite loops in sync effect
  const prevUrlGoalRef = useRef<Goal | null>(urlGoal);
  const prevUrlDifficultyRef = useRef<Difficulty | null>(urlDifficulty);
  const prevUrlTypeRef = useRef<ContentType | null>(urlType);

  // Sync URL when filter state changes - use window.history.pushState for reliability
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (goal) params.set("goal", goal); else params.delete("goal");
    if (difficulty) params.set("difficulty", difficulty); else params.delete("difficulty");
    if (type) params.set("type", type); else params.delete("type");

    const newSearch = params.toString();
    if (searchParams.toString() !== newSearch) {
      const newUrl = pathname + "?" + newSearch;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  }, [goal, difficulty, type, searchParams, pathname]);

  // Keep filter state in sync when URL changes (browser back/forward, manual URL edit)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newGoal = params.get("goal") as Goal | null;
    const newDifficulty = params.get("difficulty") as Difficulty | null;
    const newType = params.get("type") as ContentType | null;

    const goalChanged = newGoal !== prevUrlGoalRef.current;
    const difficultyChanged = newDifficulty !== prevUrlDifficultyRef.current;
    const typeChanged = newType !== prevUrlTypeRef.current;

    if (goalChanged) {
      setGoal(newGoal || undefined);
      prevUrlGoalRef.current = newGoal;
    }
    if (difficultyChanged) {
      setDifficulty(newDifficulty || undefined);
      prevUrlDifficultyRef.current = newDifficulty;
    }
    if (typeChanged) {
      setType(newType || undefined);
      prevUrlTypeRef.current = newType;
    }
  }, [searchParams]);

  return null;
}
