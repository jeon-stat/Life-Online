import { getWeekKey } from "./dateUtils.js";
import { DAILY_RESULT_TYPES, buildProjectedDailyOutcome, classifyDailyActivity, DEFAULT_STEP_GOAL, getStepRatio } from "./stepRules.js";
import { getRewardById, getRewardsUnlockedUpToLevel, getStarterActionId, getStarterBackgroundId } from "./levelRewards.js";

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 20;
const LEVEL_UP_EVENT_LIMIT = 20;

export function requiredPoints(level) {
  return Math.min(7, Math.max(2, Number(level ?? MIN_LEVEL) + 1));
}

export function createDefaultGrowthState() {
  return {
    version: 3,
    currentLevel: MIN_LEVEL,
    growthPoints: 0,
    highestLevelReached: MIN_LEVEL,
    unlockedRewardIds: [],
    processedDailyResults: {},
    currentWeekKey: getWeekKey(new Date()),
    weeklyRestUsed: false,
    selectedActionId: getStarterActionId(),
    selectedPetId: null,
    selectedBackgroundId: getStarterBackgroundId(),
    selectedExpressionId: "expression-starter-calm",
    selectedOutfitId: null,
    levelUpEvents: [],
  };
}

export function normalizeGrowthState(value) {
  const defaults = createDefaultGrowthState();
  const currentLevel = clampLevel(value?.currentLevel ?? defaults.currentLevel);
  const highestLevelReached = Math.max(currentLevel, clampLevel(value?.highestLevelReached ?? currentLevel));
  const unlockedRewardIds = mergeRewardIds(value?.unlockedRewardIds, highestLevelReached);
  const selectedActionId = typeof value?.selectedActionId === "string" ? value.selectedActionId : defaults.selectedActionId;
  const selectedBackgroundId =
    typeof value?.selectedBackgroundId === "string" ? value.selectedBackgroundId : defaults.selectedBackgroundId;

  return {
    version: 3,
    currentLevel,
    growthPoints: clampPoints(value?.growthPoints, currentLevel),
    highestLevelReached,
    unlockedRewardIds,
    processedDailyResults: normalizeProcessedDailyResults(value?.processedDailyResults),
    currentWeekKey: typeof value?.currentWeekKey === "string" ? value.currentWeekKey : defaults.currentWeekKey,
    weeklyRestUsed: Boolean(value?.weeklyRestUsed),
    selectedActionId,
    selectedPetId: typeof value?.selectedPetId === "string" ? value.selectedPetId : null,
    selectedBackgroundId,
    selectedExpressionId:
      typeof value?.selectedExpressionId === "string" ? value.selectedExpressionId : defaults.selectedExpressionId,
    selectedOutfitId: typeof value?.selectedOutfitId === "string" ? value.selectedOutfitId : null,
    levelUpEvents: normalizeLevelUpEvents(value?.levelUpEvents),
  };
}

export function applyGrowthDelta(state, delta, dateKey = null) {
  const baseState = normalizeGrowthState(state);
  let currentLevel = baseState.currentLevel;
  let growthPoints = baseState.growthPoints;
  let highestLevelReached = baseState.highestLevelReached;
  const levelUpEvents = [...baseState.levelUpEvents];

  if (delta > 0) {
    for (let step = 0; step < delta; step += 1) {
      if (currentLevel >= MAX_LEVEL) {
        growthPoints = 0;
        continue;
      }

      growthPoints += 1;
      const needed = requiredPoints(currentLevel);
      if (growthPoints >= needed) {
        currentLevel = clampLevel(currentLevel + 1);
        growthPoints = 0;

        if (currentLevel > highestLevelReached) {
          highestLevelReached = currentLevel;
          levelUpEvents.unshift({
            id: `${dateKey ?? "level-up"}-${currentLevel}-${levelUpEvents.length}`,
            date: dateKey,
            level: currentLevel,
          });
        }
      }
    }
  }

  if (delta < 0) {
    for (let step = 0; step < Math.abs(delta); step += 1) {
      if (growthPoints > 0) {
        growthPoints -= 1;
        continue;
      }

      if (currentLevel > MIN_LEVEL) {
        currentLevel -= 1;
      }
    }
  }

  return {
    ...baseState,
    currentLevel,
    growthPoints,
    highestLevelReached,
    unlockedRewardIds: mergeRewardIds(baseState.unlockedRewardIds, highestLevelReached),
    levelUpEvents: levelUpEvents.slice(0, LEVEL_UP_EVENT_LIMIT),
  };
}

