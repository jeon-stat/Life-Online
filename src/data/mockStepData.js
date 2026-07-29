import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";
import { addDays, createLocalDateFromKey, formatDateKey, normalizeDateKey } from "../game/dateUtils.js";

export const ADMIN_STEP_PRESETS = [
  { id: "rest", label: "0보", steps: 0 },
  { id: "keep", label: "5,500보", steps: 5500 },
  { id: "grow", label: `${DEFAULT_STEP_GOAL.toLocaleString("ko-KR")}보`, steps: DEFAULT_STEP_GOAL },
  { id: "bonus", label: "13,200보", steps: 13200 },
];

const DEFAULT_HISTORY_DAYS = 365;
const RECENT_WEEK_PATTERN = [8800, 6200, 11000, 4900, 9300, 7800, 10100];
const HOUR_BINS = 24;

export function buildMockHistory({
  baseDate = new Date("2026-07-29T12:00:00+09:00"),
  days = DEFAULT_HISTORY_DAYS,
  todaySteps = RECENT_WEEK_PATTERN[0],
  todaySource = "mock",
} = {}) {
  const baseDateKey = normalizeDateKey(baseDate);
  const normalizedBaseDate = createLocalDateFromKey(baseDateKey);

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(normalizedBaseDate, -index);
    const dateKey = formatDateKey(date);
    const steps =
      index === 0
        ? normalizeSteps(todaySteps ?? RECENT_WEEK_PATTERN[0])
        : index < RECENT_WEEK_PATTERN.length
          ? RECENT_WEEK_PATTERN[index]
          : generateDailySteps(date, index);

    return {
      id: dateKey,
      date: dateKey,
      steps,
      source: index === 0 ? todaySource : "mock",
      hasData: true,
      hourlySteps: buildHourlySteps(date, steps),
    };
  });
}

export function createMockStepSnapshot(baseDate = new Date("2026-07-29T12:00:00+09:00")) {
  return {
    mode: "mock",
    source: "mock",
    history: buildMockHistory({ baseDate }),
  };
}

export function updateMockHistorySteps(history = [], dateKey, steps) {
  const normalizedDateKey = normalizeDateKey(dateKey);
  const nextRecord = {
    id: normalizedDateKey,
    date: normalizedDateKey,
    steps: normalizeSteps(steps),
    source: "admin_override",
    hasData: true,
    hourlySteps: buildHourlySteps(createLocalDateFromKey(normalizedDateKey), normalizeSteps(steps)),
  };

  const byDate = new Map(history.map((record) => [record.date, record]));
  byDate.set(normalizedDateKey, {
    ...(byDate.get(normalizedDateKey) ?? {}),
    ...nextRecord,
  });

  return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date)).slice(0, DEFAULT_HISTORY_DAYS);
}

export function advanceMockHistoryDay(history = [], nextTodaySteps = 0) {
  const today = history[0]?.date ?? "2026-07-29";
  const nextDate = formatDateKey(addDays(createLocalDateFromKey(today), 1));
  const nextHistory = updateMockHistorySteps(history, nextDate, nextTodaySteps);

  return nextHistory.sort((left, right) => right.date.localeCompare(left.date)).slice(0, DEFAULT_HISTORY_DAYS);
}

function normalizeSteps(value) {
  const numeric = Math.round(Number(value ?? 0));
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, numeric);
}

function generateDailySteps(date, age) {
  const dayOfYear = getDayOfYear(date);
  const weekday = date.getDay();
  const recentBoost = Math.max(0, 1800 - age * 9);
  const seasonalWave = Math.sin((dayOfYear / 365) * Math.PI * 2) * 900;
  const midWave = Math.cos((dayOfYear / 48) * Math.PI * 2) * 700;
  const shortWave = Math.sin(dayOfYear / 6.3) * 650;
  const weekdayBoost = [-900, 120, 240, 360, 620, 1600, 1100][weekday] ?? 0;
  const noise = seededNoise(dayOfYear, weekday) * 900;
  const base = 4300 + recentBoost + seasonalWave + midWave + shortWave + weekdayBoost + noise;

  return clampSteps(Math.round(base), 1200, 15200);
}

function buildHourlySteps(date, totalSteps) {
  const target = normalizeSteps(totalSteps);
  if (!target) {
    return Array.from({ length: HOUR_BINS }, () => 0);
  }

  const weekday = date.getDay();
  const dayTypeBoost = weekday === 0 || weekday === 6 ? 1.12 : weekday === 5 ? 1.08 : 1;
  const weights = Array.from({ length: HOUR_BINS }, (_, hour) => {
    const morning = gaussian(hour, 8, 2.2) * 1.25;
    const lunch = gaussian(hour, 13, 2.0) * 1.08;
    const evening = gaussian(hour, 19, 2.3) * 1.18;
    const night = hour < 6 ? 0.08 : 0.02;
    const commute = hour >= 7 && hour <= 9 ? 0.12 : 0;
    const weekend = (weekday === 0 || weekday === 6) && hour >= 9 && hour <= 20 ? 0.08 : 0;

    return (0.05 + morning + lunch + evening + night + commute + weekend) * dayTypeBoost;
  });

  return distributeIntegerValues(target, weights);
}

function distributeIntegerValues(total, weights) {
  const safeWeights = weights.map((weight) => Math.max(0, Number(weight ?? 0)));
  const weightSum = safeWeights.reduce((sum, weight) => sum + weight, 0) || 1;
  const rawValues = safeWeights.map((weight) => (weight / weightSum) * total);
  const values = rawValues.map((value) => Math.floor(value));
  let remainder = total - values.reduce((sum, value) => sum + value, 0);

  const ordering = rawValues
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; remainder > 0; index += 1) {
    const slot = ordering[index % ordering.length];
    values[slot.index] += 1;
    remainder -= 1;
  }

  return values;
}

function gaussian(x, center, spread) {
  const distance = (x - center) / spread;
  return Math.exp(-0.5 * distance * distance);
}

function seededNoise(dayOfYear, weekday) {
  const seed = Math.sin(dayOfYear * 12.9898 + weekday * 78.233) * 43758.5453;
  return (seed - Math.floor(seed)) * 2 - 1;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function clampSteps(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
