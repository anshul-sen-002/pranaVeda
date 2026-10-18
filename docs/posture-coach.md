# Posture coach — prototype notes (agents.md §13)

> First increment: landmark-overlay prototype. Rule-based feedback lands next.

## What shipped

- `PostureCoach` on every yoga detail page (`/yoga/[slug]`): explicit
  Start/Stop, camera-permission help, local preview only.
- Deterministic pose configs in `src/lib/coach/poseRules.ts` for Tadasana,
  Vrikshasana, and Warrior II (camera view, cues, safety, `jointAngle`
  helper with degenerate-input guards).
- No frames uploaded or persisted; no landmarks in browser storage.
- `@mediapipe/tasks-vision` is intentionally NOT in `package.json` yet —
  the dynamic import is stubbed with a comment so the heavy WASM bundle
  never ships until the overlay increment lands.

## Next increment

1. Add `@mediapipe/tasks-vision`, load `PoseLandmarker` + model asset lazily
   inside `PostureCoach` (LIVE_STREAM mode, worker preferred).
2. Draw skeleton overlay on the canvas layer (mirror-aware).
3. Apply `POSE_RULES` with visibility + temporal smoothing before any cue.
4. Optional session-summary save for signed-in members (validate ranges
   server-side; owner-scoped like other wellness data).
5. Instructor review of cues before presenting as coaching guidance.

## Licensing / privacy

- MediaPipe code is Apache 2.0; verify each model asset's terms before
  commercial distribution and preserve attribution.
- Upstream docs note anonymised usage/performance metrics may go to Google
  — disclosed in `/privacy`. Camera frames never leave the device.