export function processPendingDailyResults({
  growthState,
  history = [],
  goal = DEFAULT_STEP_GOAL,
  todayDateKey,
} = {}) {
  const baseState = normalizeGrowthState(growthState);
  const sortedRecords = [...(Array.isArray(history) ? history : [])].sort((left, right) => left.date.localeCompare(right.date));
  const nextProcessedDailyResults = { ...baseState.processedDailyResults };
  let nextState = baseState;

  for (const record of sortedRecords) {
    if (!record?.date || record.date >= todayDateKey || nextProcessedDailyResults[record.date]) {
      continue;
    }

    const result = resolveProcessedDailyResult({
      record,
      goal,
      processedDailyResults: nextProcessedDailyResults,
      weeklyRestSeed: record.date ? record.date >= nextState.currentWeekKey && nextState.weeklyRestUsed : false,
    });

    nextProcessedDailyResults[record.date] = result;
    nextState = applyGrowthDelta(nextState, result.delta, record.date);
  }

  const currentWeekKey = getWeekKey(todayDateKey);
  const weeklyRestUsed = Object.values(nextProcessedDailyResults).some(
    (result) => result?.weekKey === currentWeekKey && result?.usesRest,
  );

  return {
    ...nextState,
    processedDailyResults: nextProcessedDailyResults,
    currentWeekKey,
    weeklyRestUsed,
  };
}

export function resolveProcessedDailyResult({
  record,
  goal = DEFAULT_STEP_GOAL,
  processedDailyResults = {},
  weeklyRestSeed = false,
} = {}) {
  const dateKey = record?.date ?? "";
  const weekKey = getWeekKey(dateKey);
  const hasData = record?.hasData !== false;
  const baseResult = classifyDailyActivity({
    steps: record?.steps ?? 0,
    goal,
    hasData,
  });
  const ratio = getStepRatio(record?.steps ?? 0, goal);
  const weeklyRestAlreadyUsed = Object.values(processedDailyResults).some(
    (result) => result?.weekKey === weekKey && result?.usesRest,
  ) || weeklyRestSeed;

  let finalResult = baseResult;
  let delta = 0;
  let usesRest = false;

  if (baseResult === DAILY_RESULT_TYPES.GROW) {
    delta = 1;
  } else if (baseResult === DAILY_RESULT_TYPES.DROP) {
    if (weeklyRestAlreadyUsed) {
      delta = -1;
      finalResult = DAILY_RESULT_TYPES.DROP;
    } else {
      finalResult = DAILY_RESULT_TYPES.REST;
      usesRest = true;
      delta = 0;
    }
  }

  return {
    date: dateKey,
    weekKey,
    steps: Math.max(0, Math.floor(Number(record?.steps ?? 0))),
    goal,
    ratio,
    baseResult,
    finalResult,
    usesRest,
    delta,
    hasData,
    processedAt: dateKey,
  };
}

export function getGrowthOverview(growthState) {
  const state = normalizeGrowthState(growthState);
  const pointsRequired = requiredPoints(state.currentLevel);

  return {
    currentLevel: state.currentLevel,
    growthPoints: state.growthPoints,
    highestLevelReached: state.highestLevelReached,
    unlockedRewardIds: state.unlockedRewardIds,
    pointsRequired,
    progressRatio: pointsRequired ? state.growthPoints / pointsRequired : 0,
    currentWeekKey: state.currentWeekKey,
    weeklyRestUsed: state.weeklyRestUsed,
  };
}

export function getRecentDailyResults(growthState, limit = 14) {
  const results = Object.values(normalizeGrowthState(growthState).processedDailyResults);
  return results
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
}

export function getWeeklyResultSummary(growthState, weekKey) {
  const summary = {
    growCount: 0,
    keepCount: 0,
    dropCount: 0,
    restCount: 0,
    unknownCount: 0,
    weeklyRestUsed: false,
  };

  for (const result of Object.values(normalizeGrowthState(growthState).processedDailyResults)) {
    if (result?.weekKey !== weekKey) {
      continue;
    }

    if (result.finalResult === DAILY_RESULT_TYPES.GROW) {
      summary.growCount += 1;
    } else if (result.finalResult === DAILY_RESULT_TYPES.KEEP) {
      summary.keepCount += 1;
    } else if (result.finalResult === DAILY_RESULT_TYPES.DROP) {
      summary.dropCount += 1;
    } else if (result.finalResult === DAILY_RESULT_TYPES.REST) {
      summary.restCount += 1;
      summary.weeklyRestUsed = true;
    } else {
      summary.unknownCount += 1;
    }
  }

  return summary;
}

