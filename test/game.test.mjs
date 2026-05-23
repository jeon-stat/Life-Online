import test from "node:test";
import assert from "node:assert/strict";

import { createGameState, applyAction, ACTIONS } from "../src/game.js";
import { CHARACTER_CLASSES, STAGE_MODE } from "../src/characters.js";
import { CHARACTER_SCALE, STAGE_LAYOUT } from "../src/scene/stageConfig.js";
import { getRotationFromDrag } from "../src/scene/rotationMath.js";

test("study action grows exp and keeps the cute adventurer title before level up", () => {
  const nextState = applyAction(createGameState(), ACTIONS.study);

  assert.equal(nextState.exp, 8);
  assert.equal(nextState.count, 1);
  assert.equal(nextState.level, 1);
  assert.equal(nextState.mood, "뿌듯");
  assert.equal(nextState.title, "\uc131\uc2e4\ud55c \uc0c8\uc2f9 \ubaa8\ud5d8\uac00");
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
  assert.equal(state.title, "\ubc18\uc9dd\uc774\ub294 \ub8e8\ud2f4 \ubaa8\ud5d8\uac00");
});

test("character roster includes warrior mage and pirate without floor tiles", () => {
  assert.equal(STAGE_MODE, "character-only");
  assert.deepEqual(
    CHARACTER_CLASSES.map((item) => item.id),
    ["warrior", "mage", "pirate"],
  );
  assert.deepEqual(
    CHARACTER_CLASSES.map((item) => item.label),
    ["\uc804\uc0ac", "\ub9c8\ubc95\uc0ac", "\ud574\uc801"],
  );
  assert.equal(CHARACTER_CLASSES.every((item) => typeof item.palette.primary === "string"), true);
});

test("each character class has a distinct hero silhouette for the 3d model", () => {
  const warrior = CHARACTER_CLASSES.find((item) => item.id === "warrior");
  const mage = CHARACTER_CLASSES.find((item) => item.id === "mage");
  const pirate = CHARACTER_CLASSES.find((item) => item.id === "pirate");

  assert.deepEqual(warrior.modelSignature, ["broad-shoulders", "great-sword", "armor-bangs"]);
  assert.deepEqual(mage.modelSignature, ["wide-hat", "long-robe", "staff-orb"]);
  assert.deepEqual(pirate.modelSignature, ["tricorn-hat", "long-coat", "hook-blade"]);
});

test("scene config keeps the character smaller and in an open stage layout", () => {
  assert.equal(CHARACTER_SCALE, 0.5);
  assert.equal(STAGE_LAYOUT.mode, "open-stage");
  assert.equal(STAGE_LAYOUT.surface, "full-bleed");
  assert.equal(STAGE_LAYOUT.background, "#ffffff");
  assert.equal(STAGE_LAYOUT.interaction, "drag-rotate");
});

test("drag rotation responds more strongly and clamps vertical tilt", () => {
  const nextRotation = getRotationFromDrag(
    { x: 0.03, y: -0.24 },
    { dx: 40, dy: -120 },
    STAGE_LAYOUT.rotationLimit,
  );

  assert.equal(nextRotation.y, 0.56);
  assert.equal(nextRotation.x, 0.5);
});
