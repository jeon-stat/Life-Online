import { DEFAULT_STEP_GOAL, getStepRatio } from "./stepRules.js";
import { getGrowthProgress } from "./progression.js";

export const ENERGY_STATES = {
  LOW_ENERGY: "LOW_ENERGY",
  NORMAL_ENERGY: "NORMAL_ENERGY",
  HIGH_ENERGY: "HIGH_ENERGY",
};

export const LONG_TERM_STATES = {
  WEAK: "WEAK",
  HEALTHY: "HEALTHY",
  ACTIVE: "ACTIVE",
};

export const ACTION_KEYS = {
  idle: "idle",
  tired: "tired",
  walk: "walk",
  run: "run",
};

export const ACTION_LABELS = {
  idle: "Idle Standing",
  tired: "Sitting",
  walk: "Walking",
  run: "Running",
};

const BASE_ACTIONS = {
  idle: {
    key: ACTION_KEYS.idle,
    label: ACTION_LABELS.idle,
    weight: 24,
    waitRange: [10, 13.5],
    clipSpeed: 0.92,
    worldSpeed: 0.02,
  },
  tired: {
    key: ACTION_KEYS.tired,
    label: ACTION_LABELS.tired,
    weight: 16,
    waitRange: [10, 13.5],
    clipSpeed: 0.78,
    worldSpeed: 0.004,
  },
  walk: {
    key: ACTION_KEYS.walk,
    label: ACTION_LABELS.walk,
    weight: 36,
    waitRange: [10, 13.5],
    clipSpeed: 0.96,
    worldSpeed: 0.14,
  },
  run: {
    key: ACTION_KEYS.run,
    label: ACTION_LABELS.run,
    weight: 24,
    waitRange: [10, 13.5],
    clipSpeed: 1.1,
    worldSpeed: 0.26,
  },
};

const ENERGY_BEHAVIOR = {
  [ENERGY_STATES.LOW_ENERGY]: {
    weightBias: {
      idle: 6,
      tired: 28,
      walk: -14,
      run: -18,
    },
    clipSpeedScale: 0.92,
    worldSpeedScale: 0.7,
    waitScale: 1.18,
  },
  [ENERGY_STATES.NORMAL_ENERGY]: {
    weightBias: {
      idle: 0,
      tired: 0,
      walk: 0,
      run: 0,
    },
    clipSpeedScale: 1,
    worldSpeedScale: 1,
    waitScale: 1,
  },
  [ENERGY_STATES.HIGH_ENERGY]: {
    weightBias: {
      idle: -10,
      tired: -8,
      walk: 6,
      run: 14,
    },
    clipSpeedScale: 1.08,
    worldSpeedScale: 1.14,
    waitScale: 0.9,
  },
};

const LONG_TERM_BEHAVIOR = {
  [LONG_TERM_STATES.WEAK]: {
    weightBias: {
      idle: 5,
      tired: 10,
      walk: -6,
      run: -12,
    },
    clipSpeedScale: 0.96,
    worldSpeedScale: 0.9,
    waitScale: 1.08,
  },
  [LONG_TERM_STATES.HEALTHY]: {
    weightBias: {
      idle: 0,
      tired: 0,
      walk: 0,
      run: 0,
    },
    clipSpeedScale: 1,
    worldSpeedScale: 1,
    waitScale: 1,
  },
  [LONG_TERM_STATES.ACTIVE]: {
    weightBias: {
      idle: -4,
      tired: -8,
      walk: 4,
      run: 8,
    },
    clipSpeedScale: 1.04,
    worldSpeedScale: 1.06,
    waitScale: 0.94,
  },
};

export function getEnergyState(steps, goal = DEFAULT_STEP_GOAL) {
  const ratio = getStepRatio(steps, goal);

  if (ratio < 0.35) return ENERGY_STATES.LOW_ENERGY;
  if (ratio < 0.85) return ENERGY_STATES.NORMAL_ENERGY;
  return ENERGY_STATES.HIGH_ENERGY;
}

export function getLongTermState(history = [], goal = DEFAULT_STEP_GOAL) {
  const growth = getGrowthProgress(history, goal);
  const lifetimeSteps = growth.lifetimeSteps ?? 0;

  if (lifetimeSteps < goal * 4) return LONG_TERM_STATES.WEAK;
  if (lifetimeSteps < goal * 12) return LONG_TERM_STATES.HEALTHY;
  return LONG_TERM_STATES.ACTIVE;
}

export function buildBehaviorProfile({ steps = 0, history = [], goal = DEFAULT_STEP_GOAL } = {}) {
  const growth = getGrowthProgress(history, goal);
  const energyState = getEnergyState(steps, goal);
  const longTermState = getLongTermState(history, goal);
  const energyProfile = ENERGY_BEHAVIOR[energyState];
  const longTermProfile = LONG_TERM_BEHAVIOR[longTermState];

  const actions = Object.values(BASE_ACTIONS).map((action) => {
    const weightBias = (energyProfile.weightBias?.[action.key] ?? 0) + (longTermProfile.weightBias?.[action.key] ?? 0);
    const waitScale = energyProfile.waitScale * longTermProfile.waitScale;

    return {
      ...action,
      weight: Math.max(1, action.weight + weightBias),
      waitRange: scaleRange(action.waitRange, waitScale),
      clipSpeed: roundToTwo(action.clipSpeed * energyProfile.clipSpeedScale * longTermProfile.clipSpeedScale),
      worldSpeed: roundToThree(action.worldSpeed * energyProfile.worldSpeedScale * longTermProfile.worldSpeedScale),
    };
  });

  const defaultAction = actions.reduce((best, action) => (action.weight > best.weight ? action : best), actions[0]);
  const actionMap = actions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});

  return {
    energyState,
    longTermState,
    actions,
    actionMap,
    defaultActionKey: defaultAction?.key ?? ACTION_KEYS.idle,
    signature: `${energyState}:${longTermState}:${Math.round(steps)}:${growth.lifetimeSteps}:${growth.streak}`,
  };
}

export function pickWeightedAction(actions = [], previousAction = null) {
  const pool = actions.map((action) => ({
    ...action,
    weight: Math.max(1, action.weight * (action.key === previousAction ? 0.45 : 1)),
  }));

  const totalWeight = pool.reduce((sum, action) => sum + action.weight, 0);
  if (!totalWeight) return null;

  let cursor = Math.random() * totalWeight;

  for (const action of pool) {
    cursor -= action.weight;
    if (cursor <= 0) return action;
  }

  return pool[pool.length - 1] ?? null;
}

export function resolveActionByKey(actions = [], actionKey = null) {
  if (!actionKey) return null;
  return actions.find((action) => action.key === actionKey) ?? null;
}

export function getActionLabel(actionKey) {
  return ACTION_LABELS[actionKey] ?? actionKey ?? "";
}

export function getActionDurationRange(action, { recovery = false } = {}) {
  if (!action) return [10, 13.5];
  if (recovery && action.key === ACTION_KEYS.walk) {
    return [3, 3.5];
  }

  return action.waitRange ?? [10, 13.5];
}

function scaleRange(range, multiplier) {
  const [min, max] = range;
  const nextMin = Math.max(0.35, min * multiplier);
  const nextMax = Math.max(nextMin, max * multiplier);
  return [roundToTwo(nextMin), roundToTwo(nextMax)];
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

function roundToThree(value) {
  return Math.round(value * 1000) / 1000;
}
