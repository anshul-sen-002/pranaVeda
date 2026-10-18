/** Deterministic, testable pose-rule configs (agents.md §13). Pure math, no LLM. */
export interface PoseRule {
  id: string;
  title: string;
  cameraView: "front" | "side";
  minVisibility: number;
  cues: string[];
  safety: string;
}

export const POSE_RULES: Record<string, PoseRule> = {
  tadasana: {
    id: "tadasana",
    title: "Mountain Pose (Tadasana)",
    cameraView: "front",
    minVisibility: 0.5,
    cues: ["Stand tall with feet together or hip-width apart.", "Soften shoulders away from ears.", "Gaze forward, chin parallel to the floor."],
    safety: "Avoid locking knees. Use a wall nearby if balance feels unsteady.",
  },
  vrikshasana: {
    id: "vrikshasana",
    title: "Tree Pose (Vrikshasana)",
    cameraView: "front",
    minVisibility: 0.5,
    cues: ["Press the lifted foot to inner thigh or calf — never the knee.", "Bring palms together at the chest.", "Fix gaze on one steady point."],
    safety: "Keep a wall in reach. Skip if ankle or knee pain flares.",
  },
  "warrior-ii": {
    id: "warrior-ii",
    title: "Warrior II (Virabhadrasana II)",
    cameraView: "side",
    minVisibility: 0.5,
    cues: ["Front knee tracks over the ankle.", "Arms reach long, shoulders soft.", "Torso stacks over hips, gaze over front fingers."],
    safety: "Ease out if the front knee aches. Shorten the stance to reduce load.",
  },
};

/** Picks a rule by matching slug/title keywords; null when unsupported. */
export function ruleForPose(slug: string, title: string): PoseRule | null {
  const hay = `${slug} ${title}`.toLowerCase();
  if (hay.includes("tree") || hay.includes("vriksha")) return POSE_RULES.vrikshasana;
  if (hay.includes("warrior") || hay.includes("virabhadra")) return POSE_RULES["warrior-ii"];
  if (hay.includes("mountain") || hay.includes("tadasana")) return POSE_RULES.tadasana;
  return null;
}

/** Joint-angle helper with guards (degrees, null on degenerate input). */
export function jointAngle(
  a: { x: number; y: number } | null,
  b: { x: number; y: number } | null,
  c: { x: number; y: number } | null,
): number | null {
  if (!a || !b || !c) return null;
  for (const p of [a, b, c]) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
  }
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const n1 = Math.hypot(v1.x, v1.y);
  const n2 = Math.hypot(v2.x, v2.y);
  if (n1 < 1e-6 || n2 < 1e-6) return null;
  const cos = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / (n1 * n2)));
  return (Math.acos(cos) * 180) / Math.PI;
}
