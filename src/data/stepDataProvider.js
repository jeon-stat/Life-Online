import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { Pedometer } from "expo-sensors";

import {
  CUSTOMIZATION_CATEGORIES,
  CUSTOMIZATION_ITEMS,
} from "./customizationCatalog.js";
import {
  HISTORY_RETENTION_DAYS,
  STEP_STORAGE_KEY,
  createDefaultStepRecord,
  mergeStepHistory,
  migratePersistedStepData,
  normalizePersistedStepData,
  normalizeStepRecord,
} from "./stepDataMigration.js";
import { advanceMockHistoryDay, createMockStepSnapshot, updateMockHistorySteps } from "./mockStepData.js";
import { readPersistedJson, writePersistedJson } from "../storage/persistedJson.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { addDays, formatDateKey, getWeekKey, normalizeDateKey, startOfLocalDay } from "../game/dateUtils.js";
import {
  ACTION_CATALOG,
  BACKGROUND_CATALOG,
  EXPRESSION_CATALOG,
  OUTFIT_CATALOG,
  PET_CATALOG,
  getRewardById,
  getRewardsForLevel,
  getStarterActionId,
  getStarterBackgroundId,
  getUnlockedContentIds,
} from "../game/levelRewards.js";
import {
  createDefaultGrowthState,
  getGoalStreak,
  getGrowthOverview,
  getRecentDailyResults,
  getWeeklyResultSummary,
  mergeRewardIds,
  normalizeGrowthState,
  processPendingDailyResults,
  requiredPoints,
} from "../game/progression.js";
import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";

const StepDataContext = createContext(null);
const STEP_REFRESH_INTERVAL_MS = 30000;
const DEVICE_FETCH_DAYS = 30;
const WELCOME_FEEDBACK_MS = 6000;
const WALK_FEEDBACK_MS = 9000;
const CELEBRATION_FEEDBACK_MS = 12000;

function getTodayDateKey() {
  return formatDateKey(new Date());
}

async function readStepCountForRange(start, end) {
  const result = await Pedometer.getStepCountAsync(start, end).catch(() => null);
  return Math.max(0, Math.floor(Number(result?.steps ?? 0)));
}

async function requestPedometerPermission() {
  const current = await Pedometer.getPermissionsAsync().catch(() => null);
  if (current?.granted) {
    return current;
  }

  const requested = await Pedometer.requestPermissionsAsync().catch(() => null);
  return requested ?? current;
}

async function ensurePedometerPermission(currentStatus) {
  if (currentStatus === "granted") {
    return { granted: true, status: "granted" };
  }

  if (currentStatus === "denied" || currentStatus === "unavailable") {
    return { granted: false, status: currentStatus };
  }

  return requestPedometerPermission();
}

async function readRecentStepHistory(days = DEVICE_FETCH_DAYS) {
  const today = startOfLocalDay(new Date());
  const records = await Promise.all(
    Array.from({ length: days }, async (_, index) => {
      const day = addDays(today, -index);
      const dayEnd = addDays(day, 1);
      const steps = await readStepCountForRange(day, dayEnd);
      const dateKey = formatDateKey(day);

      return normalizeStepRecord({
        id: dateKey,
        date: dateKey,
        steps,
        source: index === 0 ? "device" : "device_history",
        hasData: true,
      });
    }),
  );

  return mergeStepHistory([], records);
}

async function readTodayStepRecord() {
  const today = startOfLocalDay(new Date());
  const now = new Date();
  const steps = await readStepCountForRange(today, now);

  return normalizeStepRecord({
    id: getTodayDateKey(),
    date: getTodayDateKey(),
    steps,
    source: "device",
    hasData: true,
  });
}

