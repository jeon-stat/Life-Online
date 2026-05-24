import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";

export const ADMIN_STEP_PRESETS = [
  { id: "rest", label: "0\uBCF4", steps: 0 },
  { id: "warm", label: "1800\uBCF4", steps: 1800 },
  { id: "steady", label: "4200\uBCF4", steps: 4200 },
  { id: "goal", label: `${DEFAULT_STEP_GOAL}\uBCF4`, steps: DEFAULT_STEP_GOAL },
  { id: "bonus", label: "8600\uBCF4", steps: 8600 },
];

const BASE_PATTERN = [4200, 7100, 5100, 6300, 7900, 3600, 5500];

export function buildMockHistory({ baseDate = new Date(), todaySteps = BASE_PATTERN[0], todaySource = "mock" } = {}) {
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(baseDate);
    next.setDate(baseDate.getDate() - index);

    return {
      id: next.toISOString().slice(0, 10),
      date: next.toISOString().slice(0, 10),
      steps: index === 0 ? todaySteps : BASE_PATTERN[index] ?? 0,
      source: index === 0 ? todaySource : "mock",
    };
  });
}

export function createMockStepSnapshot() {
  return {
    mode: "mock",
    source: "mock",
    history: buildMockHistory(),
  };
}

export function applyAdminOverride(steps) {
  return {
    mode: "mock",
    source: "admin_override",
    history: buildMockHistory({
      baseDate: new Date(),
      todaySteps: steps,
      todaySource: "admin_override",
    }),
  };
}
