import test from "node:test";
import assert from "node:assert/strict";

import { createGameState, applyAction, ACTIONS } from "../src/game.js";
import { FLOOR_TILES, CHARACTER_PARTS, FLOOR_LABEL } from "../src/scene.js";

test("study action grows exp and keeps the cute adventurer title before level up", () => {
  const nextState = applyAction(createGameState(), ACTIONS.study);

  assert.equal(nextState.exp, 8);
  assert.equal(nextState.count, 1);
  assert.equal(nextState.level, 1);
  assert.equal(nextState.mood, "뿌듯");
  assert.equal(nextState.title, "성실한 새싹 모험가");
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
  assert.equal(state.title, "반짝이는 루틴 모험가");
});

test("scene keeps a 3x3 floor grid and richer character parts", () => {
  assert.equal(FLOOR_TILES.length, 9);
  assert.equal(FLOOR_LABEL, "3x3 floor grid");
  assert.deepEqual(
    CHARACTER_PARTS,
    [
      "backHair",
      "hairCap",
      "bangLeft",
      "bangRight",
      "head",
      "earLeft",
      "earRight",
      "neck",
      "body",
      "belt",
      "armLeft",
      "armRight",
      "handLeft",
      "handRight",
      "legLeft",
      "legRight",
      "shoeLeft",
      "shoeRight",
    ],
  );
});
