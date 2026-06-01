import assert from "node:assert/strict";
import test from "node:test";

import { CHARACTER_CLASSES } from "../src/characters.js";
import { buildCharacterViewModel } from "../src/game/characterState.js";
import { getLevelProgress, getStreak, getTotalXp } from "../src/game/progression.js";
import { DEFAULT_STEP_GOAL, getEnergyLevel } from "../src/game/stepRules.js";
import { ADMIN_STEP_PRESETS, buildMockHistory } from "../src/data/mockStepData.js";

test("uses one shared imported character model", () => {
  assert.equal(CHARACTER_CLASSES.length, 1);
  assert.equal(CHARACTER_CLASSES[0].id, "custom-chibi");
  assert.equal(CHARACTER_CLASSES[0].modelUrl, "models/chibi_animated.glb");
});

test("energy level follows the new 0-to-6 tiers", () => {
  assert.equal(getEnergyLevel(0, DEFAULT_STEP_GOAL), 0);
  assert.equal(getEnergyLevel(700, DEFAULT_STEP_GOAL), 1);
  assert.equal(getEnergyLevel(1600, DEFAULT_STEP_GOAL), 2);
  assert.equal(getEnergyLevel(2600, DEFAULT_STEP_GOAL), 3);
  assert.equal(getEnergyLevel(3800, DEFAULT_STEP_GOAL), 4);
  assert.equal(getEnergyLevel(5200, DEFAULT_STEP_GOAL), 5);
  assert.equal(getEnergyLevel(6500, DEFAULT_STEP_GOAL), 6);
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

test("character view model maps high energy to the special dance clip", () => {
  const history = buildMockHistory({ todaySteps: 6500 });
  const viewModel = buildCharacterViewModel({
    todayRecord: history[0],
    history,
    goal: DEFAULT_STEP_GOAL,
  });

  assert.equal(viewModel.energyLevel, 6);
  assert.equal(viewModel.animationState, "energy6");
  assert.equal(viewModel.animationClip, "hip-hop-dancing");
  assert.equal(typeof viewModel.bubbleText, "string");
  assert.equal(viewModel.level >= 1, true);
  assert.equal(viewModel.behavior.specialActionPool.length, 2);
  assert.deepEqual(
    viewModel.behavior.specialActionPool.map((action) => action.weight),
    [50, 50],
  );
});

test("forced energy level drives the visible behavior state", () => {
  const history = buildMockHistory({ todaySteps: 6500 });
  const viewModel = buildCharacterViewModel({
    todayRecord: history[0],
    history,
    goal: DEFAULT_STEP_GOAL,
    admin: {
      forcedEnergyLevel: 0,
      forcedLongTermState: null,
    },
  });

  assert.equal(viewModel.energyLevel, 0);
  assert.equal(viewModel.energyState, "LOW_ENERGY");
  assert.equal(viewModel.animationState, "energy0");
  assert.equal(viewModel.backgroundState, "LOW_ENERGY");
});

test("forced special action drives the energy 6 dance selection", () => {
  const history = buildMockHistory({ todaySteps: 6500 });
  const viewModel = buildCharacterViewModel({
    todayRecord: history[0],
    history,
    goal: DEFAULT_STEP_GOAL,
    admin: {
      forcedEnergyLevel: null,
      forcedLongTermState: null,
      forcedSpecialActionKey: "moonwalk",
    },
  });

  assert.equal(viewModel.energyLevel, 6);
  assert.equal(viewModel.behavior.forcedSpecialActionKey, "moonwalk");
  assert.equal(viewModel.animationState, "moonwalk");
  assert.equal(viewModel.animationClip, "moonwalk");
});

test("admin presets stay limited to mock step scenarios", () => {
  assert.deepEqual(
    ADMIN_STEP_PRESETS.map((item) => item.steps),
    [0, 1800, 4200, DEFAULT_STEP_GOAL, 8600],
  );
});
