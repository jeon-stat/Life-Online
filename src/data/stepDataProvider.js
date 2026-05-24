import { createContext, useContext, useMemo, useState } from "react";

import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";
import { ADMIN_STEP_PRESETS, applyAdminOverride, createMockStepSnapshot } from "./mockStepData.js";

const StepDataContext = createContext(null);

export function StepDataProvider({ children, mode = "mock", adminEnabled = false }) {
  const [mockState, setMockState] = useState(() => createMockStepSnapshot());
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
        setPreset: (preset) => {
          if (!adminEnabled || !isMockMode) return;
          setMockState(applyAdminOverride(preset.steps));
        },
        resetMock: () => {
          if (!adminEnabled || !isMockMode) return;
          setMockState(createMockStepSnapshot());
        },
      },
    }),
    [adminEnabled, history, isMockMode, mode, today],
  );

  return <StepDataContext.Provider value={value}>{children}</StepDataContext.Provider>;
}

export function useStepData() {
  const context = useContext(StepDataContext);

  if (!context) {
    throw new Error("useStepData must be used inside StepDataProvider");
  }

  return context;
}
