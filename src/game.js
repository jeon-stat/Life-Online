export const ACTIONS = {
  exercise: { id: "exercise", label: "운동", points: 7 },
  study: { id: "study", label: "공부", points: 8 },
  clean: { id: "clean", label: "정리", points: 5 },
  sleep: { id: "sleep", label: "수면", points: 6 },
  lucky: { id: "lucky", label: "행운", points: 4 },
};

export const ACTION_LIST = Object.values(ACTIONS);

export function createGameState() {
  return {
    exp: 0,
    count: 0,
    level: 1,
    mood: "준비",
    title: "성실한 새싹 모험가",
    log: "버튼을 누르면 캐릭터가 성장합니다.",
  };
}

export function applyAction(state, action) {
  const exp = state.exp + action.points;
  const level = Math.floor(exp / 30) + 1;
  const title = exp >= 30 ? "반짝이는 루틴 모험가" : "성실한 새싹 모험가";

  return {
    exp,
    count: state.count + 1,
    level,
    mood: "뿌듯",
    title,
    log: `${action.label} 완료! 캐릭터가 +${action.points} 성장했어요.`,
  };
}
