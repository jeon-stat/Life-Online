import { theme } from "../constants/theme.js";
import { buildBehaviorProfile } from "./behavior.js";
import { getMemories } from "./memories.js";
import { getPersonality } from "./personality.js";
import { getGrowthProgress } from "./progression.js";
import { DEFAULT_STEP_GOAL, getStepProgress } from "./stepRules.js";

export function buildCharacterViewModel({ todayRecord, history, goal = DEFAULT_STEP_GOAL, motionOverride = null }) {
  const steps = todayRecord?.steps ?? 0;
  const behavior = buildBehaviorProfile({ steps, history, goal });
  const energyTheme = theme.status[behavior.energyState];
  const growthTheme = theme.growth[behavior.longTermState];
  const progress = getStepProgress(steps, goal);
  const progressPercent = Math.round(progress * 100);
  const growth = getGrowthProgress(history, goal);
  const personality = getPersonality(history, goal);
  const memories = getMemories(history, goal);
  const resolvedAction = behavior.actionMap[motionOverride] ?? behavior.actionMap[behavior.defaultActionKey] ?? null;
  const animationState = resolvedAction?.key ?? behavior.defaultActionKey;

  return {
    steps,
    goal,
    status: behavior.energyState,
    energyState: behavior.energyState,
    longTermState: behavior.longTermState,
    growthLabel: growthTheme.label,
    growthDescription: growthTheme.description,
    statusLabel: energyTheme.label,
    bubbleText: energyTheme.bubble,
    statusDescription: energyTheme.description,
    background: energyTheme.background,
    sceneBackground: energyTheme.background[0],
    sceneMood: {
      background: energyTheme.background,
      stage: energyTheme.stage,
      bubbleSurface: energyTheme.bubbleSurface,
      effect: energyTheme.effect,
    },
    stageColor: energyTheme.stage,
    bubbleSurface: energyTheme.bubbleSurface,
    effect: energyTheme.effect,
    animationSpeed: energyTheme.animationSpeed,
    bobAmount: energyTheme.bobAmount,
    animationState,
    motionOverride,
    behavior,
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
