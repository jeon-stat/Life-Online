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
  SPECIAL: "special",
};

export const ACTION_KEYS = {
  energy0: "energy0",
  energy1: "energy1",
  energy2: "energy2",
  energy3: "energy3",
  energy4: "energy4",
  energy5: "energy5",
  energy6: "energy6",
  hipHopDancing: "hipHopDancing",
  moonwalk: "moonwalk",
};

export const ACTION_LABELS = {
  energy0: "Sitting Idle",
  energy1: "Yawn",
  energy2: "Breathing Idle",
  energy3: "Neutral Idle",
  energy4: "Walking",
  energy5: "Running",
  energy6: "Running + Special",
  hipHopDancing: "Hip Hop Dancing",
  moonwalk: "Moonwalk",
};

const ENERGY_LEVEL_TO_STATE = [
  ACTION_KEYS.energy0,
  ACTION_KEYS.energy1,
  ACTION_KEYS.energy2,
  ACTION_KEYS.energy3,
  ACTION_KEYS.energy4,
  ACTION_KEYS.energy5,
  ACTION_KEYS.energy6,
];

const ENERGY_LEVEL_TO_CLIP = {
  [ACTION_KEYS.energy0]: "sitting-idle",
  [ACTION_KEYS.energy1]: "yawn",
  [ACTION_KEYS.energy2]: "breathing-idle",
  [ACTION_KEYS.energy3]: "neutral-idle",
  [ACTION_KEYS.energy4]: "walking",
  [ACTION_KEYS.energy5]: "running",
  [ACTION_KEYS.energy6]: "running",
  [ACTION_KEYS.hipHopDancing]: "hip-hop-dancing",
  [ACTION_KEYS.moonwalk]: "moonwalk",
};

const ENERGY_LEVEL_TO_ANIMATION_SPEED = {
  [ACTION_KEYS.energy0]: 0.96,
  [ACTION_KEYS.energy1]: 0.98,
  [ACTION_KEYS.energy2]: 1.0,
  [ACTION_KEYS.energy3]: 1.0,
  [ACTION_KEYS.energy4]: 1.02,
  [ACTION_KEYS.energy5]: 1.08,
  [ACTION_KEYS.energy6]: 1.1,
  [ACTION_KEYS.hipHopDancing]: 1.0,
  [ACTION_KEYS.moonwalk]: 1.0,
};

const MAIN_ACTION_LIBRARY = ENERGY_LEVEL_TO_STATE.map((key) =>
  createAction({
    key,
    label: ACTION_LABELS[key],
    type: ACTION_TYPES.MAIN,
    clipKey: ENERGY_LEVEL_TO_CLIP[key],
    available: true,
    baseWeight: 1,
    clipSpeed: ENERGY_LEVEL_TO_ANIMATION_SPEED[key],
    worldSpeed: getWorldSpeedForEnergyKey(key),
    motionKind: getMotionKindForEnergyKey(key),
  }),
);

const SPECIAL_ACTION_LIBRARY = [
  createAction({
    key: ACTION_KEYS.hipHopDancing,
    label: ACTION_LABELS.hipHopDancing,
    type: ACTION_TYPES.SPECIAL,
    clipKey: ENERGY_LEVEL_TO_CLIP[ACTION_KEYS.hipHopDancing],
    available: true,
    baseWeight: 15,
    clipSpeed: 1,
    worldSpeed: 0.18,
    motionKind: "run",
  }),
  createAction({
    key: ACTION_KEYS.moonwalk,
    label: ACTION_LABELS.moonwalk,
    type: ACTION_TYPES.SPECIAL,
    clipKey: ENERGY_LEVEL_TO_CLIP[ACTION_KEYS.moonwalk],
    available: true,
    baseWeight: 5,
    clipSpeed: 1,
    worldSpeed: 0.08,
    motionKind: "walk",
  }),
];

export function getEnergyLevel(steps, goal = DEFAULT_STEP_GOAL) {
  const ratio = getStepRatio(steps, goal);

  if (ratio < 0.05) return 0;
  if (ratio < 0.15) return 1;
  if (ratio < 0.3) return 2;
  if (ratio < 0.5) return 3;
  if (ratio < 0.7) return 4;
  if (ratio < 1) return 5;
  return 6;
}

