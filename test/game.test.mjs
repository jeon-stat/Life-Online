import assert from "node:assert/strict";
import test from "node:test";

import { ACTIONS, applyAction, createGameState } from "../src/game.js";
import { CHARACTER_CLASSES, STAGE_MODE } from "../src/characters.js";
import { CHARACTER_SCALE, STAGE_LAYOUT } from "../src/scene/stageConfig.js";
import { getRotationFromDrag } from "../src/scene/rotationMath.js";

test("study action grows exp and keeps the early-game title before level up", () => {
  const nextState = applyAction(createGameState(), ACTIONS.study);

  assert.equal(nextState.exp, 8);
  assert.equal(nextState.count, 1);
  assert.equal(nextState.level, 1);
});

test("reaching 30 exp upgrades the title and level", () => {
  let state = createGameState();
  state = applyAction(state, ACTIONS.study);
  state = applyAction(state, ACTIONS.exercise);
  state = applyAction(state, ACTIONS.sleep);
  state = applyAction(state, ACTIONS.clean);
  state = applyAction(state, ACTIONS.lucky);

  assert.equal(state.exp, 30);
  assert.equal(state.level, 2);
});

test("character roster is reduced to the single Pongo test model", () => {
  assert.equal(STAGE_MODE, "character-only");
  assert.deepEqual(CHARACTER_CLASSES.map((item) => item.id), ["pongo"]);
  assert.equal(CHARACTER_CLASSES[0].label, "Pongo Test Model");
  assert.equal(typeof CHARACTER_CLASSES[0].palette.primary, "string");
});

test("scene config keeps the character in the open stage layout", () => {
  assert.equal(CHARACTER_SCALE, 0.5);
  assert.equal(STAGE_LAYOUT.mode, "open-stage");
  assert.equal(STAGE_LAYOUT.surface, "full-bleed");
  assert.equal(STAGE_LAYOUT.background, "#ffffff");
  assert.equal(STAGE_LAYOUT.interaction, "drag-rotate");
  assert.equal(STAGE_LAYOUT.heroHeight, 462);
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
