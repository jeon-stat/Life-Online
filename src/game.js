export const CATEGORY_LIMITS = {
  body: 30,
  focus: 30,
  mind: 20,
  life: 20,
};

export const DAILY_EXP_CAP = 100;

export const ACTIONS = {
  walkGoal: { id: "walkGoal", label: "\uAC78\uC74C \uBAA9\uD45C", points: 18, category: "body", dailyLimit: 3 },
  focusSession: { id: "focusSession", label: "\uC9D1\uC911 \uC138\uC158", points: 20, category: "focus", dailyLimit: 3 },
  windDown: { id: "windDown", label: "\uC218\uBA74 \uC900\uBE44", points: 16, category: "body", dailyLimit: 3 },
  tidyReset: { id: "tidyReset", label: "\uC815\uB9AC \uB9AC\uC14B", points: 12, category: "life", dailyLimit: 3 },
  reflection: { id: "reflection", label: "\uD558\uB8E8 \uD68C\uACE0", points: 10, category: "mind", dailyLimit: 3 },
};

export const ACTION_LIST = Object.values(ACTIONS);

export function createGameState() {
  return {
    exp: 0,
    dailyExp: 0,
    count: 0,
    level: 1,
    mood: "\uC900\uBE44",
    title: "\uC131\uC7A5\uC744 \uC2DC\uC791\uD558\uB294 \uD50C\uB808\uC774\uC5B4",
    log: "\uC624\uB298\uC758 \uC88B\uC740 \uD589\uB3D9\uC774 \uCE90\uB9AD\uD130 \uC131\uC7A5\uC73C\uB85C \uC774\uC5B4\uC9C0\uB3C4\uB85D \uD55C \uAC78\uC74C\uC529 \uC313\uC544\uBCF4\uC138\uC694.",
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
  const dailyLimit = action.dailyLimit ?? 3;

  if (actionCount >= dailyLimit) {
    return {
      ...state,
      mood: "\uCC28\uBD84",
      log: `${action.label}\uC740 \uC624\uB298 ${dailyLimit}\uD68C\uAE4C\uC9C0 \uAE30\uB85D\uD560 \uC218 \uC788\uC5B4\uC694.`,
    };
  }

  const multiplier = getRepeatMultiplier(actionCount);
  const baseGain = Math.round(action.points * multiplier);
  const categoryCurrent = state.categoryTotals[action.category] ?? 0;
  const categoryRemaining = Math.max(0, CATEGORY_LIMITS[action.category] - categoryCurrent);
  const dailyRemaining = Math.max(0, DAILY_EXP_CAP - state.dailyExp);
  const earned = Math.max(0, Math.min(baseGain, categoryRemaining, dailyRemaining));

  if (earned === 0) {
    return {
      ...state,
      mood: "\uCC28\uBD84",
      log: `${action.label} \uBCF4\uC0C1\uC740 \uC9C0\uAE08 \uBC1B\uC744 \uC218 \uC5C6\uC5B4\uC694. \uB2E4\uB978 \uD589\uB3D9\uC73C\uB85C \uADE0\uD615\uC744 \uCC44\uC6CC\uBCF4\uC138\uC694.`,
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
    log: `${action.label} \uC644\uB8CC! ${earned} XP\uB97C \uD68D\uB4DD\uD588\uC5B4\uC694.`,
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
  if (actionCount === 1) return 0.7;
  return 0.45;
}

function getMoodFromCategory(category) {
  if (category === "focus") return "\uBAB0\uC785";
  if (category === "mind") return "\uC815\uB3C8";
  if (category === "life") return "\uAC1C\uC6B4";
  return "\uD65C\uC131";
}

function getTitleFromLevel(level) {
  if (level >= 5) return "\uB9AC\uB4EC\uC744 \uB9CC\uB4DC\uB294 \uC131\uC7A5 \uD50C\uB808\uC774\uC5B4";
  if (level >= 3) return "\uBC18\uC9DD\uC774\uB294 \uB8E8\uD2F4 \uBAA8\uD5D8\uAC00";
  return "\uC131\uC7A5\uC744 \uC2DC\uC791\uD558\uB294 \uD50C\uB808\uC774\uC5B4";
}
