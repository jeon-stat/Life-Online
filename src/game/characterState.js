import { theme } from "../constants/theme.js";
import { getLevelProgress, getStreak, getTotalXp } from "./progression.js";
import { DEFAULT_STEP_GOAL, getCharacterStatus, getStepProgress } from "./stepRules.js";

export function buildCharacterViewModel({ todayRecord, history, goal = DEFAULT_STEP_GOAL }) {
  const steps = todayRecord?.steps ?? 0;
  const status = getCharacterStatus(steps, goal);
  const statusTheme = theme.status[status];
  const progress = getStepProgress(steps, goal);
  const progressPercent = Math.round(progress * 100);
  const totalXp = getTotalXp(history, goal);
  const progression = getLevelProgress(totalXp);
  const streak = getStreak(history, goal);

  return {
    steps,
    goal,
    status,
    statusLabel: statusTheme.label,
    bubbleText: statusTheme.bubble,
    statusDescription: statusTheme.description,
    background: statusTheme.background,
    stageColor: statusTheme.stage,
    bubbleSurface: statusTheme.bubbleSurface,
    effect: statusTheme.effect,
    animationSpeed: statusTheme.animationSpeed,
    bobAmount: statusTheme.bobAmount,
    progress,
    progressPercent,
    streak,
    reachedGoal: steps >= goal,
    source: todayRecord?.source ?? "mock",
    totalXp: progression.totalXp,
    level: progression.level,
    xpIntoLevel: progression.xpIntoLevel,
    xpToNext: progression.xpToNext,
    levelProgress: progression.progress,
  };
}