export function getGoalStreak(growthState) {
  const results = getRecentDailyResults(growthState, 365);
  let streak = 0;

  for (const result of results) {
    if (result.finalResult === DAILY_RESULT_TYPES.UNKNOWN) {
      continue;
    }

    if (result.baseResult === DAILY_RESULT_TYPES.GROW) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

export function buildTodayProjection({ growthState, todayRecord, goal = DEFAULT_STEP_GOAL }) {
  return buildProjectedDailyOutcome({
    steps: todayRecord?.steps ?? 0,
    goal,
    hasData: todayRecord?.hasData !== false,
    weeklyRestUsed: normalizeGrowthState(growthState).weeklyRestUsed,
  });
}

export function getTotalXp(history = [], goal = DEFAULT_STEP_GOAL) {
  let totalXp = 0;

  for (const record of Array.isArray(history) ? history : []) {
    const ratio = getStepRatio(record?.steps ?? 0, goal);

    if (ratio >= 1.2) {
      totalXp += 30;
    } else if (ratio >= 1) {
      totalXp += 25;
    } else if (ratio >= 0.7) {
      totalXp += 14;
    } else if (ratio >= 0.3) {
      totalXp += 6;
    }
  }

  return totalXp;
}

export function getLevelProgress(totalXp = 0) {
  const safeXp = Math.max(0, Math.floor(Number(totalXp ?? 0)));
  const level = Math.floor(safeXp / 100) + 1;
  const xpIntoLevel = safeXp % 100;

  return {
    totalXp: safeXp,
    level,
    xpIntoLevel,
    xpToNext: 100 - xpIntoLevel,
    progress: xpIntoLevel / 100,
  };
}

export function getLevelFromXp(totalXp = 0) {
  return getLevelProgress(totalXp).level;
}

export function getStreak(history = [], goal = DEFAULT_STEP_GOAL) {
  let streak = 0;

  for (const record of Array.isArray(history) ? history : []) {
    if ((record?.steps ?? 0) >= goal) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

export function getLifetimeSteps(history = []) {
  return (Array.isArray(history) ? history : []).reduce((sum, record) => sum + (record?.steps ?? 0), 0);
}

export function getAchievedDays(history = [], goal = DEFAULT_STEP_GOAL) {
  return (Array.isArray(history) ? history : []).reduce(
    (count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0),
    0,
  );
}

export function mergeRewardIds(unlockedRewardIds = [], highestLevelReached = MIN_LEVEL) {
  const rewardIds = new Set(
    [...(Array.isArray(unlockedRewardIds) ? unlockedRewardIds : []), ...getRewardsUnlockedUpToLevel(highestLevelReached)]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean),
  );

  return [...rewardIds].filter((rewardId) => getRewardById(rewardId));
}

export function normalizeProcessedDailyResults(value) {
  const resultEntries = Array.isArray(value)
    ? value
    : Object.values(value ?? {});

  return resultEntries.reduce((accumulator, entry) => {
    if (!entry?.date) {
      return accumulator;
    }

    accumulator[entry.date] = {
      date: entry.date,
      weekKey: typeof entry.weekKey === "string" ? entry.weekKey : getWeekKey(entry.date),
      steps: Math.max(0, Math.floor(Number(entry.steps ?? 0))),
      goal: Math.max(1, Math.floor(Number(entry.goal ?? DEFAULT_STEP_GOAL))),
      ratio: Math.max(0, Number(entry.ratio ?? 0)),
      baseResult: normalizeResultType(entry.baseResult),
      finalResult: normalizeResultType(entry.finalResult),
      usesRest: Boolean(entry.usesRest),
      delta: Number.isFinite(entry.delta) ? entry.delta : 0,
      hasData: entry.hasData !== false,
      processedAt: typeof entry.processedAt === "string" ? entry.processedAt : entry.date,
    };
    return accumulator;
  }, {});
}

export function normalizeLevelUpEvents(events = []) {
  return (Array.isArray(events) ? events : [])
    .map((event, index) => ({
      id: String(event?.id ?? `level-up-${index}`),
      date: typeof event?.date === "string" ? event.date : null,
      level: clampLevel(event?.level ?? MIN_LEVEL),
    }))
    .slice(0, LEVEL_UP_EVENT_LIMIT);
}

function normalizeResultType(value) {
  if (Object.values(DAILY_RESULT_TYPES).includes(value)) {
    return value;
  }

  return DAILY_RESULT_TYPES.UNKNOWN;
}

function clampLevel(value) {
  return Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.floor(Number(value ?? MIN_LEVEL))));
}

function clampPoints(value, currentLevel) {
  return Math.max(0, Math.min(requiredPoints(currentLevel) - 1, Math.floor(Number(value ?? 0))));
}
