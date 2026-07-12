/**
 * The steps are presentational pacing, not real pipeline stages — the AI call
 * is a single black box. Timings roughly match a typical 20–60s generation
 * so the last step stays active until the result actually arrives.
 */
export const PROGRESS_STEPS = [
  { key: "analyzing", startsAtMs: 0 },
  { key: "styling", startsAtMs: 5_000 },
  { key: "details", startsAtMs: 18_000 },
] as const;

export type ProgressStepKey = (typeof PROGRESS_STEPS)[number]["key"];
