import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ACTIONS, CATEGORY_LIMITS, DAILY_EXP_CAP, applyAction, createGameState } from "../src/game.js";
import { CHARACTER_CLASSES, STAGE_MODE } from "../src/characters.js";
import { buildHomeDatePanels } from "../src/home/buildHomeDatePanels.js";
import { CHARACTER_SCALE, STAGE_LAYOUT } from "../src/scene/stageConfig.js";
import { getRotationFromDrag } from "../src/scene/rotationMath.js";

test("focus session grants strong progress on first completion", () => {
  const nextState = applyAction(createGameState(), ACTIONS.focusSession);

  assert.equal(nextState.exp, 20);
  assert.equal(nextState.dailyExp, 20);
  assert.equal(nextState.categoryTotals.focus, 20);
  assert.equal(nextState.count, 1);
});

test("repeated actions lose efficiency and respect category caps", () => {
  let state = createGameState();
  state = applyAction(state, ACTIONS.focusSession);
  state = applyAction(state, ACTIONS.focusSession);
  state = applyAction(state, ACTIONS.focusSession);

  assert.equal(state.categoryTotals.focus, CATEGORY_LIMITS.focus);
  assert.equal(state.dailyExp, CATEGORY_LIMITS.focus);
});

test("every action can be completed three times before disabling", () => {
  for (const action of Object.values(ACTIONS)) {
    let state = createGameState();

    state = applyAction(state, action);
    state = applyAction(state, action);
    state = applyAction(state, action);

    assert.equal(state.actionCounts[action.id], 3, action.id);
    assert.equal(state.history.length, 3, action.id);
    assert.equal(state.count, 3, action.id);
  }
});

test("a fourth click stays blocked after an action reaches 3/3", () => {
  let state = createGameState();

  state = applyAction(state, ACTIONS.reflection);
  state = applyAction(state, ACTIONS.reflection);
  state = applyAction(state, ACTIONS.reflection);

  const completedState = state;
  state = applyAction(state, ACTIONS.reflection);

  assert.equal(state.actionCounts.reflection, 3);
  assert.equal(state.count, completedState.count);
  assert.match(state.log, /3/);
});

test("daily growth loop uses one imported Blender character for now", () => {
  assert.equal(STAGE_MODE, "character-only");
  assert.deepEqual(CHARACTER_CLASSES.map((item) => item.id), ["custom-chibi"]);
  assert.equal(CHARACTER_CLASSES[0].modelUrl, "models/character.glb");
  assert.deepEqual(CHARACTER_CLASSES[0].modelRotation, [0, Math.PI, 0]);
});

test("scene config stays in open stage mode", () => {
  assert.equal(CHARACTER_SCALE, 0.5);
  assert.equal(STAGE_LAYOUT.mode, "open-stage");
  assert.equal(STAGE_LAYOUT.surface, "full-bleed");
  assert.equal(STAGE_LAYOUT.background, "#ffffff");
  assert.equal(STAGE_LAYOUT.interaction, "drag-rotate");
});

test("drag rotation updates both yaw and tilt inside the character hotspot", () => {
  const nextRotation = getRotationFromDrag(
    { x: 0.02, y: 0 },
    { dx: 40, dy: -120 },
    STAGE_LAYOUT.rotationLimit,
  );

  assert.equal(nextRotation.y, 0.8);
  assert.equal(nextRotation.x, -0.5);
});

test("daily exp never exceeds the hard cap", () => {
  let state = createGameState();
  const loop = [
    ACTIONS.walkGoal,
    ACTIONS.focusSession,
    ACTIONS.windDown,
    ACTIONS.tidyReset,
    ACTIONS.reflection,
    ACTIONS.walkGoal,
    ACTIONS.focusSession,
    ACTIONS.tidyReset,
  ];

  for (const action of loop) {
    state = applyAction(state, action);
  }

  assert.equal(state.dailyExp <= DAILY_EXP_CAP, true);
});

test("App.js does not ship JSX unicode escape literals that render as raw text", () => {
  const appSource = readFileSync(new URL("../App.js", import.meta.url), "utf8");

  assert.equal(/=\s*"\\u[0-9A-Fa-f]{4}/.test(appSource), false);
  assert.equal(/>\s*\\u[0-9A-Fa-f]{4}/.test(appSource), false);
});

test("DateAccordion.js does not ship JSX unicode escape literals that render as raw text", () => {
  const source = readFileSync(new URL("../src/ui/DateAccordion.js", import.meta.url), "utf8");

  assert.equal(/=\s*"\\u[0-9A-Fa-f]{4}/.test(source), false);
  assert.equal(/>\s*\\u[0-9A-Fa-f]{4}/.test(source), false);
});

test("home date panels keep seven dates and place today last with live state", () => {
  let state = createGameState();
  state = applyAction(state, ACTIONS.walkGoal);
  state = applyAction(state, ACTIONS.reflection);

  const panels = buildHomeDatePanels(new Date("2026-05-24T09:00:00+09:00"), state);

  const todayPanel = panels.at(-1);

  assert.equal(panels.length, 7);
  assert.equal(todayPanel.isToday, true);
  assert.equal(todayPanel.xp, state.dailyExp);
  assert.equal(todayPanel.count, state.count);
  assert.equal(todayPanel.entries.length, state.history.length);
});

test("date selector uses a full-width seven-chip row with a separate detail panel", () => {
  const dateAccordionSource = readFileSync(
    new URL("../src/ui/DateAccordion.js", import.meta.url),
    "utf8",
  );

  assert.equal(dateAccordionSource.includes("ScrollView"), false);
  assert.equal(dateAccordionSource.includes("flexDirection: \"row\""), true);
  assert.equal(dateAccordionSource.includes("justifyContent: \"space-between\""), true);
  assert.equal(dateAccordionSource.includes("borderRadius: 999"), true);
  assert.equal(dateAccordionSource.includes("styles.panel"), true);
});
