import { createContext, useContext, useMemo, useState } from "react";

import { SKIN_TONE_PRESETS } from "../characters.js";
import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";
import { createMockStepSnapshot } from "./mockStepData.js";

const StepDataContext = createContext(null);

export function StepDataProvider({ children, mode = "mock", adminEnabled = false }) {
  const [mockState, setMockState] = useState(() => createMockStepSnapshot());
  const [skinToneId, setSkinToneId] = useState(SKIN_TONE_PRESETS[0]?.id ?? null);
  const [adminVisible, setAdminVisible] = useState(() => Boolean(adminEnabled));
  const [behaviorAdmin, setBehaviorAdmin] = useState(() => ({
    forcedEnergyLevel: null,
    forcedLongTermState: null,
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
        visible: adminVisible,
        canOverride: Boolean(adminEnabled && isMockMode),
        source: today.source,
        ...behaviorAdmin,
        skinTones: SKIN_TONE_PRESETS,
        skinToneId,
        setSkinTone: (nextSkinToneId) => {
          if (!adminEnabled) return;
          setSkinToneId(nextSkinToneId);
        },
        toggleVisible: () => {
          if (!adminEnabled) return;
          setAdminVisible((current) => !current);
        },
        show: () => {
          if (!adminEnabled) return;
          setAdminVisible(true);
        },
        hide: () => {
          if (!adminEnabled) return;
          setAdminVisible(false);
        },
        setForcedEnergyLevel: (nextLevel) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({
            ...current,
            forcedEnergyLevel: nextLevel === null ? null : clampNumber(nextLevel, 0, 6),
          }));
        },
        setForcedLongTermState: (nextState) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({ ...current, forcedLongTermState: nextState }));
        },
        resetBehavior: () => {
          if (!adminEnabled) return;
          setBehaviorAdmin({
            forcedEnergyLevel: null,
            forcedLongTermState: null,
          });
        },
        resetMock: () => {
          if (!adminEnabled || !isMockMode) return;
          setMockState(createMockStepSnapshot());
        },
      },
    }),
    [adminEnabled, adminVisible, behaviorAdmin, history, isMockMode, mode, skinToneId, today],
  );

  return <StepDataContext.Provider value={value}>{children}</StepDataContext.Provider>;
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

export function useStepData() {
  const context = useContext(StepDataContext);

  if (!context) {
    throw new Error("useStepData must be used inside StepDataProvider");
  }

  return context;
}
