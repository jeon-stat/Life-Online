import { DEFAULT_STEP_GOAL } from "./stepRules.js";
import { getAchievedDays, getStreak } from "./progression.js";

const PERSONALITIES = {
  balanced: {
    type: "balanced",
    label: "균형형",
    description: "천천히 리듬을 맞추며 안정적으로 걷는 성향이에요.",
    bubbleTone: "오늘도 내 페이스를 잘 지키고 있어.",
  },
  energetic: {
    type: "energetic",
    label: "활발형",
    description: "목표를 시원하게 넘기는 날이 자주 쌓이는 성향이에요.",
    bubbleTone: "몸이 먼저 앞으로 나가고 싶은 기분이야.",
  },
  steady: {
    type: "steady",
    label: "꾸준형",
    description: "하루하루 무너지지 않고 차분하게 이어 가는 성향이에요.",
    bubbleTone: "조용히 쌓이는 힘이 제일 오래가.",
  },
  nightOwl: {
    type: "nightOwl",
    label: "밤산책형",
    description: "늦은 시간의 산책 리듬과 잘 맞는 성향이에요.",
    bubbleTone: "조용한 밤 공기에서 더 편안해져.",
  },
};

export function getPersonality(history = [], goal = DEFAULT_STEP_GOAL) {
  if (!history.length) {
    return PERSONALITIES.balanced;
  }

  const achievedDays = getAchievedDays(history, goal);
  const streak = getStreak(history, goal);
  const averageSteps = history.reduce((sum, record) => sum + (record?.steps ?? 0), 0) / history.length;
  const nightWalkDays = history.filter(
    (record) => record?.walkPeriod === "night" || record?.period === "night" || record?.dayPart === "night",
  ).length;

  if (nightWalkDays >= 3) return PERSONALITIES.nightOwl;
  if (averageSteps >= goal * 1.05 || achievedDays >= 5) return PERSONALITIES.energetic;
  if (streak >= 3 || achievedDays >= 4) return PERSONALITIES.steady;

  return PERSONALITIES.balanced;
}

