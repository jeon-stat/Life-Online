import assert from "node:assert/strict";
import test from "node:test";

import {
  HISTORY_RETENTION_DAYS,
  migratePersistedStepData,
  normalizeStepRecord,
} from "../src/data/stepDataMigration.js";
import { buildMockHistory } from "../src/data/mockStepData.js";
import { getRewardById } from "../src/game/levelRewards.js";
import {
  applyGrowthDelta,
  buildTodayProjection,
  createDefaultGrowthState,
  getGrowthOverview,
  getRecentDailyResults,
  normalizeGrowthState,
  processPendingDailyResults,
  requiredPoints,
} from "../src/game/progression.js";
import { DAILY_RESULT_TYPES, DEFAULT_STEP_GOAL, buildProjectedDailyOutcome, classifyDailyActivity } from "../src/game/stepRules.js";

const TODAY_DATE_KEY = "2026-07-29";

test("classifies GROW, KEEP, and DROP by completion ratio", () => {
  assert.equal(classifyDailyActivity({ steps: 10000, goal: DEFAULT_STEP_GOAL }), DAILY_RESULT_TYPES.GROW);
  assert.equal(classifyDailyActivity({ steps: 6500, goal: DEFAULT_STEP_GOAL }), DAILY_RESULT_TYPES.KEEP);
  assert.equal(classifyDailyActivity({ steps: 2400, goal: DEFAULT_STEP_GOAL }), DAILY_RESULT_TYPES.DROP);
});

test("treats missing data as UNKNOWN instead of DROP", () => {
  assert.equal(
    classifyDailyActivity({ steps: 0, goal: DEFAULT_STEP_GOAL, hasData: false }),
    DAILY_RESULT_TYPES.UNKNOWN,
  );
});

test("adds one growth point on GROW", () => {
  const next = applyGrowthDelta(createDefaultGrowthState(), 1, "2026-07-28");
  assert.equal(next.currentLevel, 1);
  assert.equal(next.growthPoints, 1);
});

test("levels up when required points are reached", () => {
  let state = createDefaultGrowthState();
  state = applyGrowthDelta(state, 1, "2026-07-26");
  state = applyGrowthDelta(state, 1, "2026-07-27");

  assert.equal(state.currentLevel, 2);
  assert.equal(state.growthPoints, 0);
  assert.equal(state.highestLevelReached, 2);
});

test("subtracts points before dropping a level", () => {
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    currentLevel: 3,
    highestLevelReached: 3,
    growthPoints: 2,
  });
  const next = applyGrowthDelta(state, -1, "2026-07-28");

  assert.equal(next.currentLevel, 3);
  assert.equal(next.growthPoints, 1);
});

test("drops a level when points are empty", () => {
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    currentLevel: 3,
    highestLevelReached: 3,
    growthPoints: 0,
  });
  const next = applyGrowthDelta(state, -1, "2026-07-28");

  assert.equal(next.currentLevel, 2);
  assert.equal(next.growthPoints, 0);
});

test("never drops below level one", () => {
  const next = applyGrowthDelta(createDefaultGrowthState(), -3, "2026-07-28");

  assert.equal(next.currentLevel, 1);
  assert.equal(next.growthPoints, 0);
});

test("uses the weekly rest ticket on the first DROP in a week", () => {
  const history = [
    normalizeStepRecord({ date: "2026-07-29", steps: 9000, hasData: true }),
    normalizeStepRecord({ date: "2026-07-28", steps: 2400, hasData: true }),
  ];
  const next = processPendingDailyResults({
    growthState: createDefaultGrowthState(),
    history,
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });

  const results = getRecentDailyResults(next);
  assert.equal(results[0].finalResult, DAILY_RESULT_TYPES.REST);
  assert.equal(next.currentLevel, 1);
  assert.equal(next.weeklyRestUsed, true);
});

test("resets the weekly rest ticket in a new week", () => {
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    currentWeekKey: "2026-07-20",
    weeklyRestUsed: true,
    processedDailyResults: {
      "2026-07-22": {
        date: "2026-07-22",
        weekKey: "2026-07-20",
        steps: 1000,
        goal: DEFAULT_STEP_GOAL,
        ratio: 0.1,
        baseResult: DAILY_RESULT_TYPES.DROP,
        finalResult: DAILY_RESULT_TYPES.REST,
        usesRest: true,
        delta: 0,
        hasData: true,
      },
    },
  });

  const next = processPendingDailyResults({
    growthState: state,
    history: [normalizeStepRecord({ date: "2026-07-29", steps: 5000 })],
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });

  assert.equal(next.currentWeekKey, "2026-07-27");
  assert.equal(next.weeklyRestUsed, false);
});

test("does not process the same date twice", () => {
  const history = [
    normalizeStepRecord({ date: "2026-07-29", steps: 9200, hasData: true }),
    normalizeStepRecord({ date: "2026-07-28", steps: 11000, hasData: true }),
  ];
  const once = processPendingDailyResults({
    growthState: createDefaultGrowthState(),
    history,
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });
  const twice = processPendingDailyResults({
    growthState: once,
    history,
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });

  assert.equal(twice.currentLevel, once.currentLevel);
  assert.equal(twice.growthPoints, once.growthPoints);
  assert.equal(Object.keys(twice.processedDailyResults).length, 1);
});

