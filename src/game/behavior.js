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

export const ACTION_TYPES = {
  MAIN: "main",
  TRANSITION: "transition",
};

export const ACTION_KEYS = {
  idle: "idle",
  tired: "tired",
  slowWalk: "slowWalk",
  walk: "walk",
  fastWalk: "fastWalk",
  run: "run",
  sleepyIdle: "sleepyIdle",
  lookingDown: "lookingDown",
  slowTiredWalk: "slowTiredWalk",
  stretchSitting: "stretchSitting",
  idleBreathing: "idleBreathing",
  yawn: "yawn",
  weightShift: "weightShift",
  stopAndRest: "stopAndRest",
  headNod: "headNod",
  slowTurn: "slowTurn",
  relaxedIdle: "relaxedIdle",
  casualWalk: "casualWalk",
  exploreWalk: "exploreWalk",
  stretch: "stretch",
  lightJog: "lightJog",
  lookAround: "lookAround",
  turnLeftRight: "turnLeftRight",
  smallPause: "smallPause",
  footTap: "footTap",
  idleTransition: "idleTransition",
  quickTurn: "quickTurn",
  bounceIdle: "bounceIdle",
  fastStop: "fastStop",
  lookAroundFast: "lookAroundFast",
  shortHop: "shortHop",
  happyRun: "happyRun",
  energeticWalk: "energeticWalk",
  dashStart: "dashStart",
  excitedIdle: "excitedIdle",
  activePatrol: "activePatrol",
};

export const ACTION_LABELS = {
  idle: "Idle Standing",
  tired: "Sitting",
  slowWalk: "Walking(slow)",
  walk: "Walking",
  fastWalk: "Walking(fast)",
  run: "Running",
  sleepyIdle: "Sleepy Idle",
  lookingDown: "Looking Down",
  slowTiredWalk: "Slow Tired Walk",
  stretchSitting: "Stretch Sitting",
  idleBreathing: "Idle Breathing",
  yawn: "Yawn",
  weightShift: "Weight Shift",
  stopAndRest: "Stop And Rest",
  headNod: "Head Nod",
  slowTurn: "Slow Turn",
  relaxedIdle: "Relaxed Idle",
  casualWalk: "Casual Walk",
  exploreWalk: "Explore Walk",
  stretch: "Stretch",
  lightJog: "Light Jog",
  lookAround: "Look Around",
  turnLeftRight: "Turn Left / Right",
  smallPause: "Small Pause",
  footTap: "Foot Tap",
  idleTransition: "Idle Transition",
  quickTurn: "Quick Turn",
  bounceIdle: "Bounce Idle",
  fastStop: "Fast Stop",
  lookAroundFast: "Look Around Fast",
  shortHop: "Short Hop",
  happyRun: "Happy Run",
  energeticWalk: "Energetic Walk",
  dashStart: "Dash Start",
  excitedIdle: "Excited Idle",
  activePatrol: "Active Patrol",
};

const DEFAULT_TIMING = {
  mainDurationRange: [8, 15],
  transitionDurationRange: [1, 3],
  waitDurationRange: [1, 4],
};

