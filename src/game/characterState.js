import { theme } from "../constants/theme.js";
import { buildBehaviorProfile } from "./behavior.js";
import { getMemories } from "./memories.js";
import { getPersonality } from "./personality.js";
import { getGrowthProgress } from "./progression.js";
import { DEFAULT_STEP_GOAL, getStepProgress } from "./stepRules.js";

export function buildCharacterViewModel({ todayRecord, history, goal = DEFAULT_STEP_GOAL, admin = null }) {
  const steps = todayRecord?.steps ?? 0;
  const behaviorOverrides = {
    forceShortTermState: admin?.forcedShortTermState ?? null,
    forceLongTermState: admin?.forcedLongTermState ?? null,
    forceBackgroundState: admin?.forcedBackgroundState ?? null,
    forcedActionKey: admin?.forcedActionKey ?? null,
    weightOverrides: admin?.weightOverrides ?? {},
    walkingSpeedMultiplier: admin?.walkingSpeedMultiplier ?? 1,
    runningSpeedMultiplier: admin?.runningSpeedMultiplier ?? 1,
    animationSpeedMultiplier: admin?.animationSpeedMultiplier ?? 1,
    mainDurationRange: admin?.mainDurationRange ?? [8, 15],
    transitionDurationRange: admin?.transitionDurationRange ?? [0.5, 2],
    waitDurationRange: admin?.waitDurationRange ?? [1, 4],
  };
  const behavior = buildBehaviorProfile({ steps, history, goal, overrides: behaviorOverrides });
  const energyTheme = theme.status[behavior.backgroundState] ?? theme.status[behavior.energyState];
  const growthTheme = theme.growth[behavior.longTermState];
  const progress = getStepProgress(steps, goal);
  const progressPercent = Math.round(progress * 100);
  const growth = getGrowthProgress(history, goal);
  const personality = getPersonality(history, goal);
  const memories = getMemories(history, goal);
  const forcedAction = behavior.actionMap[behavior.forcedActionKey] ?? null;
  const defaultAction = behavior.mainActionMap[behavior.defaultMainActionKey] ?? behavior.mainActions[0] ?? null;
  const animationState = forcedAction?.key ?? defaultAction?.key ?? "idle";

  return {
    steps,
    goal,
    status: behavior.energyState,
    energyState: behavior.energyState,
    longTermState: behavior.longTermState,
    backgroundState: behavior.backgroundState,
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
      brightness: energyTheme.brightness,
      cloudSpeed: energyTheme.cloudSpeed,
    },
    stageColor: energyTheme.stage,
    bubbleSurface: energyTheme.bubbleSurface,
    effect: energyTheme.effect,
    animationSpeed: energyTheme.animationSpeed,
    bobAmount: energyTheme.bobAmount,
    animationState,
    behavior,
    behaviorOverrides,
    debugVisible: Boolean(admin?.visible),
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
