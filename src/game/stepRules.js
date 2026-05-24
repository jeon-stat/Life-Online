export const DEFAULT_STEP_GOAL = 6000;

export function getStepRatio(steps, goal = DEFAULT_STEP_GOAL) {
  if (!goal) return 0;
  return Math.max(0, steps / goal);
}

export function getStepProgress(steps, goal = DEFAULT_STEP_GOAL) {
  return Math.max(0, Math.min(getStepRatio(steps, goal), 1.2));
}

export function getCharacterStatus(steps, goal = DEFAULT_STEP_GOAL) {
  const ratio = getStepRatio(steps, goal);

  if (ratio < 0.3) return "tired";
  if (ratio < 0.7) return "idle";
  if (ratio < 1) return "active";
  return "happy";
}
