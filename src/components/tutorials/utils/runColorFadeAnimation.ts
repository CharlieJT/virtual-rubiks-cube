/**
 * Shared color fade animation used by both the error-fade (reset / wrong move)
 * and the slide transition. Optional totalDurationMs (e.g. 800) syncs the fade
 * with the yaw so opacity/dullness run during the camera transition.
 */
const PHASE1_DURATION_MS = 120;
const PHASE2_DELAY_MS = 120;
const PHASE2_DURATION_MS = 120;

export const TOTAL_FADE_DURATION_MS =
  PHASE1_DURATION_MS + PHASE2_DELAY_MS + PHASE2_DURATION_MS;

export const YAW_TRANSITION_DURATION_MS = 800;

/** Slide transition fade (color, opacity, dullness) – ~50% of yaw duration */
export const SLIDE_FADE_DURATION_MS = 400;

export const runColorFadeAnimation = (
  setColorFadeProgress: (progress: number) => void,
  onComplete: () => void,
  totalDurationMs?: number,
): void => {
  const duration = totalDurationMs ?? TOTAL_FADE_DURATION_MS;
  const phase1Ms =
    totalDurationMs != null ? duration * 0.5 : PHASE1_DURATION_MS;
  const delayMs = totalDurationMs != null ? 0 : PHASE2_DELAY_MS;
  const phase2Ms =
    totalDurationMs != null ? duration * 0.5 : PHASE2_DURATION_MS;

  let startTime: number | null = null;
  const animateFade = (timestamp: number) => {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;

    let progress = 0;
    if (elapsed < phase1Ms) {
      progress = (elapsed / phase1Ms) * 0.5;
    } else if (elapsed < phase1Ms + delayMs) {
      progress = 0.5;
    } else {
      const phase2Elapsed = elapsed - (phase1Ms + delayMs);
      progress = 0.5 + (phase2Elapsed / phase2Ms) * 0.5;
    }
    progress = Math.min(1, progress);
    setColorFadeProgress(progress);

    if (elapsed < duration) {
      requestAnimationFrame(animateFade);
    } else {
      onComplete();
    }
  };
  requestAnimationFrame(animateFade);
};