export function getEnergyState(steps, goal = DEFAULT_STEP_GOAL) {
  const level = getEnergyLevel(steps, goal);

  if (level <= 1) return ENERGY_STATES.LOW_ENERGY;
  if (level <= 4) return ENERGY_STATES.NORMAL_ENERGY;
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
  const energyLevel = overrides.forceEnergyLevel ?? getEnergyLevel(steps, goal);
  const rawEnergyState = getEnergyState(steps, goal);
  const rawLongTermState = getLongTermState(history, goal);
  const energyState = overrides.forceShortTermState ?? rawEnergyState;
  const longTermState = overrides.forceLongTermState ?? rawLongTermState;
  const backgroundState = overrides.forceBackgroundState ?? energyState;
  const mainActions = MAIN_ACTION_LIBRARY.map((action) => ({
    ...action,
    clipSpeed: roundToThree(action.clipSpeed * (overrides.animationSpeedMultiplier ?? 1)),
    worldSpeed: roundToThree(action.worldSpeed * resolveMovementMultiplier(action.motionKind, overrides)),
    weight: overrides.weightOverrides?.[action.key] ?? action.baseWeight,
  }));
  const specialActions = SPECIAL_ACTION_LIBRARY.map((action) => ({
    ...action,
    clipSpeed: roundToThree(action.clipSpeed * (overrides.animationSpeedMultiplier ?? 1)),
    worldSpeed: roundToThree(action.worldSpeed * resolveMovementMultiplier(action.motionKind, overrides)),
    weight: overrides.weightOverrides?.[action.key] ?? action.baseWeight,
  }));
  const allActions = [...mainActions, ...specialActions];
  const actionMap = allActions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});
  const mainActionMap = mainActions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});
  const transitionActionMap = specialActions.reduce((map, action) => {
    map[action.key] = action;
    return map;
  }, {});

  const defaultMainActionKey = ENERGY_LEVEL_TO_STATE[energyLevel] ?? ACTION_KEYS.energy3;
  const energyAction = mainActionMap[defaultMainActionKey] ?? mainActions[3] ?? mainActions[0];
  const forcedAction = resolveActionByKey(allActions, overrides.forcedActionKey);

  return {
    energyLevel,
    energyState,
    longTermState,
    backgroundState,
    forcedActionKey: overrides.forcedActionKey ?? null,
    mainActions,
    transitionActions: specialActions,
    specialActions,
    allActions,
    actionMap,
    mainActionMap,
    transitionActionMap,
    defaultMainActionKey,
    defaultTransitionActionKey: ACTION_KEYS.hipHopDancing,
    currentAction: forcedAction ?? energyAction,
    animationState: forcedAction?.key ?? energyAction.key,
    animationClip: ENERGY_LEVEL_TO_CLIP[forcedAction?.key ?? energyAction.key] ?? energyAction.clipKey,
    animationSpeed:
      roundToThree((overrides.animationSpeedMultiplier ?? 1) * (ENERGY_LEVEL_TO_ANIMATION_SPEED[forcedAction?.key ?? energyAction.key] ?? 1)),
    mood: {
      background: getMoodBackgroundForEnergyState(backgroundState),
      stage: getMoodStageForEnergyState(backgroundState),
      bubbleSurface: getMoodBubbleSurfaceForEnergyState(backgroundState),
      effect: getMoodEffectForEnergyState(backgroundState),
      brightness: getMoodBrightnessForEnergyState(backgroundState),
      cloudSpeed: getMoodCloudSpeedForEnergyState(backgroundState),
    },
    timing: {
      specialRetryRange: [8, 18],
      specialDurationRange: [2.4, 3.8],
    },
    speed: {
      walking: overrides.walkingSpeedMultiplier ?? 1,
      running: overrides.runningSpeedMultiplier ?? 1,
      animation: overrides.animationSpeedMultiplier ?? 1,
    },
    specialActionPool: [
      { key: ACTION_KEYS.energy6, clipKey: ENERGY_LEVEL_TO_CLIP[ACTION_KEYS.energy6], weight: 80, label: ACTION_LABELS.energy6 },
      { key: ACTION_KEYS.hipHopDancing, clipKey: ENERGY_LEVEL_TO_CLIP[ACTION_KEYS.hipHopDancing], weight: 15, label: ACTION_LABELS.hipHopDancing },
      { key: ACTION_KEYS.moonwalk, clipKey: ENERGY_LEVEL_TO_CLIP[ACTION_KEYS.moonwalk], weight: 5, label: ACTION_LABELS.moonwalk },
    ],
    signature: buildBehaviorSignature({
      energyLevel,
      energyState,
      longTermState,
      backgroundState,
      overrides,
      mainActions,
      specialActions,
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
  if (kind === ACTION_TYPES.SPECIAL) return "Special";
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

function resolveMovementMultiplier(motionKind, overrides) {
  if (motionKind === "walk") {
    return overrides.walkingSpeedMultiplier ?? 1;
  }

  if (motionKind === "run") {
    return overrides.runningSpeedMultiplier ?? 1;
  }

  return 1;
}

function getMotionKindForEnergyKey(key) {
  switch (key) {
    case ACTION_KEYS.energy0:
    case ACTION_KEYS.energy1:
    case ACTION_KEYS.energy2:
    case ACTION_KEYS.energy3:
      return "neutral";
    case ACTION_KEYS.energy4:
      return "walk";
    case ACTION_KEYS.energy5:
    case ACTION_KEYS.energy6:
      return "run";
    default:
      return "neutral";
  }
}

function getWorldSpeedForEnergyKey(key) {
  switch (key) {
    case ACTION_KEYS.energy0:
      return 0.0;
    case ACTION_KEYS.energy1:
      return 0.0;
    case ACTION_KEYS.energy2:
      return 0.0;
    case ACTION_KEYS.energy3:
      return 0.02;
    case ACTION_KEYS.energy4:
      return 0.14;
    case ACTION_KEYS.energy5:
      return 0.26;
    case ACTION_KEYS.energy6:
      return 0.26;
    default:
      return 0.0;
  }
}

function buildBehaviorSignature({
  energyLevel,
  energyState,
  longTermState,
  backgroundState,
  overrides,
  mainActions,
  specialActions,
}) {
  return [
    `el:${energyLevel}`,
    `es:${energyState}`,
    `ls:${longTermState}`,
    `bs:${backgroundState}`,
    `fa:${overrides.forcedActionKey ?? ""}`,
    `w:${overrides.walkingSpeedMultiplier ?? 1}`,
    `r:${overrides.runningSpeedMultiplier ?? 1}`,
    `a:${overrides.animationSpeedMultiplier ?? 1}`,
    `main:${mainActions.map((action) => `${action.key}:${formatWeight(action.weight)}`).join("|")}`,
    `special:${specialActions.map((action) => `${action.key}:${formatWeight(action.weight)}`).join("|")}`,
  ].join(";");
}

function roundToThree(value) {
  return Math.round(value * 1000) / 1000;
}

function formatWeight(value) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function getMoodBackgroundForEnergyState(energyState) {
  switch (energyState) {
    case ENERGY_STATES.LOW_ENERGY:
      return ["#f2f0ea", "#fbfaf6"];
    case ENERGY_STATES.HIGH_ENERGY:
      return ["#eef8ef", "#f7fcf4"];
    case ENERGY_STATES.NORMAL_ENERGY:
    default:
      return ["#f7f5ef", "#eef3f7"];
  }
}

function getMoodStageForEnergyState(energyState) {
  switch (energyState) {
    case ENERGY_STATES.LOW_ENERGY:
      return "#f3efe5";
    case ENERGY_STATES.HIGH_ENERGY:
      return "#edf8f0";
    case ENERGY_STATES.NORMAL_ENERGY:
    default:
      return "#f3f4f8";
  }
}

function getMoodBubbleSurfaceForEnergyState(energyState) {
  switch (energyState) {
    case ENERGY_STATES.LOW_ENERGY:
      return "#f7f2e9";
    case ENERGY_STATES.HIGH_ENERGY:
      return "#edf8ef";
    case ENERGY_STATES.NORMAL_ENERGY:
    default:
      return "#f5f4fb";
  }
}

function getMoodEffectForEnergyState(energyState) {
  switch (energyState) {
    case ENERGY_STATES.LOW_ENERGY:
      return "cloudy";
    case ENERGY_STATES.HIGH_ENERGY:
      return "sparkle";
    case ENERGY_STATES.NORMAL_ENERGY:
    default:
      return "float";
  }
}

function getMoodBrightnessForEnergyState(energyState) {
  switch (energyState) {
    case ENERGY_STATES.LOW_ENERGY:
      return 0.88;
    case ENERGY_STATES.HIGH_ENERGY:
      return 1.05;
    case ENERGY_STATES.NORMAL_ENERGY:
    default:
      return 1;
  }
}

function getMoodCloudSpeedForEnergyState(energyState) {
  switch (energyState) {
    case ENERGY_STATES.LOW_ENERGY:
      return 0.28;
    case ENERGY_STATES.HIGH_ENERGY:
      return 1.15;
    case ENERGY_STATES.NORMAL_ENERGY:
    default:
      return 0.62;
  }
}
