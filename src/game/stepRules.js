export const DEFAULT_STEP_GOAL = 10000;

export const DAILY_RESULT_TYPES = {
  GROW: "GROW",
  KEEP: "KEEP",
  DROP: "DROP",
  REST: "REST",
  UNKNOWN: "UNKNOWN",
};

export function getStepRatio(steps, goal = DEFAULT_STEP_GOAL) {
  const safeGoal = Math.max(1, Math.floor(Number(goal ?? DEFAULT_STEP_GOAL)));
  const safeSteps = Math.max(0, Math.floor(Number(steps ?? 0)));
  return safeSteps / safeGoal;
}

export function getStepProgress(steps, goal = DEFAULT_STEP_GOAL) {
  return Math.max(0, Math.min(getStepRatio(steps, goal), 1));
}

export function classifyDailyActivity({ steps = 0, goal = DEFAULT_STEP_GOAL, hasData = true } = {}) {
  if (!hasData) {
    return DAILY_RESULT_TYPES.UNKNOWN;
  }

  const ratio = getStepRatio(steps, goal);
  if (ratio >= 1) {
    return DAILY_RESULT_TYPES.GROW;
  }

  if (ratio >= 0.5) {
    return DAILY_RESULT_TYPES.KEEP;
  }

  return DAILY_RESULT_TYPES.DROP;
}

export function buildProjectedDailyOutcome({
  steps = 0,
  goal = DEFAULT_STEP_GOAL,
  hasData = true,
  weeklyRestUsed = false,
} = {}) {
  const baseResult = classifyDailyActivity({ steps, goal, hasData });
  const ratio = getStepRatio(steps, goal);

  if (baseResult === DAILY_RESULT_TYPES.UNKNOWN) {
    return {
      ratio,
      baseResult,
      finalResult: DAILY_RESULT_TYPES.UNKNOWN,
      usesRest: false,
      delta: 0,
      label: "판정 제외 예상",
      shortLabel: "제외 예상",
    };
  }

  if (baseResult === DAILY_RESULT_TYPES.GROW) {
    return {
      ratio,
      baseResult,
      finalResult: DAILY_RESULT_TYPES.GROW,
      usesRest: false,
      delta: 1,
      label: "성장 예상",
      shortLabel: "성장 예상",
    };
  }

  if (baseResult === DAILY_RESULT_TYPES.KEEP) {
    return {
      ratio,
      baseResult,
      finalResult: DAILY_RESULT_TYPES.KEEP,
      usesRest: false,
      delta: 0,
      label: "유지 예상",
      shortLabel: "유지 예상",
    };
  }

  if (!weeklyRestUsed) {
    return {
      ratio,
      baseResult,
      finalResult: DAILY_RESULT_TYPES.REST,
      usesRest: true,
      delta: 0,
      label: "휴식권 사용 예상",
      shortLabel: "휴식권 예상",
    };
  }

  return {
    ratio,
    baseResult,
    finalResult: DAILY_RESULT_TYPES.DROP,
    usesRest: false,
    delta: -1,
    label: "하락 예상",
    shortLabel: "하락 예상",
  };
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
  const level = getEnergyLevel(steps, goal);
  if (level <= 1) return "LOW_ENERGY";
  if (level <= 4) return "NORMAL_ENERGY";
  return "HIGH_ENERGY";
}

export function getCharacterStatus() {
  return "STEADY";
}
