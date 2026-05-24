import assert from "node:assert/strict";
import test from "node:test";

import { CHARACTER_CLASSES } from "../src/characters.js";
import { buildCharacterViewModel } from "../src/game/characterState.js";
import { getLevelProgress, getStreak, getTotalXp } from "../src/game/progression.js";
import { DEFAULT_STEP_GOAL, getCharacterStatus } from "../src/game/stepRules.js";
import { ADMIN_STEP_PRESETS, buildMockHistory } from "../src/data/mockStepData.js";

test("uses one shared imported character model", () => {
  assert.equal(CHARACTER_CLASSES.length, 1);
  assert.equal(CHARACTER_CLASSES[0].id, "custom-chibi");
  assert.equal(CHARACTER_CLASSES[0].modelUrl, "models/character.glb");
});

test("character status follows the walking thresholds", () => {
  assert.equal(getCharacterStatus(0, DEFAULT_STEP_GOAL), "tired");
  assert.equal(getCharacterStatus(2000, DEFAULT_STEP_GOAL), "idle");
  assert.equal(getCharacterStatus(5000, DEFAULT_STEP_GOAL), "active");
  assert.equal(getCharacterStatus(6500, DEFAULT_STEP_GOAL), "happy");
});

test("progression rewards daily goal completion and builds levels", () => {
  const history = buildMockHistory({ todaySteps: 8600 });
  const xp = getTotalXp(history, DEFAULT_STEP_GOAL);
  const levelState = getLevelProgress(xp);

  assert.equal(xp > 0, true);
  assert.equal(levelState.level >= 1, true);
  assert.equal(levelState.xpToNext <= 100, true);
});

test("streak counts only consecutive goal clears from today backwards", () => {
  const history = [
    { id: "a", date: "2026-05-24", steps: 6200 },
    { id: "b", date: "2026-05-23", steps: 7000 },
    { id: "c", date: "2026-05-22", steps: 1500 },
  ];

  assert.equal(getStreak(history, DEFAULT_STEP_GOAL), 2);
});

test("character view model reuses one model but changes mood output", () => {
  const history = buildMockHistory({ todaySteps: 6500 });
  const viewModel = buildCharacterViewModel({
    todayRecord: history[0],
    history,
    goal: DEFAULT_STEP_GOAL,
  });

  assert.equal(viewModel.status, "happy");
  assert.equal(typeof viewModel.bubbleText, "string");
  assert.equal(viewModel.level >= 1, true);
});

test("admin presets stay limited to mock step scenarios", () => {
  assert.deepEqual(
    ADMIN_STEP_PRESETS.map((item) => item.steps),
    [0, 1800, 4200, DEFAULT_STEP_GOAL, 8600],
  );
});
