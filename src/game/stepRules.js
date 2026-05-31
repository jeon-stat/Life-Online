export const DEFAULT_STEP_GOAL = 6000;

export function getStepRatio(steps, goal = DEFAULT_STEP_GOAL) {
  if (!goal) return 0;
  return Math.max(0, steps / goal);
}

export function getStepProgress(steps, goal = DEFAULT_STEP_GOAL) {
  return Math.max(0, Math.min(getStepRatio(steps, goal), 1.2));
}

export function getEnergyLevel(steps, goal = DEFAULT_STEP_GOAL) {
  const ratio = getStepRatio(steps, goal);

  if (ratio < 0.05) return 0;
  if (ratio < 0.15) return 1;
  if (ratio < 0.3) return 2;
  if (ratio < 0.5) return 3;
  if (ratio < 0.7) return 4;
  if (ratio < 1) return 5;
  return 6;
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
