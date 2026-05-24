import { DEFAULT_STEP_GOAL } from "./stepRules.js";
import { getAchievedDays, getStreak } from "./progression.js";

const PERSONALITIES = {
  balanced: {
    type: "balanced",
    label: "\uADE0\uD615\uD615",
    description: "\uCC9C\uCC9C\uD788 \uB9AC\uB4EC\uC744 \uB9DE\uCD94\uBA70 \uC548\uC815\uC801\uC73C\uB85C \uAC77\uB294 \uC131\uD5A5\uC774\uC5D0\uC694.",
    bubbleTone: "\uC624\uB298\uB3C4 \uB0B4 \uD398\uC774\uC2A4\uB97C \uC798 \uC9C0\uD0A4\uACE0 \uC788\uC5B4.",
  },
  energetic: {
    type: "energetic",
    label: "\uD65C\uBC1C\uD615",
    description: "\uBAA9\uD45C\uB97C \uC2DC\uC6D0\uD558\uAC8C \uB118\uAE30\uB294 \uB0A0\uC774 \uC790\uC8FC \uC313\uC774\uB294 \uC131\uD5A5\uC774\uC5D0\uC694.",
    bubbleTone: "\uBAB8\uC774 \uBA3C\uC800 \uC55E\uC73C\uB85C \uB098\uAC00\uACE0 \uC2F6\uC740 \uAE30\uBD84\uC774\uC57C.",
  },
  steady: {
    type: "steady",
    label: "\uAFB8\uC900\uD615",
    description: "\uD558\uB8E8\uD558\uB8E8 \uBB34\uB108\uC9C0\uC9C0 \uC54A\uACE0 \uCC28\uBD84\uD558\uAC8C \uC774\uC5B4 \uAC00\uB294 \uC131\uD5A5\uC774\uC5D0\uC694.",
    bubbleTone: "\uC870\uC6A9\uD788 \uC313\uC774\uB294 \uD798\uC774 \uC81C\uC77C \uC624\uB798\uAC00.",
  },
  nightOwl: {
    type: "nightOwl",
    label: "\uBC24\uC0B0\uCC45\uD615",
    description: "\uB2A6\uC740 \uC2DC\uAC04\uC758 \uC0B0\uCC45 \uB9AC\uB4EC\uACFC \uC798 \uB9DE\uB294 \uC131\uD5A5\uC774\uC5D0\uC694.",
    bubbleTone: "\uC870\uC6A9\uD55C \uBC24 \uACF5\uAE30\uC5D0\uC11C \uB354 \uD3B8\uC548\uD574\uC838.",
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
