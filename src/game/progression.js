import { DEFAULT_STEP_GOAL } from "./stepRules.js";

export const DAILY_GOAL_XP = 25;
export const LEVEL_XP = 100;

export function getDailyXp(record, goal = DEFAULT_STEP_GOAL) {
  if (!record) return 0;

  const ratio = record.steps / goal;

  if (ratio >= 1.2) return 30;
  if (ratio >= 1) return DAILY_GOAL_XP;
  if (ratio >= 0.7) return 14;
  if (ratio >= 0.3) return 6;
  return 0;
}

export function getTotalXp(history = [], goal = DEFAULT_STEP_GOAL) {
  return history.reduce((sum, record) => sum + getDailyXp(record, goal), 0);
}

export function getLevelFromXp(totalXp) {
  return Math.floor(totalXp / LEVEL_XP) + 1;
}

export function getLevelProgress(totalXp) {
  const xpIntoLevel = totalXp % LEVEL_XP;
  const xpToNext = LEVEL_XP - xpIntoLevel;

  return {
    totalXp,
    level: getLevelFromXp(totalXp),
    xpIntoLevel,
    xpToNext,
    progress: xpIntoLevel / LEVEL_XP,
  };
}

export function getStreak(history = [], goal = DEFAULT_STEP_GOAL) {
  let streak = 0;

  for (const record of history) {
    if (record.steps >= goal) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

export function getLifetimeSteps(history = []) {
  return history.reduce((sum, record) => sum + (record?.steps ?? 0), 0);
}

export function getAchievedDays(history = [], goal = DEFAULT_STEP_GOAL) {
  return history.reduce((count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0), 0);
}

export function getGrowthProgress(history = [], goal = DEFAULT_STEP_GOAL) {
  const xp = getTotalXp(history, goal);
  const level = getLevelFromXp(xp);
  const xpIntoLevel = xp % LEVEL_XP;

  return {
    level,
    xp,
    nextLevelXp: LEVEL_XP - xpIntoLevel,
    lifetimeSteps: getLifetimeSteps(history),
    achievedDays: getAchievedDays(history, goal),
    streak: getStreak(history, goal),
    xpIntoLevel,
    levelProgress: xpIntoLevel / LEVEL_XP,
  };
}
