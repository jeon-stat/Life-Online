export const CATEGORY_LIMITS = {
  body: 30,
  focus: 30,
  mind: 20,
  life: 20,
};

export const DAILY_EXP_CAP = 100;

export const ACTIONS = {
  walkGoal: { id: "walkGoal", label: "걸음 목표", points: 18, category: "body" },
  focusSession: { id: "focusSession", label: "집중 세션", points: 20, category: "focus" },
  windDown: { id: "windDown", label: "수면 준비", points: 16, category: "body" },
  tidyReset: { id: "tidyReset", label: "정리 리셋", points: 12, category: "life" },
  reflection: { id: "reflection", label: "하루 회고", points: 10, category: "mind" },
};

export const ACTION_LIST = Object.values(ACTIONS);

export function createGameState() {
  return {
    exp: 0,
    dailyExp: 0,
    count: 0,
    level: 1,
    mood: "준비",
    title: "성실한 새싹 모험가",
    log: "오늘의 좋은 행동이 캐릭터 성장으로 이어지도록 설계해보세요.",
    actionCounts: {},
    categoryTotals: {
      body: 0,
      focus: 0,
      mind: 0,
      life: 0,
    },
    history: [],
  };
}

export function applyAction(state, action) {
  const actionCount = state.actionCounts[action.id] ?? 0;
  const multiplier = getRepeatMultiplier(actionCount);
  const baseGain = Math.round(action.points * multiplier);
  const categoryCurrent = state.categoryTotals[action.category] ?? 0;
  const categoryRemaining = Math.max(0, CATEGORY_LIMITS[action.category] - categoryCurrent);
  const dailyRemaining = Math.max(0, DAILY_EXP_CAP - state.dailyExp);
  const earned = Math.max(0, Math.min(baseGain, categoryRemaining, dailyRemaining));

  if (earned === 0) {
    return {
      ...state,
      mood: "차분",
      log: `${action.label}은(는) 이미 오늘 보상을 거의 다 받았어요. 다른 카테고리를 채워보세요.`,
    };
  }

  const exp = state.exp + earned;
  const dailyExp = state.dailyExp + earned;
  const level = Math.floor(exp / 60) + 1;
  const title = getTitleFromLevel(level);

  return {
    ...state,
    exp,
    dailyExp,
    count: state.count + 1,
    level,
    title,
    mood: getMoodFromCategory(action.category),
    log: `${action.label} 완료! ${action.category.toUpperCase()} 성장치 +${earned}를 획득했어요.`,
    actionCounts: {
      ...state.actionCounts,
      [action.id]: actionCount + 1,
    },
    categoryTotals: {
      ...state.categoryTotals,
      [action.category]: categoryCurrent + earned,
    },
    history: [
      {
        id: `${action.id}-${state.count + 1}`,
        label: action.label,
        earned,
        category: action.category,
      },
      ...state.history,
    ].slice(0, 8),
  };
}

function getRepeatMultiplier(actionCount) {
  if (actionCount === 0) return 1;
  if (actionCount === 1) return 0.6;
  return 0.25;
}

function getMoodFromCategory(category) {
  if (category === "focus") return "몰입";
  if (category === "mind") return "정돈";
  if (category === "life") return "개운";
  return "활성";
}

function getTitleFromLevel(level) {
  if (level >= 5) return "리듬을 만든 성장 플레이어";
  if (level >= 3) return "반짝이는 루틴 모험가";
  return "성실한 새싹 모험가";
}
