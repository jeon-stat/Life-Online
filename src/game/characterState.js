import { theme } from "../constants/theme.js";
import { getMemories } from "./memories.js";
import { getPersonality } from "./personality.js";
import { getGrowthProgress } from "./progression.js";
import { DEFAULT_STEP_GOAL, getCharacterStatus, getStepProgress } from "./stepRules.js";

export function buildCharacterViewModel({ todayRecord, history, goal = DEFAULT_STEP_GOAL }) {
  const steps = todayRecord?.steps ?? 0;
  const status = getCharacterStatus(steps, goal);
  const statusTheme = theme.status[status];
  const progress = getStepProgress(steps, goal);
  const progressPercent = Math.round(progress * 100);
  const growth = getGrowthProgress(history, goal);
  const personality = getPersonality(history, goal);
  const memories = getMemories(history, goal);

  return {
    steps,
    goal,
    status,
    statusLabel: statusTheme.label,
    bubbleText: `${statusTheme.bubble} ${personality.bubbleTone}`,
    statusDescription: statusTheme.description,
    background: statusTheme.background,
    stageColor: statusTheme.stage,
    bubbleSurface: statusTheme.bubbleSurface,
    effect: statusTheme.effect,
    animationSpeed: statusTheme.animationSpeed,
    bobAmount: statusTheme.bobAmount,
    progress,
    progressPercent,
    streak: growth.streak,
    reachedGoal: steps >= goal,
    source: todayRecord?.source ?? "mock",
    totalXp: growth.xp,
    level: growth.level,
    xpIntoLevel: growth.xpIntoLevel,
    xpToNext: growth.nextLevelXp,
    levelProgress: growth.levelProgress,
    growth,
    personality,
    memories,
  };
}
