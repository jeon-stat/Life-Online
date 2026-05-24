import { DEFAULT_STEP_GOAL } from "./stepRules.js";
import { getStreak } from "./progression.js";

function formatMemoryDate(date) {
  if (!date) return "";

  const value = new Date(date);
  return `${value.getMonth() + 1}\uC6D4 ${value.getDate()}\uC77C`;
}

export function getMemories(history = [], goal = DEFAULT_STEP_GOAL) {
  const memories = [];
  const firstGoalReached = [...history].reverse().find((record) => (record?.steps ?? 0) >= goal);
  const bestStepDay = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }

    return best;
  }, null);

  if (firstGoalReached) {
    memories.push({
      id: "firstGoalReached",
      title: "\uCCAB \uBAA9\uD45C \uB2EC\uC131",
      summary: `${formatMemoryDate(firstGoalReached.date)}\uC5D0 \uCC98\uC74C\uC73C\uB85C \uC0B0\uCC45 \uBAA9\uD45C\uB97C \uB118\uACBC\uC5B4\uC694.`,
      date: firstGoalReached.date,
    });
  }

  if (getStreak(history, goal) >= 7) {
    memories.push({
      id: "sevenDayStreak",
      title: "7\uC77C \uC5F0\uC18D \uC0B0\uCC45",
      summary: "\uC77C\uC8FC\uC77C \uC5F0\uC18D\uC73C\uB85C \uBAA9\uD45C\uB97C \uC774\uC5B4 \uAC14\uC5B4\uC694.",
      date: history[0]?.date ?? null,
    });
  }

  if (bestStepDay && (bestStepDay.steps ?? 0) > 0) {
    memories.push({
      id: "bestStepDay",
      title: "\uAC00\uC7A5 \uB9CE\uC774 \uAC78\uC740 \uB0A0",
      summary: `${formatMemoryDate(bestStepDay.date)}\uC5D0 ${bestStepDay.steps.toLocaleString()}\uBCF4\uB97C \uAC78\uC5C8\uC5B4\uC694.`,
      date: bestStepDay.date,
    });
  }

  return memories.slice(0, 2);
}
