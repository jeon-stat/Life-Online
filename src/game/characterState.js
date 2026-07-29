import { theme } from "../constants/theme.js";
import { buildBehaviorProfile } from "./behavior.js";
import { getNextRewards, getRewardsForLevel } from "./levelRewards.js";
import { buildTodayProjection, getGoalStreak, getGrowthOverview, getWeeklyResultSummary, requiredPoints } from "./progression.js";
import { DEFAULT_STEP_GOAL, getStepProgress } from "./stepRules.js";

export function buildCharacterViewModel({
  todayRecord,
  history = [],
  goal = DEFAULT_STEP_GOAL,
  growthState,
  recentFeedback = {},
} = {}) {
  const steps = todayRecord?.steps ?? 0;
  const todayProjection = buildTodayProjection({ growthState, todayRecord, goal });
  const behavior = buildBehaviorProfile({
    growthState,
    todayProjection,
    selectedActionId: growthState?.selectedActionId,
    selectedPetId: growthState?.selectedPetId,
    selectedBackgroundId: growthState?.selectedBackgroundId,
    selectedExpressionId: growthState?.selectedExpressionId,
    selectedOutfitId: growthState?.selectedOutfitId,
    recentFeedback,
  });
  const growth = getGrowthOverview(growthState);
  const progress = getStepProgress(steps, goal);
  const weeklySummary = getWeeklyResultSummary(growthState, growth.currentWeekKey);
  const streak = getGoalStreak(growthState);
  const nextRewards = getNextRewards(growth.currentLevel);
  const currentLevelRewards = getRewardsForLevel(growth.currentLevel);
  const energyLevel = resolveEnergyLevel(behavior.currentAction?.motionKind);

  return {
    steps,
    goal,
    progress,
    progressPercent: Math.round(progress * 100),
    reachedGoal: todayProjection.baseResult === "GROW",
    todayProjection,
    growth: {
      ...growth,
      lifetimeSteps: history.reduce((sum, record) => sum + (record?.steps ?? 0), 0),
    },
    streak,
    weeklySummary,
    nextRewards,
    currentLevelRewards,
    level: growth.currentLevel,
    highestLevelReached: growth.highestLevelReached,
    energyLevel,
    growthPoints: growth.growthPoints,
    pointsRequired: requiredPoints(growth.currentLevel),
    levelProgress: growth.progressRatio,
    animationState: behavior.animationState,
    animationClip: behavior.animationClip,
    animationSpeed: behavior.animationSpeed,
    currentAction: behavior.currentAction,
    behavior,
    background: behavior.selectedBackground?.palette ?? theme.status.NORMAL_ENERGY.background,
    sceneBackground: behavior.selectedBackground?.palette?.[0] ?? theme.colors.appBackground,
    sceneMood: behavior.mood,
    stageColor: behavior.selectedBackground?.stage ?? theme.colors.surfaceSoft,
    bubbleSurface: behavior.selectedBackground?.bubbleSurface ?? theme.colors.surface,
    effect: behavior.effect,
    bobAmount: behavior.currentAction?.motionKind === "run" ? 0.06 : behavior.currentAction?.motionKind === "walk" ? 0.05 : 0.04,
    statusLabel: buildStatusLabel(todayProjection),
    bubbleText: buildBubbleText(todayProjection),
    growthLabel: `Lv.${growth.currentLevel}`,
    growthDescription: describeGrowth(growth.currentLevel, nextRewards),
    backgroundState: behavior.selectedBackground?.id ?? "background-starter-meadow",
    energyState: "STEADY",
    longTermState: "GROWTH",
    memories: [],
    personality: null,
    history,
    selectedPet: behavior.selectedPet,
    selectedExpression: behavior.selectedExpression,
    selectedOutfit: behavior.selectedOutfit,
    debugVisible: false,
  };
}

function resolveEnergyLevel(motionKind) {
  if (motionKind === "walk") {
    return 4;
  }

  if (motionKind === "run") {
    return 5;
  }

  return 3;
}

function buildStatusLabel(todayProjection) {
  switch (todayProjection?.finalResult) {
    case "GROW":
      return "성장 예상";
    case "KEEP":
      return "유지 예상";
    case "REST":
      return "휴식권 예상";
    case "DROP":
      return "하락 예상";
    default:
      return "판정 제외";
  }
}

function buildBubbleText(todayProjection) {
  switch (todayProjection?.finalResult) {
    case "GROW":
      return "오늘도 세계가 조금 더 자랄 거예요.";
    case "KEEP":
      return "리듬을 지키는 하루가 되고 있어요.";
    case "REST":
      return "이번 주 휴식권이 버팀목이 되어 줄 거예요.";
    case "DROP":
      return "오늘은 천천히 마무리해도 괜찮아요.";
    default:
      return "데이터가 쌓이면 내일 판정에 반영돼요.";
  }
}

function describeGrowth(level, nextRewards) {
  if (!nextRewards?.length) {
    return `현재 레벨 ${level}의 세계를 유지하고 있어요.`;
  }

  return `다음 레벨에서 ${nextRewards.map((reward) => reward.name).join(", ")} 보상을 얻어요.`;
}
