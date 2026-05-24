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

test("home date panels put today first and include live today state", () => {
  let state = createGameState();
  state = applyAction(state, ACTIONS.walkGoal);
  state = applyAction(state, ACTIONS.reflection);

  const panels = buildHomeDatePanels(new Date("2026-05-24T09:00:00+09:00"), state);

  assert.equal(panels[0].isToday, true);
  assert.equal(panels[0].xp, state.dailyExp);
  assert.equal(panels[0].count, state.count);
  assert.equal(panels[0].entries.length, state.history.length);
  assert.equal(panels.length >= 5, true);
});

test("date selector stays as a horizontal circle rail with a separate detail panel", () => {
  const dateAccordionSource = readFileSync(
    new URL("../src/ui/DateAccordion.js", import.meta.url),
    "utf8",
  );

  assert.equal(dateAccordionSource.includes("horizontal"), true);
  assert.equal(dateAccordionSource.includes("showsHorizontalScrollIndicator={false}"), true);
  assert.equal(dateAccordionSource.includes("borderRadius: 999"), true);
  assert.equal(dateAccordionSource.includes("styles.panel"), true);
});
