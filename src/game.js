export const ACTIONS = {
  exercise: { id: "exercise", label: "\uC6B4\uB3D9", points: 7 },
  study: { id: "study", label: "\uACF5\uBD80", points: 8 },
  clean: { id: "clean", label: "\uC815\uB9AC", points: 5 },
  sleep: { id: "sleep", label: "\uC218\uBA74", points: 6 },
  lucky: { id: "lucky", label: "\uD589\uC6B4", points: 4 },
};

export const ACTION_LIST = Object.values(ACTIONS);

export function createGameState() {
  return {
    exp: 0,
    count: 0,
    level: 1,
    mood: "\uC900\uBE44",
    title: "\uC131\uC2E4\uD55C \uC0C8\uC2F9 \uBAA8\uD5D8\uAC00",
    log: "\uBC84\uD2BC\uC744 \uB204\uB974\uBA74 \uCE90\uB9AD\uD130\uAC00 \uC131\uC7A5\uD569\uB2C8\uB2E4.",
  };
}

export function applyAction(state, action) {
  const exp = state.exp + action.points;
  const level = Math.floor(exp / 30) + 1;
  const title =
    exp >= 30
      ? "\uBC18\uC9DD\uC774\uB294 \uB8E8\uD2F4 \uBAA8\uD5D8\uAC00"
      : "\uC131\uC2E4\uD55C \uC0C8\uC2F9 \uBAA8\uD5D8\uAC00";

  return {
    exp,
    count: state.count + 1,
    level,
    mood: "\uBFCC\uB4EF",
    title,
    log: `${action.label} \uC644\uB8CC! \uCE90\uB9AD\uD130\uAC00 +${action.points} \uC131\uC7A5\uD588\uC5B4\uC694.`,
  };
}
