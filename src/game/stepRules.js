export const DEFAULT_STEP_GOAL = 6000;

export function getStepRatio(steps, goal = DEFAULT_STEP_GOAL) {
  if (!goal) return 0;
  return Math.max(0, steps / goal);
}

export function getStepProgress(steps, goal = DEFAULT_STEP_GOAL) {
  return Math.max(0, Math.min(getStepRatio(steps, goal), 1.2));
}

export function getEnergyState(steps, goal = DEFAULT_STEP_GOAL) {
  const ratio = getStepRatio(steps, goal);

  if (ratio < 0.35) return "LOW_ENERGY";
  if (ratio < 0.85) return "NORMAL_ENERGY";
  return "HIGH_ENERGY";
}

export function getCharacterStatus(steps, goal = DEFAULT_STEP_GOAL) {
  return getEnergyState(steps, goal);
}