const ACTION_LIBRARY = {
  idle: createAction({
    key: ACTION_KEYS.idle,
    label: ACTION_LABELS.idle,
    type: ACTION_TYPES.MAIN,
    clipKey: "idle",
    available: true,
    baseWeight: 24,
    clipSpeed: 0.92,
    worldSpeed: 0.02,
    motionKind: "neutral",
  }),
  tired: createAction({
    key: ACTION_KEYS.tired,
    label: ACTION_LABELS.tired,
    type: ACTION_TYPES.MAIN,
    clipKey: "tired",
    available: true,
    baseWeight: 26,
    clipSpeed: 0.8,
    worldSpeed: 0.004,
    motionKind: "neutral",
  }),
  slowWalk: createAction({
    key: ACTION_KEYS.slowWalk,
    label: ACTION_LABELS.slowWalk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: true,
    baseWeight: 18,
    clipSpeed: 0.74,
    worldSpeed: 0.08,
    motionKind: "walk",
  }),
  walk: createAction({
    key: ACTION_KEYS.walk,
    label: ACTION_LABELS.walk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: true,
    baseWeight: 34,
    clipSpeed: 0.96,
    worldSpeed: 0.14,
    motionKind: "walk",
  }),
  fastWalk: createAction({
    key: ACTION_KEYS.fastWalk,
    label: ACTION_LABELS.fastWalk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: true,
    baseWeight: 14,
    clipSpeed: 1.18,
    worldSpeed: 0.2,
    motionKind: "walk",
  }),
  run: createAction({
    key: ACTION_KEYS.run,
    label: ACTION_LABELS.run,
    type: ACTION_TYPES.MAIN,
    clipKey: "run",
    available: true,
    baseWeight: 22,
    clipSpeed: 1.1,
    worldSpeed: 0.26,
    motionKind: "run",
  }),
  sleepyIdle: createAction({
    key: ACTION_KEYS.sleepyIdle,
    label: ACTION_LABELS.sleepyIdle,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0.0,
    motionKind: "neutral",
  }),
  lookingDown: createAction({
    key: ACTION_KEYS.lookingDown,
    label: ACTION_LABELS.lookingDown,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0.0,
    motionKind: "neutral",
  }),
  slowTiredWalk: createAction({
    key: ACTION_KEYS.slowTiredWalk,
    label: ACTION_LABELS.slowTiredWalk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.68,
    worldSpeed: 0.06,
    motionKind: "walk",
  }),
  stretchSitting: createAction({
    key: ACTION_KEYS.stretchSitting,
    label: ACTION_LABELS.stretchSitting,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  idleBreathing: createAction({
    key: ACTION_KEYS.idleBreathing,
    label: ACTION_LABELS.idleBreathing,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  yawn: createAction({
    key: ACTION_KEYS.yawn,
    label: ACTION_LABELS.yawn,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  weightShift: createAction({
    key: ACTION_KEYS.weightShift,
    label: ACTION_LABELS.weightShift,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  stopAndRest: createAction({
    key: ACTION_KEYS.stopAndRest,
    label: ACTION_LABELS.stopAndRest,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  headNod: createAction({
    key: ACTION_KEYS.headNod,
    label: ACTION_LABELS.headNod,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  slowTurn: createAction({
    key: ACTION_KEYS.slowTurn,
    label: ACTION_LABELS.slowTurn,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  relaxedIdle: createAction({
    key: ACTION_KEYS.relaxedIdle,
    label: ACTION_LABELS.relaxedIdle,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.92,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  casualWalk: createAction({
    key: ACTION_KEYS.casualWalk,
    label: ACTION_LABELS.casualWalk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.0,
    worldSpeed: 0.14,
    motionKind: "walk",
  }),
  exploreWalk: createAction({
    key: ACTION_KEYS.exploreWalk,
    label: ACTION_LABELS.exploreWalk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.0,
    worldSpeed: 0.16,
    motionKind: "walk",
  }),
  stretch: createAction({
    key: ACTION_KEYS.stretch,
    label: ACTION_LABELS.stretch,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  lightJog: createAction({
    key: ACTION_KEYS.lightJog,
    label: ACTION_LABELS.lightJog,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.08,
    worldSpeed: 0.18,
    motionKind: "walk",
  }),
  lookAround: createAction({
    key: ACTION_KEYS.lookAround,
    label: ACTION_LABELS.lookAround,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  turnLeftRight: createAction({
    key: ACTION_KEYS.turnLeftRight,
    label: ACTION_LABELS.turnLeftRight,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  smallPause: createAction({
    key: ACTION_KEYS.smallPause,
    label: ACTION_LABELS.smallPause,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  footTap: createAction({
    key: ACTION_KEYS.footTap,
    label: ACTION_LABELS.footTap,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  idleTransition: createAction({
    key: ACTION_KEYS.idleTransition,
    label: ACTION_LABELS.idleTransition,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.9,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  quickTurn: createAction({
    key: ACTION_KEYS.quickTurn,
    label: ACTION_LABELS.quickTurn,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.95,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  bounceIdle: createAction({
    key: ACTION_KEYS.bounceIdle,
    label: ACTION_LABELS.bounceIdle,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.95,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  fastStop: createAction({
    key: ACTION_KEYS.fastStop,
    label: ACTION_LABELS.fastStop,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.95,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  lookAroundFast: createAction({
    key: ACTION_KEYS.lookAroundFast,
    label: ACTION_LABELS.lookAroundFast,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.95,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  shortHop: createAction({
    key: ACTION_KEYS.shortHop,
    label: ACTION_LABELS.shortHop,
    type: ACTION_TYPES.TRANSITION,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 0.95,
    worldSpeed: 0,
    motionKind: "neutral",
  }),
  happyRun: createAction({
    key: ACTION_KEYS.happyRun,
    label: ACTION_LABELS.happyRun,
    type: ACTION_TYPES.MAIN,
    clipKey: "run",
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.16,
    worldSpeed: 0.3,
    motionKind: "run",
  }),
  energeticWalk: createAction({
    key: ACTION_KEYS.energeticWalk,
    label: ACTION_LABELS.energeticWalk,
    type: ACTION_TYPES.MAIN,
    clipKey: "walk",
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.14,
    worldSpeed: 0.2,
    motionKind: "walk",
  }),
  dashStart: createAction({
    key: ACTION_KEYS.dashStart,
    label: ACTION_LABELS.dashStart,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.12,
    worldSpeed: 0.24,
    motionKind: "run",
  }),
  excitedIdle: createAction({
    key: ACTION_KEYS.excitedIdle,
    label: ACTION_LABELS.excitedIdle,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.0,
    worldSpeed: 0.04,
    motionKind: "neutral",
  }),
  activePatrol: createAction({
    key: ACTION_KEYS.activePatrol,
    label: ACTION_LABELS.activePatrol,
    type: ACTION_TYPES.MAIN,
    clipKey: null,
    available: false,
    baseWeight: 0.25,
    clipSpeed: 1.08,
    worldSpeed: 0.22,
    motionKind: "walk",
  }),
};

const STATE_PROFILES = {
  [ENERGY_STATES.LOW_ENERGY]: {
    label: "LOW",
    background: ["#f0f1ea", "#faf8f3"],
    stage: "#f3efe6",
    bubbleSurface: "#f7f2ea",
    effect: "cloudy",
    cloudSpeed: 0.28,
    brightness: 0.88,
    mainActionKeys: [
      ACTION_KEYS.idle,
      ACTION_KEYS.tired,
      ACTION_KEYS.slowWalk,
      ACTION_KEYS.sleepyIdle,
      ACTION_KEYS.lookingDown,
      ACTION_KEYS.slowTiredWalk,
      ACTION_KEYS.stretchSitting,
      ACTION_KEYS.idleBreathing,
    ],
    transitionActionKeys: [
      ACTION_KEYS.yawn,
      ACTION_KEYS.weightShift,
      ACTION_KEYS.stopAndRest,
      ACTION_KEYS.headNod,
      ACTION_KEYS.slowTurn,
    ],
    weightBias: {
      [ACTION_KEYS.idle]: 10,
      [ACTION_KEYS.tired]: 18,
      [ACTION_KEYS.slowWalk]: 6,
      [ACTION_KEYS.walk]: -12,
      [ACTION_KEYS.fastWalk]: -18,
      [ACTION_KEYS.run]: -24,
    },
    clipSpeedScale: 0.9,
    worldSpeedScale: 0.7,
  },
  [ENERGY_STATES.NORMAL_ENERGY]: {
    label: "NORMAL",
    background: ["#f7f5ef", "#eef3f7"],
    stage: "#f3f4f8",
    bubbleSurface: "#f5f4fb",
    effect: "float",
    cloudSpeed: 0.62,
    brightness: 1,
    mainActionKeys: [
      ACTION_KEYS.idle,
      ACTION_KEYS.walk,
      ACTION_KEYS.relaxedIdle,
      ACTION_KEYS.casualWalk,
      ACTION_KEYS.exploreWalk,
      ACTION_KEYS.stretch,
      ACTION_KEYS.lightJog,
    ],
    transitionActionKeys: [
      ACTION_KEYS.lookAround,
      ACTION_KEYS.turnLeftRight,
      ACTION_KEYS.smallPause,
      ACTION_KEYS.footTap,
      ACTION_KEYS.idleTransition,
    ],
    weightBias: {
      [ACTION_KEYS.idle]: 6,
      [ACTION_KEYS.walk]: 18,
      [ACTION_KEYS.slowWalk]: 4,
      [ACTION_KEYS.fastWalk]: 4,
      [ACTION_KEYS.run]: -12,
    },
    clipSpeedScale: 1,
    worldSpeedScale: 1,
  },
  [ENERGY_STATES.HIGH_ENERGY]: {
    label: "HIGH",
    background: ["#eef8ef", "#f7fcf4"],
    stage: "#edf8f0",
    bubbleSurface: "#edf8ef",
    effect: "sparkle",
    cloudSpeed: 1.15,
    brightness: 1.05,
    mainActionKeys: [
      ACTION_KEYS.run,
      ACTION_KEYS.fastWalk,
      ACTION_KEYS.idle,
      ACTION_KEYS.happyRun,
      ACTION_KEYS.energeticWalk,
      ACTION_KEYS.dashStart,
      ACTION_KEYS.excitedIdle,
      ACTION_KEYS.activePatrol,
    ],
    transitionActionKeys: [
      ACTION_KEYS.quickTurn,
      ACTION_KEYS.bounceIdle,
      ACTION_KEYS.fastStop,
      ACTION_KEYS.lookAroundFast,
      ACTION_KEYS.shortHop,
    ],
    weightBias: {
      [ACTION_KEYS.run]: 22,
      [ACTION_KEYS.fastWalk]: 18,
      [ACTION_KEYS.walk]: 8,
      [ACTION_KEYS.idle]: 4,
      [ACTION_KEYS.tired]: -12,
    },
    clipSpeedScale: 1.08,
    worldSpeedScale: 1.18,
  },
};

const LONG_TERM_PROFILES = {
  [LONG_TERM_STATES.WEAK]: {
    weightBias: {
      [ACTION_KEYS.idle]: 8,
      [ACTION_KEYS.tired]: 12,
      [ACTION_KEYS.slowWalk]: 4,
      [ACTION_KEYS.walk]: -4,
      [ACTION_KEYS.fastWalk]: -6,
      [ACTION_KEYS.run]: -10,
    },
    clipSpeedScale: 0.95,
    worldSpeedScale: 0.9,
  },
  [LONG_TERM_STATES.HEALTHY]: {
    weightBias: {},
    clipSpeedScale: 1,
    worldSpeedScale: 1,
  },
  [LONG_TERM_STATES.ACTIVE]: {
    weightBias: {
      [ACTION_KEYS.idle]: -4,
      [ACTION_KEYS.tired]: -8,
      [ACTION_KEYS.walk]: 6,
      [ACTION_KEYS.fastWalk]: 10,
      [ACTION_KEYS.run]: 12,
    },
    clipSpeedScale: 1.04,
    worldSpeedScale: 1.06,
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

export function buildBehaviorProfile({ steps = 0, history = [], goal = DEFAULT_STEP_GOAL, overrides = {} } = {}) {
  const growth = getGrowthProgress(history, goal);
  const rawEnergyState = getEnergyState(steps, goal);
  const rawLongTermState = getLongTermState(history, goal);
  const energyState = overrides.forceShortTermState ?? rawEnergyState;
  const longTermState = overrides.forceLongTermState ?? rawLongTermState;
  const energyProfile = STATE_PROFILES[energyState] ?? STATE_PROFILES[ENERGY_STATES.NORMAL_ENERGY];
  const longTermProfile = LONG_TERM_PROFILES[longTermState] ?? LONG_TERM_PROFILES[LONG_TERM_STATES.HEALTHY];
  const timing = resolveTiming(overrides);
  const mainActions = buildActionPool(energyProfile.mainActionKeys, ACTION_TYPES.MAIN, {
    stateProfile: energyProfile,
    longTermProfile,
    timing,
    overrides,
  });
  const transitionActions = buildActionPool(energyProfile.transitionActionKeys, ACTION_TYPES.TRANSITION, {
    stateProfile: energyProfile,
    longTermProfile,
    timing,
    overrides,
  });
  const allActions = [...mainActions, ...transitionActions];
  const actionMap = allActions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});
  const mainActionMap = mainActions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});
  const transitionActionMap = transitionActions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});
  const defaultMainActionKey = pickDefaultActionKey(mainActions, ACTION_KEYS.idle);
  const defaultTransitionActionKey = pickDefaultActionKey(transitionActions, ACTION_KEYS.idleTransition);

  return {
    energyState,
    longTermState,
    backgroundState: overrides.forceBackgroundState ?? energyState,
    forcedActionKey: overrides.forcedActionKey ?? null,
    mainActions,
    transitionActions,
    allActions,
    actionMap,
    mainActionMap,
    transitionActionMap,
    defaultMainActionKey,
    defaultTransitionActionKey,
    mood: {
      background: energyProfile.background,
      stage: energyProfile.stage,
      bubbleSurface: energyProfile.bubbleSurface,
      effect: energyProfile.effect,
      brightness: energyProfile.brightness,
      cloudSpeed: energyProfile.cloudSpeed,
    },
    timing,
    speed: {
      walking: overrides.walkingSpeedMultiplier ?? 1,
      running: overrides.runningSpeedMultiplier ?? 1,
      animation: overrides.animationSpeedMultiplier ?? 1,
    },
    signature: buildBehaviorSignature({
      energyState,
      longTermState,
      overrides,
      timing,
      speed: {
        walking: overrides.walkingSpeedMultiplier ?? 1,
        running: overrides.runningSpeedMultiplier ?? 1,
        animation: overrides.animationSpeedMultiplier ?? 1,
      },
      weightOverrides: overrides.weightOverrides ?? {},
      mainActions,
      transitionActions,
    }),
  };
}

export function pickWeightedAction(actions = [], previousAction = null) {
  const pool = actions
    .map((action) => ({
      ...action,
      weight: Math.max(0, action.weight * (action.key === previousAction ? 0.4 : 1)),
    }))
    .filter((action) => action.weight > 0);

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

export function getActionKindLabel(kind) {
  if (kind === ACTION_TYPES.TRANSITION) return "Transition";
  return "Main";
}

function createAction({
  key,
  label,
  type,
  clipKey,
  available,
  baseWeight,
  clipSpeed,
  worldSpeed,
  motionKind,
}) {
  return {
    key,
    label,
    type,
    clipKey,
    available,
    baseWeight,
    clipSpeed,
    worldSpeed,
    motionKind,
  };
}

function resolveTiming(overrides) {
  return {
    mainDurationRange: normalizeRange(overrides.mainDurationRange ?? DEFAULT_TIMING.mainDurationRange, DEFAULT_TIMING.mainDurationRange),
    transitionDurationRange: normalizeRange(
      overrides.transitionDurationRange ?? DEFAULT_TIMING.transitionDurationRange,
      DEFAULT_TIMING.transitionDurationRange,
    ),
    waitDurationRange: normalizeRange(overrides.waitDurationRange ?? DEFAULT_TIMING.waitDurationRange, DEFAULT_TIMING.waitDurationRange),
  };
}

function buildActionPool(actionKeys = [], type, { stateProfile, longTermProfile, timing, overrides }) {
  return actionKeys
    .map((key) => {
      const base = ACTION_LIBRARY[key];
      if (!base) return null;

      const weightOverride = overrides.weightOverrides?.[key];
      const weightBias =
        (stateProfile.weightBias?.[key] ?? 0) +
        (longTermProfile.weightBias?.[key] ?? 0);
      const movementMultiplier = resolveMovementMultiplier(base.motionKind, overrides);
      const speedMultiplier = roundToThree(
        (stateProfile.clipSpeedScale ?? 1) *
          (longTermProfile.clipSpeedScale ?? 1) *
          (overrides.animationSpeedMultiplier ?? 1) *
          movementMultiplier,
      );
      const worldSpeedMultiplier = roundToThree(
        (stateProfile.worldSpeedScale ?? 1) *
          (longTermProfile.worldSpeedScale ?? 1) *
          (overrides.animationSpeedMultiplier ?? 1) *
          movementMultiplier,
      );
      const weight = Math.max(0, typeof weightOverride === "number" ? weightOverride : base.baseWeight + weightBias);

      return {
        ...base,
        type,
        weight,
        durationRange: type === ACTION_TYPES.MAIN ? timing.mainDurationRange : timing.transitionDurationRange,
        waitRange: timing.waitDurationRange,
        clipSpeed: roundToThree(base.clipSpeed * speedMultiplier),
        worldSpeed: roundToThree(base.worldSpeed * worldSpeedMultiplier),
        playable: Boolean(base.available && base.clipKey),
      };
    })
    .filter(Boolean);
}

function resolveMovementMultiplier(motionKind, overrides) {
  if (motionKind === "walk") {
    return overrides.walkingSpeedMultiplier ?? 1;
  }

  if (motionKind === "run") {
    return overrides.runningSpeedMultiplier ?? 1;
  }

  return 1;
}

function pickDefaultActionKey(actions, fallbackKey) {
  if (!actions.length) return fallbackKey;
  return actions.reduce((best, action) => (action.weight > best.weight ? action : best), actions[0])?.key ?? fallbackKey;
}

function buildBehaviorSignature({
  energyState,
  longTermState,
  overrides,
  timing,
  speed,
  weightOverrides,
  mainActions,
  transitionActions,
}) {
  const weightSignature = Object.keys(weightOverrides)
    .sort()
    .map((key) => `${key}:${weightOverrides[key]}`)
    .join(",");

  return [
    energyState,
    longTermState,
    overrides.forceShortTermState ?? "",
    overrides.forceLongTermState ?? "",
    overrides.forceBackgroundState ?? "",
    overrides.forcedActionKey ?? "",
    `w:${speed.walking}`,
    `r:${speed.running}`,
    `a:${speed.animation}`,
    `md:${timing.mainDurationRange.join("-")}`,
    `td:${timing.transitionDurationRange.join("-")}`,
    `wd:${timing.waitDurationRange.join("-")}`,
    `weights:${weightSignature}`,
    `main:${mainActions.map((action) => `${action.key}:${action.weight}`).join("|")}`,
    `trans:${transitionActions.map((action) => `${action.key}:${action.weight}`).join("|")}`,
  ].join(";");
}

function normalizeRange(range, fallbackRange) {
  if (!Array.isArray(range) || range.length < 2) return [...fallbackRange];

  const min = Number(range[0]);
  const max = Number(range[1]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [...fallbackRange];

  if (max < min) return [max, min];
  return [roundToTwo(min), roundToTwo(max)];
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

function roundToThree(value) {
  return Math.round(value * 1000) / 1000;
}