export function StepDataProvider({ children, mode = "mock", adminEnabled = false }) {
  const [mockState, setMockState] = useState(() => createMockStepSnapshot(new Date()));
  const [shopState, setShopState] = useState(() => normalizePersistedStepData({}).shopState);
  const [claimedMissionRewardIds, setClaimedMissionRewardIds] = useState([]);
  const [deviceStepState, setDeviceStepState] = useState(() => normalizePersistedStepData({}).deviceStepState);
  const [growthState, setGrowthState] = useState(() => createDefaultGrowthState());
  const [adminVisible, setAdminVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [feedbackState, setFeedbackState] = useState({
    walking: false,
    celebrating: false,
    welcoming: false,
  });
  const syncInFlightRef = useRef(false);
  const syncQueuedRef = useRef(false);
  const feedbackTimeoutsRef = useRef({});
  const previousTodayStepsRef = useRef(null);
  const previousReachedGoalRef = useRef(false);

  const isMockMode = mode === "mock";
  const isNativeStepMode = !isMockMode && Platform.OS !== "web";
  const history = isMockMode ? mockState.history : deviceStepState.history;
  const today =
    history[0] ??
    createDefaultStepRecord(new Date(), isMockMode ? "mock" : "device", isMockMode);

  useEffect(() => {
    let cancelled = false;

    readPersistedJson(STEP_STORAGE_KEY, null)
      .then((value) => {
        if (cancelled) {
          return;
        }

        const migrated = migratePersistedStepData(value);
        setShopState(migrated.shopState);
        setClaimedMissionRewardIds(migrated.claimedMissionRewardIds);
        setDeviceStepState(migrated.deviceStepState);
        setGrowthState(migrated.growthState);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void writePersistedJson(
      STEP_STORAGE_KEY,
      normalizePersistedStepData({
        version: 3,
        shopState,
        claimedMissionRewardIds,
        deviceStepState,
        growthState,
      }),
    );
  }, [claimedMissionRewardIds, deviceStepState, growthState, isReady, shopState]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    setGrowthState((current) =>
      processPendingDailyResults({
        growthState: current,
        history,
        goal: DEFAULT_STEP_GOAL,
        todayDateKey: today.date,
      }),
    );
  }, [history, isReady, today.date]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    pulseFeedback(setFeedbackState, feedbackTimeoutsRef, "welcoming", WELCOME_FEEDBACK_MS);
  }, [isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const currentSteps = today.steps ?? 0;
    const previousSteps = previousTodayStepsRef.current;
    const reachedGoal = currentSteps >= DEFAULT_STEP_GOAL;
    const didIncrease = previousSteps != null && currentSteps > previousSteps;

    if (didIncrease) {
      pulseFeedback(setFeedbackState, feedbackTimeoutsRef, "walking", WALK_FEEDBACK_MS);
    }

    if (reachedGoal && !previousReachedGoalRef.current) {
      pulseFeedback(setFeedbackState, feedbackTimeoutsRef, "celebrating", CELEBRATION_FEEDBACK_MS);
    }

    previousTodayStepsRef.current = currentSteps;
    previousReachedGoalRef.current = reachedGoal;
  }, [isReady, today.steps]);

  useEffect(() => {
    if (!isReady || !isNativeStepMode) {
      return undefined;
    }

    let cancelled = false;
    let appStateSubscription = null;
    let intervalId = null;

    async function syncStepData({ includeHistory = false } = {}) {
      if (syncInFlightRef.current) {
        syncQueuedRef.current = true;
        return;
      }

      syncInFlightRef.current = true;

      try {
        const available = await Pedometer.isAvailableAsync().catch(() => false);
        if (cancelled) {
          return;
        }

        if (!available) {
          setDeviceStepState((current) => ({
            ...current,
            history: current.history.length ? current.history : [createDefaultStepRecord(new Date())],
            pedometerAvailable: false,
            permissionStatus: "unavailable",
            source: "device",
            lastSyncAt: new Date().toISOString(),
          }));
          return;
        }

        const permission = await ensurePedometerPermission(deviceStepState.permissionStatus);
        if (cancelled) {
          return;
        }

        const permissionStatus = normalizePermissionStatus(permission?.status);
        if (!permission?.granted) {
          setDeviceStepState((current) => ({
            ...current,
            history: current.history.length
              ? current.history
              : [createDefaultStepRecord(new Date(), "device", false)],
            pedometerAvailable: true,
            permissionStatus,
            source: "device",
            lastSyncAt: new Date().toISOString(),
          }));
          return;
        }

        if (includeHistory) {
          const nextHistory = await readRecentStepHistory(DEVICE_FETCH_DAYS);
          if (cancelled) {
            return;
          }

          setDeviceStepState((current) => ({
            ...current,
            history: mergeStepHistory(current.history, nextHistory).slice(0, HISTORY_RETENTION_DAYS),
            pedometerAvailable: true,
            permissionStatus,
            source: "device",
            lastSyncAt: new Date().toISOString(),
          }));
          return;
        }

        const todayRecord = await readTodayStepRecord();
        if (cancelled) {
          return;
        }

        setDeviceStepState((current) => ({
          ...current,
          history: mergeStepHistory(current.history, [todayRecord]).slice(0, HISTORY_RETENTION_DAYS),
          pedometerAvailable: true,
          permissionStatus,
          source: "device",
          lastSyncAt: new Date().toISOString(),
        }));
      } catch {
        if (!cancelled) {
          setDeviceStepState((current) => ({
            ...current,
            pedometerAvailable: false,
            permissionStatus: "unavailable",
            source: "device",
            lastSyncAt: new Date().toISOString(),
          }));
        }
      } finally {
        syncInFlightRef.current = false;

        if (syncQueuedRef.current && !cancelled) {
          syncQueuedRef.current = false;
          void syncStepData({ includeHistory: false });
        }
      }
    }

    void syncStepData({ includeHistory: true });

    intervalId = setInterval(() => {
      void syncStepData({ includeHistory: false });
    }, STEP_REFRESH_INTERVAL_MS);

    appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        pulseFeedback(setFeedbackState, feedbackTimeoutsRef, "welcoming", WELCOME_FEEDBACK_MS);
        void syncStepData({ includeHistory: false });
      }
    });

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      appStateSubscription?.remove?.();
    };
  }, [deviceStepState.permissionStatus, isNativeStepMode, isReady]);

  const currentWeekKey = getWeekKey(today.date);
  const growthOverview = getGrowthOverview(growthState);
  const recentDailyResults = getRecentDailyResults(growthState);
  const weeklySummary = getWeeklyResultSummary(growthState, currentWeekKey);
  const unlockedActionIds = [getStarterActionId(), ...getUnlockedContentIds(growthState.unlockedRewardIds, "action")];
  const unlockedBackgroundIds = [getStarterBackgroundId(), ...getUnlockedContentIds(growthState.unlockedRewardIds, "background")];
  const unlockedPetIds = getUnlockedContentIds(growthState.unlockedRewardIds, "pet");
  const unlockedExpressionIds = ["expression-starter-calm", ...getUnlockedContentIds(growthState.unlockedRewardIds, "expression")];
  const unlockedOutfitIds = getUnlockedContentIds(growthState.unlockedRewardIds, "outfit");
  const actionOptions = ACTION_CATALOG.map((action) => ({
    ...action,
    unlocked: unlockedActionIds.includes(action.id),
  }));
  const backgroundOptions = BACKGROUND_CATALOG.map((background) => ({
    ...background,
    unlocked: unlockedBackgroundIds.includes(background.id),
  }));
  const petOptions = PET_CATALOG.map((pet) => ({
    ...pet,
    unlocked: unlockedPetIds.includes(pet.id),
  }));
  const expressionOptions = EXPRESSION_CATALOG.map((expression) => ({
    ...expression,
    unlocked: unlockedExpressionIds.includes(expression.id),
  }));
  const outfitOptions = OUTFIT_CATALOG.map((outfit) => ({
    ...outfit,
    unlocked: unlockedOutfitIds.includes(outfit.id),
  }));

  const characterViewState = useMemo(
    () =>
      buildCharacterViewModel({
        todayRecord: today,
        history,
        goal: DEFAULT_STEP_GOAL,
        growthState,
        recentFeedback: feedbackState,
      }),
    [feedbackState, growthState, history, today],
  );

  const value = useMemo(
    () => ({
      mode,
      isReady,
      goal: DEFAULT_STEP_GOAL,
      today,
      history,
      device: {
        available: deviceStepState.pedometerAvailable,
        permissionStatus: deviceStepState.permissionStatus,
        lastSyncAt: deviceStepState.lastSyncAt,
        source: deviceStepState.source,
      },
      growth: {
        ...growthOverview,
        recentDailyResults,
        weeklySummary,
        streak: getGoalStreak(growthState),
        lifetimeSteps: history.reduce((sum, record) => sum + (record?.steps ?? 0), 0),
        selectedActionId: growthState.selectedActionId,
        selectedPetId: growthState.selectedPetId,
        selectedBackgroundId: growthState.selectedBackgroundId,
        selectedExpressionId: growthState.selectedExpressionId,
        selectedOutfitId: growthState.selectedOutfitId,
        levelUpEvents: growthState.levelUpEvents,
        selectAction: (actionId) => {
          if (!unlockedActionIds.includes(actionId)) return;
          setGrowthState((current) => normalizeGrowthState({ ...current, selectedActionId: actionId }));
        },
        selectPet: (petId) => {
          if (petId !== null && !unlockedPetIds.includes(petId)) return;
          setGrowthState((current) => normalizeGrowthState({ ...current, selectedPetId: petId }));
        },
        selectBackground: (backgroundId) => {
          if (!unlockedBackgroundIds.includes(backgroundId)) return;
          setGrowthState((current) => normalizeGrowthState({ ...current, selectedBackgroundId: backgroundId }));
        },
        selectExpression: (expressionId) => {
          if (!unlockedExpressionIds.includes(expressionId)) return;
          setGrowthState((current) => normalizeGrowthState({ ...current, selectedExpressionId: expressionId }));
        },
        selectOutfit: (outfitId) => {
          if (outfitId !== null && !unlockedOutfitIds.includes(outfitId)) return;
          setGrowthState((current) => normalizeGrowthState({ ...current, selectedOutfitId: outfitId }));
        },
      },
      rewards: {
        actionOptions,
        backgroundOptions,
        petOptions,
        expressionOptions,
        outfitOptions,
        roadmap: Array.from({ length: 20 }, (_, index) => ({
          level: index + 1,
          rewards: getRewardsForLevel(index + 1),
          reached: growthOverview.highestLevelReached >= index + 1,
          current: growthOverview.currentLevel === index + 1,
        })),
        getReward: getRewardById,
      },
      characterViewState,
      shop: {
        coinBalance: shopState.coinBalance,
        categories: CUSTOMIZATION_CATEGORIES,
        items: CUSTOMIZATION_ITEMS,
        ownedItemIdsByCategory: shopState.ownedItemIdsByCategory,
        selectedItemIdsByCategory: shopState.selectedItemIdsByCategory,
        skinToneId: shopState.skinToneId,
        isOwnedItem: (categoryId, itemId) => (shopState.ownedItemIdsByCategory?.[categoryId] ?? []).includes(itemId),
        selectItem: (categoryId, itemId) => {
          setShopState((current) => {
            if (current.selectedItemIdsByCategory?.[categoryId] === itemId) {
              return current;
            }

            if (categoryId !== "skinTone" && !(current.ownedItemIdsByCategory?.[categoryId] ?? []).includes(itemId)) {
              return current;
            }

            return {
              ...current,
              selectedItemIdsByCategory: {
                ...current.selectedItemIdsByCategory,
                [categoryId]: itemId,
              },
              skinToneId: categoryId === "skinTone" ? itemId : current.skinToneId,
            };
          });
        },
        purchaseItem: (categoryId, itemId, price = 0) => {
          let purchaseStatus = "purchased";

          setShopState((current) => {
            const ownedIds = current.ownedItemIdsByCategory?.[categoryId] ?? [];
            if (ownedIds.includes(itemId)) {
              purchaseStatus = "owned";
              return current;
            }

            const nextCoinBalance = Math.max(0, current.coinBalance - price);
            if (current.coinBalance < price) {
              purchaseStatus = "insufficient";
              return current;
            }

            purchaseStatus = "purchased";
            return {
              ...current,
              coinBalance: nextCoinBalance,
              ownedItemIdsByCategory: {
                ...current.ownedItemIdsByCategory,
                [categoryId]: [...ownedIds, itemId],
              },
            };
          });

          return purchaseStatus;
        },
        grantCoins: (amount = 0) => {
          const coinAmount = Math.max(0, Math.floor(Number(amount ?? 0)));
          if (!coinAmount) {
            return 0;
          }

          setShopState((current) => ({
            ...current,
            coinBalance: current.coinBalance + coinAmount,
          }));

          return coinAmount;
        },
        setSkinTone: (nextSkinToneId) => {
          setShopState((current) => ({
            ...current,
            skinToneId: nextSkinToneId,
            selectedItemIdsByCategory: {
              ...current.selectedItemIdsByCategory,
              skinTone: nextSkinToneId,
            },
          }));
        },
      },
      missionRewards: {
        claimedIds: claimedMissionRewardIds,
        isClaimed: (missionId) => claimedMissionRewardIds.includes(missionId),
        claim: ({ missionId, coins = 0 }) => {
          if (!missionId) {
            return false;
          }

          let didClaim = false;
          const coinAmount = Math.max(0, Math.floor(Number(coins ?? 0)));
          setClaimedMissionRewardIds((current) => {
            if (current.includes(missionId)) {
              return current;
            }

            didClaim = true;
            return [...current, missionId];
          });

          if (didClaim && coinAmount > 0) {
            setShopState((current) => ({
              ...current,
              coinBalance: current.coinBalance + coinAmount,
            }));
          }

          return didClaim;
        },
      },
      admin: {
        visible: adminVisible,
        canOverride: Boolean(adminEnabled && isMockMode),
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
        dates: history.slice(0, 14).map((record) => record.date),
        selectedTodayDate: today.date,
        setTodaySteps: (steps) => {
          if (!isMockMode) return;
          setMockState((current) => ({
            ...current,
            history: updateMockHistorySteps(current.history, today.date, steps),
          }));
        },
        setPastSteps: (dateKey, steps) => {
          if (!isMockMode) return;
          setMockState((current) => ({
            ...current,
            history: updateMockHistorySteps(current.history, normalizeDateKey(dateKey), steps),
          }));
        },
        advanceDay: () => {
          if (!isMockMode) return;
          setMockState((current) => ({
            ...current,
            history: advanceMockHistoryDay(current.history, 0),
          }));
        },
        processPendingResults: () => {
          setGrowthState((current) =>
            processPendingDailyResults({
              growthState: current,
              history,
              goal: DEFAULT_STEP_GOAL,
              todayDateKey: today.date,
            }),
          );
        },
        rebuildGrowth: () => {
          setGrowthState((current) => {
            const resetState = {
              ...createDefaultGrowthState(),
              selectedActionId: current.selectedActionId,
              selectedPetId: current.selectedPetId,
              selectedBackgroundId: current.selectedBackgroundId,
              selectedExpressionId: current.selectedExpressionId,
              selectedOutfitId: current.selectedOutfitId,
            };

            return processPendingDailyResults({
              growthState: resetState,
              history,
              goal: DEFAULT_STEP_GOAL,
              todayDateKey: today.date,
            });
          });
        },
        setCurrentLevel: (level) => {
          const nextLevel = Math.max(1, Math.min(20, Math.floor(Number(level ?? 1))));
          setGrowthState((current) =>
            normalizeGrowthState({
              ...current,
              currentLevel: nextLevel,
              highestLevelReached: Math.max(current.highestLevelReached, nextLevel),
              unlockedRewardIds: mergeRewardIds(current.unlockedRewardIds, Math.max(current.highestLevelReached, nextLevel)),
            }),
          );
        },
        setGrowthPoints: (points) => {
          const safePoints = Math.max(0, Math.floor(Number(points ?? 0)));
          setGrowthState((current) =>
            normalizeGrowthState({
              ...current,
              growthPoints: Math.min(requiredPoints(current.currentLevel) - 1, safePoints),
            }),
          );
        },
        setWeeklyRestUsed: (used) => {
          setGrowthState((current) =>
            normalizeGrowthState({
              ...current,
              currentWeekKey,
              weeklyRestUsed: Boolean(used),
            }),
          );
        },
        unlockReward: (rewardId) => {
          if (!getRewardById(rewardId)) return;
          setGrowthState((current) =>
            normalizeGrowthState({
              ...current,
              unlockedRewardIds: [...current.unlockedRewardIds, rewardId],
            }),
          );
        },
        resetGrowthData: () => {
          setGrowthState(createDefaultGrowthState());
        },
        simulateMigration: () => {
          setGrowthState((current) =>
            migratePersistedStepData({
              shopState,
              claimedMissionRewardIds,
              deviceStepState: { ...deviceStepState, history },
              growthState: null,
            }).growthState,
          );
        },
      },
    }),
    [
      actionOptions,
      adminEnabled,
      adminVisible,
      backgroundOptions,
      characterViewState,
      claimedMissionRewardIds,
      currentWeekKey,
      deviceStepState,
      expressionOptions,
      growthOverview,
      growthState,
      history,
      isMockMode,
      isReady,
      mode,
      outfitOptions,
      petOptions,
      recentDailyResults,
      shopState,
      today,
      unlockedActionIds,
      unlockedBackgroundIds,
      unlockedExpressionIds,
      unlockedOutfitIds,
      unlockedPetIds,
      weeklySummary,
    ],
  );

  return <StepDataContext.Provider value={value}>{children}</StepDataContext.Provider>;
}

function normalizePermissionStatus(value) {
  const status = String(value ?? "").trim();
  if (status === "granted" || status === "denied" || status === "undetermined" || status === "unavailable") {
    return status;
  }

  return "unknown";
}

function pulseFeedback(setFeedbackState, feedbackTimeoutsRef, key, duration) {
  setFeedbackState((current) => ({ ...current, [key]: true }));

  if (feedbackTimeoutsRef.current[key]) {
    clearTimeout(feedbackTimeoutsRef.current[key]);
  }

  feedbackTimeoutsRef.current[key] = setTimeout(() => {
    setFeedbackState((current) => ({ ...current, [key]: false }));
  }, duration);
}

export function useStepData() {
  const context = useContext(StepDataContext);

  if (!context) {
    throw new Error("useStepData must be used inside StepDataProvider");
  }

  return context;
}
