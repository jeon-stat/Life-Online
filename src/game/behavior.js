import {
  ACTION_CATALOG,
  BACKGROUND_CATALOG,
  findActionById,
  findBackgroundById,
  findExpressionById,
  findOutfitById,
  findPetById,
  getStarterActionId,
  getStarterBackgroundId,
  getUnlockedContentIds,
} from "./levelRewards.js";
import { DAILY_RESULT_TYPES } from "./stepRules.js";

export const ACTION_TYPES = {
  DEFAULT: "default",
  FEEDBACK: "feedback",
};

export function buildBehaviorProfile({
  growthState,
  todayProjection,
  selectedActionId,
  selectedBackgroundId,
  selectedPetId,
  selectedExpressionId,
  selectedOutfitId,
  recentFeedback = {},
  admin = null,
} = {}) {
  const unlockedRewardIds = growthState?.unlockedRewardIds ?? [];
  const unlockedActionIds = new Set([
    getStarterActionId(),
    ...getUnlockedContentIds(unlockedRewardIds, "action"),
  ]);
  const availableActions = ACTION_CATALOG.filter((action) => unlockedActionIds.has(action.id));
  const selectedAction =
    availableActions.find((action) => action.id === selectedActionId) ??
    findActionById(admin?.forcedActionId ?? selectedActionId) ??
    findActionById(getStarterActionId());

  const selectedBackground =
    findBackgroundById(selectedBackgroundId) ??
    findBackgroundById(getStarterBackgroundId()) ??
    BACKGROUND_CATALOG[0];
  const selectedPet = findPetById(selectedPetId);
  const selectedExpression = findExpressionById(selectedExpressionId);
  const selectedOutfit = findOutfitById(selectedOutfitId);
  const petSpecialUnlocked = unlockedRewardIds.includes("reward-pet-sprout-cheer");
  const worldEffectUnlocked =
    unlockedRewardIds.includes("reward-world-fireflies") || unlockedRewardIds.includes("reward-world-golden-hours");
  const resolvedAction = resolveCurrentAction({
    selectedAction,
    recentFeedback,
    todayProjection,
  });

  return {
    availableActions,
    selectedAction,
    selectedBackground,
    selectedPet,
    selectedExpression,
    selectedOutfit,
    petSpecialUnlocked,
    worldEffectUnlocked,
    currentAction: resolvedAction,
    animationState: resolvedAction.animationKey,
    animationClip: resolvedAction.animationKey,
    animationSpeed: resolvedAction.clipSpeed ?? 1,
    backgroundState: selectedBackground.id,
    effect: worldEffectUnlocked ? selectedBackground.effect : "float",
    mood: {
      background: selectedBackground.palette,
      stage: selectedBackground.stage,
      bubbleSurface: selectedBackground.bubbleSurface,
      effect: worldEffectUnlocked ? selectedBackground.effect : "float",
      brightness: selectedBackground.brightness,
      cloudSpeed: selectedBackground.cloudSpeed,
    },
    signature: [
      selectedAction?.id ?? "",
      resolvedAction?.id ?? "",
      selectedBackground?.id ?? "",
      selectedPet?.id ?? "",
      todayProjection?.finalResult ?? "",
      recentFeedback?.celebrating ? "celebrate" : "",
      recentFeedback?.walking ? "walking" : "",
    ].join(";"),
  };
}

function resolveCurrentAction({ selectedAction, recentFeedback, todayProjection }) {
  if (recentFeedback?.celebrating || todayProjection?.finalResult === DAILY_RESULT_TYPES.GROW && todayProjection?.ratio >= 1.15) {
    return {
      id: "feedback-celebrate",
      label: "축하",
      animationKey: "hipHopDancing",
      preview: "Hip Hop Dancing",
      motionKind: "neutral",
      clipSpeed: 1,
      worldSpeed: 0.04,
      type: ACTION_TYPES.FEEDBACK,
    };
  }

  if (recentFeedback?.walking) {
    return {
      id: "feedback-walk",
      label: "걷는 중",
      animationKey: "energy4",
      preview: "Walking",
      motionKind: "walk",
      clipSpeed: 1.02,
      worldSpeed: 0.14,
      type: ACTION_TYPES.FEEDBACK,
    };
  }

  if (recentFeedback?.welcoming) {
    return {
      id: "feedback-welcome",
      label: "반갑게 둘러보기",
      animationKey: "energy2",
      preview: "Breathing Idle",
      motionKind: "neutral",
      clipSpeed: 1,
      worldSpeed: 0.02,
      type: ACTION_TYPES.FEEDBACK,
    };
  }

  return {
    ...(selectedAction ?? findActionById(getStarterActionId())),
    type: ACTION_TYPES.DEFAULT,
  };
}