test("does not confirm today's date", () => {
  const history = [
    normalizeStepRecord({ date: "2026-07-29", steps: 12000, hasData: true }),
    normalizeStepRecord({ date: "2026-07-28", steps: 5500, hasData: true }),
  ];
  const next = processPendingDailyResults({
    growthState: createDefaultGrowthState(),
    history,
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });

  assert.deepEqual(Object.keys(next.processedDailyResults), ["2026-07-28"]);
});

test("keeps highest level reached after a level drop", () => {
  const rewardId = getRewardById("reward-expression-soft-smile").id;
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    currentLevel: 3,
    highestLevelReached: 4,
    unlockedRewardIds: [rewardId],
  });
  const next = applyGrowthDelta(state, -1, "2026-07-28");

  assert.equal(next.highestLevelReached, 4);
  assert.equal(next.unlockedRewardIds.includes(rewardId), true);
  assert.equal(next.unlockedRewardIds.includes("reward-pet-sprout"), true);
});

test("keeps unlocked rewards after leveling down", () => {
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    currentLevel: 4,
    highestLevelReached: 4,
    growthPoints: 0,
    unlockedRewardIds: ["reward-pet-sprout"],
  });
  const next = applyGrowthDelta(state, -1, "2026-07-28");

  assert.equal(next.currentLevel, 3);
  assert.equal(next.unlockedRewardIds.includes("reward-pet-sprout"), true);
});

test("migrates legacy v2 storage without losing shop or history state", () => {
  const migrated = migratePersistedStepData({
    shopState: {
      coinBalance: 1400,
      ownedItemIdsByCategory: {
        top: ["top-1", "top-7"],
        bottom: ["bottom-1"],
        expression: ["expression-1"],
        background: ["background-1"],
        item: ["item-1"],
        skinTone: ["fair-1"],
      },
      selectedItemIdsByCategory: {
        top: "top-7",
        bottom: "bottom-1",
        expression: "expression-1",
        background: "background-1",
        item: "item-1",
        skinTone: "fair-1",
      },
      skinToneId: "fair-1",
    },
    claimedMissionRewardIds: ["daily-goal"],
    deviceStepState: {
      history: [
        { date: "2026-07-29", steps: 8700, hasData: true },
        { date: "2026-07-28", steps: 11200, hasData: true },
      ],
      lastSyncAt: "2026-07-29T08:00:00.000Z",
      permissionStatus: "granted",
      pedometerAvailable: true,
    },
  });

  assert.equal(migrated.shopState.coinBalance, 1400);
  assert.equal(migrated.shopState.selectedItemIdsByCategory.top, "top-7");
  assert.equal(migrated.claimedMissionRewardIds.includes("daily-goal"), true);
  assert.equal(migrated.deviceStepState.history.length, 2);
  assert.equal(migrated.growthState.currentLevel >= 1, true);
});

test("uses the same rules for mock and device records", () => {
  const mockHistory = buildMockHistory({
    baseDate: new Date("2026-07-29T12:00:00+09:00"),
    days: 3,
    todaySteps: 9000,
  });
  const deviceHistory = mockHistory.map((record, index) =>
    normalizeStepRecord({
      ...record,
      source: index === 0 ? "device" : "device_history",
    }),
  );

  const mockProcessed = processPendingDailyResults({
    growthState: createDefaultGrowthState(),
    history: mockHistory,
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });
  const deviceProcessed = processPendingDailyResults({
    growthState: createDefaultGrowthState(),
    history: deviceHistory,
    goal: DEFAULT_STEP_GOAL,
    todayDateKey: TODAY_DATE_KEY,
  });

  assert.deepEqual(mockProcessed.processedDailyResults, deviceProcessed.processedDailyResults);
});

test("projects today's result without confirming it", () => {
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    weeklyRestUsed: false,
  });
  const projection = buildTodayProjection({
    growthState: state,
    todayRecord: normalizeStepRecord({ date: TODAY_DATE_KEY, steps: 4300, hasData: true }),
    goal: DEFAULT_STEP_GOAL,
  });

  assert.equal(projection.finalResult, DAILY_RESULT_TYPES.REST);
  assert.equal(projection.delta, 0);
});

test("manual projected outcomes match direct projected rule helper", () => {
  const projection = buildProjectedDailyOutcome({
    steps: 4400,
    goal: DEFAULT_STEP_GOAL,
    hasData: true,
    weeklyRestUsed: true,
  });

  assert.equal(projection.finalResult, DAILY_RESULT_TYPES.DROP);
  assert.equal(projection.delta, -1);
});

test("normalizes retained history to the configured limit", () => {
  const history = buildMockHistory({
    baseDate: new Date("2026-07-29T12:00:00+09:00"),
    days: HISTORY_RETENTION_DAYS + 20,
  });

  assert.equal(history.length, HISTORY_RETENTION_DAYS + 20);
});

test("required points cap at seven from higher levels", () => {
  assert.equal(requiredPoints(1), 2);
  assert.equal(requiredPoints(2), 3);
  assert.equal(requiredPoints(6), 7);
  assert.equal(requiredPoints(19), 7);
});

test("growth overview exposes current gauge state", () => {
  const state = normalizeGrowthState({
    ...createDefaultGrowthState(),
    currentLevel: 5,
    highestLevelReached: 6,
    growthPoints: 3,
  });
  const overview = getGrowthOverview(state);

  assert.equal(overview.currentLevel, 5);
  assert.equal(overview.highestLevelReached, 6);
  assert.equal(overview.pointsRequired, 6);
  assert.equal(overview.progressRatio, 0.5);
});
