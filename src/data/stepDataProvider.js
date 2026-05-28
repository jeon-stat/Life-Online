import { createContext, useContext, useMemo, useState } from "react";

import { SKIN_TONE_PRESETS } from "../characters.js";
import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";
import { ADMIN_STEP_PRESETS, applyAdminOverride, createMockStepSnapshot } from "./mockStepData.js";

const StepDataContext = createContext(null);

export function StepDataProvider({ children, mode = "mock", adminEnabled = false }) {
  const [mockState, setMockState] = useState(() => createMockStepSnapshot());
  const [skinToneId, setSkinToneId] = useState(SKIN_TONE_PRESETS[0]?.id ?? null);
  const [behaviorAdmin, setBehaviorAdmin] = useState(() => ({
    forcedShortTermState: null,
    forcedLongTermState: null,
    forcedBackgroundState: null,
    forcedActionKey: null,
    walkingSpeedMultiplier: 1,
    runningSpeedMultiplier: 1,
    animationSpeedMultiplier: 1,
    mainDurationRange: [8, 15],
    transitionDurationRange: [1, 3],
    waitDurationRange: [1, 4],
    weightOverrides: {},
  }));
  const isMockMode = mode === "mock";
  const history = isMockMode ? mockState.history : [];
  const today = history[0] ?? {
    id: "today",
    date: new Date().toISOString().slice(0, 10),
    steps: 0,
    source: isMockMode ? "mock" : "device",
  };

  const value = useMemo(
    () => ({
      mode,
      goal: DEFAULT_STEP_GOAL,
      today,
      history,
      admin: {
        visible: Boolean(adminEnabled),
        canOverride: Boolean(adminEnabled && isMockMode),
        source: today.source,
        presets: ADMIN_STEP_PRESETS,
        ...behaviorAdmin,
        motionOverride: behaviorAdmin.forcedActionKey,
        motionStates: ["idle", "walk", "run", "tired"],
        skinTones: SKIN_TONE_PRESETS,
        skinToneId,
        setSkinTone: (nextSkinToneId) => {
          if (!adminEnabled) return;
          setSkinToneId(nextSkinToneId);
        },
        setForcedShortTermState: (nextState) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedShortTermState: nextState }));
        },
        setForcedLongTermState: (nextState) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedLongTermState: nextState }));
        },
        setForcedBackgroundState: (nextState) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedBackgroundState: nextState }));
        },
        setForcedActionKey: (nextActionKey) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedActionKey: nextActionKey }));
        },
        setWalkingSpeedMultiplier: (nextValue) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, walkingSpeedMultiplier: clampNumber(nextValue, 0.2, 3) }));
        },
        setRunningSpeedMultiplier: (nextValue) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, runningSpeedMultiplier: clampNumber(nextValue, 0.2, 3) }));
        },
        setAnimationSpeedMultiplier: (nextValue) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, animationSpeedMultiplier: clampNumber(nextValue, 0.2, 3) }));
        },
        setMainDurationRange: (nextMin, nextMax) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, mainDurationRange: normalizeRangePair(nextMin, nextMax, [8, 15]) }));
        },
        setTransitionDurationRange: (nextMin, nextMax) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, transitionDurationRange: normalizeRangePair(nextMin, nextMax, [1, 3]) }));
        },
        setWaitDurationRange: (nextMin, nextMax) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, waitDurationRange: normalizeRangePair(nextMin, nextMax, [1, 4]) }));
        },
        setWeightOverride: (actionKey, nextWeight) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({
            ...current,
            weightOverrides: {
              ...current.weightOverrides,
              [actionKey]: clampNumber(nextWeight, 0, 100),
            },
          }));
        },
        adjustWeightOverride: (actionKey, delta) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => {
            const nextWeight = clampNumber((current.weightOverrides?.[actionKey] ?? 0) + delta, 0, 100);
            return {
              ...current,
              weightOverrides: {
                ...current.weightOverrides,
                [actionKey]: nextWeight,
              },
            };
          });
        },
        resetWeightOverrides: () => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, weightOverrides: {} }));
        },
        setPreset: (preset) => {
          if (!adminEnabled || !isMockMode) return;
          setMockState(applyAdminOverride(preset.steps));
        },
        setMotionOverride: (nextState) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedActionKey: nextState }));
        },
        resetMotionOverride: () => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedActionKey: null }));
        },
        resetBehavior: () => {
          if (!adminEnabled) return;
          setBehaviorAdmin({
            forcedShortTermState: null,
            forcedLongTermState: null,
            forcedBackgroundState: null,
            forcedActionKey: null,
            walkingSpeedMultiplier: 1,
            runningSpeedMultiplier: 1,
            animationSpeedMultiplier: 1,
            mainDurationRange: [8, 15],
            transitionDurationRange: [1, 3],
            waitDurationRange: [1, 4],
            weightOverrides: {},
          });
        },
        resetMock: () => {
          if (!adminEnabled || !isMockMode) return;
          setMockState(createMockStepSnapshot());
        },
      },
    }),
    [adminEnabled, behaviorAdmin, history, isMockMode, mode, skinToneId, today],
  );

  return <StepDataContext.Provider value={value}>{children}</StepDataContext.Provider>;
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeRangePair(minValue, maxValue, fallback) {
  const min = clampNumber(minValue, fallback[0], fallback[1]);
  const max = clampNumber(maxValue, fallback[0], fallback[1]);
  if (max < min) return [max, min];
  return [min, max];
}

export function useStepData() {
  const context = useContext(StepDataContext);

  if (!context) {
    throw new Error("useStepData must be used inside StepDataProvider");
  }

  return context;
}
