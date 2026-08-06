import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { Pedometer } from "expo-sensors";

import {
  CUSTOMIZATION_CATEGORIES,
  CUSTOMIZATION_ITEMS,
  DEFAULT_SHOP_COIN_BALANCE,
  createDefaultOwnedItemIds,
  createDefaultSelectedItemIds,
} from "./customizationCatalog.js";
import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";
import { createMockStepSnapshot } from "./mockStepData.js";
import { readPersistedJson, writePersistedJson } from "../storage/persistedJson.js";

const StepDataContext = createContext(null);
const STEP_STORAGE_KEY = "life-online-step-data-v2";
const STEP_HISTORY_DAYS = 7;
const STEP_REFRESH_INTERVAL_MS = 30000;

function createDefaultShopState() {
  const ownedItemIdsByCategory = createDefaultOwnedItemIds();
  const selectedItemIdsByCategory = createDefaultSelectedItemIds();

  return {
    coinBalance: DEFAULT_SHOP_COIN_BALANCE,
    ownedItemIdsByCategory,
    selectedItemIdsByCategory,
    skinToneId: selectedItemIdsByCategory.skinTone,
  };
}

function createDefaultDeviceStepState() {
  return {
    history: [],
    lastSyncAt: null,
    pedometerAvailable: null,
    permissionStatus: "unknown",
    source: "device",
  };
}

function createDefaultTodayRecord(source = "device") {
  const date = formatDateKey(new Date());

  return {
    id: date,
    date,
    steps: 0,
    source,
  };
}

function normalizeDateKey(value, fallbackDate = new Date()) {
  const source = value instanceof Date ? value : new Date(value ?? fallbackDate);
  if (Number.isNaN(source.getTime())) {
    const fallback = new Date(fallbackDate);
    return formatDateKey(fallback);
  }

  return formatDateKey(source);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value ?? new Date());
  if (Number.isNaN(date.getTime())) {
    return startOfLocalDay(new Date());
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function normalizePermissionStatus(value) {
  const status = String(value ?? "").trim();
  if (status === "granted" || status === "denied" || status === "undetermined" || status === "unavailable") {
    return status;
  }

  return "unknown";
}

function normalizeStepRecord(value, fallbackDate = new Date(), fallbackSource = "device") {
  const date = normalizeDateKey(value?.date ?? value?.id ?? fallbackDate, fallbackDate);
  const steps = Math.max(0, Math.floor(Number(value?.steps ?? 0)));

  return {
    id: String(value?.id ?? date),
    date,
    steps,
    source: String(value?.source ?? fallbackSource),
  };
}

function normalizeStepHistory(value) {
  const byDate = new Map();

  for (const record of Array.isArray(value) ? value : []) {
    const normalized = normalizeStepRecord(record);
    byDate.set(normalized.date, normalized);
  }

  return [...byDate.values()]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, STEP_HISTORY_DAYS);
}

function normalizeShopState(value) {
  const defaultShopState = createDefaultShopState();
  const persistedOwned = value?.ownedItemIdsByCategory ?? {};
  const persistedSelected = value?.selectedItemIdsByCategory ?? {};
  const ownedItemIdsByCategory = {};
  const selectedItemIdsByCategory = {};

  for (const category of CUSTOMIZATION_CATEGORIES) {
    const categoryId = category.id;
    const defaultOwnedIds = defaultShopState.ownedItemIdsByCategory?.[categoryId] ?? [];
    const ownedIds = uniqueStrings([...(Array.isArray(persistedOwned?.[categoryId]) ? persistedOwned[categoryId] : []), ...defaultOwnedIds]);
    const selectedId = normalizeSelectedId(
      categoryId,
      ownedIds,
      persistedSelected?.[categoryId] ?? defaultShopState.selectedItemIdsByCategory?.[categoryId],
    );

    ownedItemIdsByCategory[categoryId] = ownedIds;
    selectedItemIdsByCategory[categoryId] = selectedId;
  }

  const skinToneId = selectedItemIdsByCategory.skinTone ?? defaultShopState.skinToneId ?? null;

  return {
    coinBalance: Math.max(0, Math.floor(Number(value?.coinBalance ?? defaultShopState.coinBalance))),
    ownedItemIdsByCategory,
    selectedItemIdsByCategory,
    skinToneId,
  };
}

function normalizeSelectedId(categoryId, ownedIds, fallbackSelectedId) {
  const selectedId = String(fallbackSelectedId ?? "").trim();
  if (categoryId === "skinTone" && selectedId) {
    return ownedIds.includes(selectedId) ? selectedId : ownedIds[0] ?? null;
  }

  return ownedIds.includes(selectedId) ? selectedId : ownedIds[0] ?? null;
}

function normalizeDeviceStepState(value) {
  const defaultState = createDefaultDeviceStepState();

  return {
    history: normalizeStepHistory(value?.history ?? defaultState.history),
    lastSyncAt: typeof value?.lastSyncAt === "string" ? value.lastSyncAt : defaultState.lastSyncAt,
    pedometerAvailable:
      typeof value?.pedometerAvailable === "boolean" ? value.pedometerAvailable : defaultState.pedometerAvailable,
    permissionStatus: normalizePermissionStatus(value?.permissionStatus),
    source: value?.source === "device" ? "device" : defaultState.source,
  };
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function mergeTodayIntoHistory(history, todayRecord) {
  const normalizedToday = normalizeStepRecord(todayRecord);
  const nextHistory = [normalizedToday, ...normalizeStepHistory(history).filter((record) => record.date !== normalizedToday.date)];
  return nextHistory.slice(0, STEP_HISTORY_DAYS);
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

async function readRecentStepHistory(days = STEP_HISTORY_DAYS) {
  const today = new Date();
  const history = await Promise.all(
    Array.from({ length: days }, async (_, index) => {
      const day = addDays(startOfLocalDay(today), -index);
      const dayEnd = addDays(day, 1);
      const steps = await readStepCountForRange(day, dayEnd);

      return normalizeStepRecord(
        {
          id: formatDateKey(day),
          date: formatDateKey(day),
          steps,
          source: index === 0 ? "device" : "device_history",
        },
        day,
        index === 0 ? "device" : "device_history",
      );
    }),
  );

  return normalizeStepHistory(history);
}

async function readTodayStepRecord() {
  const today = startOfLocalDay(new Date());
  const now = new Date();
  const steps = await readStepCountForRange(today, now);

  return normalizeStepRecord(
    {
      id: formatDateKey(today),
      date: formatDateKey(today),
      steps,
      source: "device",
    },
    today,
    "device",
  );
}

export function StepDataProvider({ children, mode = "mock", adminEnabled = false }) {
  const [mockState, setMockState] = useState(() => createMockStepSnapshot());
  const [adminVisible, setAdminVisible] = useState(false);
  const [shopState, setShopState] = useState(() => createDefaultShopState());
  const [claimedMissionRewardIds, setClaimedMissionRewardIds] = useState([]);
  const [deviceStepState, setDeviceStepState] = useState(() => createDefaultDeviceStepState());
  const [behaviorAdmin, setBehaviorAdmin] = useState(() => ({
    forcedEnergyLevel: null,
    forcedLongTermState: null,
    forcedSpecialActionKey: null,
  }));
  const [isReady, setIsReady] = useState(false);
  const syncInFlightRef = useRef(false);
  const syncQueuedRef = useRef(false);

  const isMockMode = mode === "mock";
  const isNativeStepMode = !isMockMode && Platform.OS !== "web";
  const history = isMockMode ? mockState.history : deviceStepState.history;
  const today =
    history[0] ?? {
      id: "today",
      date: new Date().toISOString().slice(0, 10),
      steps: 0,
      source: isMockMode ? "mock" : deviceStepState.source,
    };

  useEffect(() => {
    let cancelled = false;

    readPersistedJson(STEP_STORAGE_KEY, null)
      .then((value) => {
        if (cancelled) {
          return;
        }

        setShopState(normalizeShopState(value?.shopState));
        setClaimedMissionRewardIds(uniqueStrings(value?.claimedMissionRewardIds));
        setDeviceStepState(normalizeDeviceStepState(value?.deviceStepState));
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

    void writePersistedJson(STEP_STORAGE_KEY, {
      shopState,
      claimedMissionRewardIds,
      deviceStepState,
    });
  }, [claimedMissionRewardIds, deviceStepState, isReady, shopState]);

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
            history: current.history.length ? current.history : [createDefaultTodayRecord()],
            pedometerAvailable: false,
            permissionStatus: "unavailable",
            source: "device",
            lastSyncAt: new Date().toISOString(),
          }));
          return;
        }

        const permission = await ensurePedometerPermission(current.permissionStatus);
        if (cancelled) {
          return;
        }

        const permissionStatus = normalizePermissionStatus(permission?.status);
        if (!permission?.granted) {
          setDeviceStepState((current) => ({
            ...current,
            pedometerAvailable: true,
            permissionStatus,
            source: "device",
            lastSyncAt: new Date().toISOString(),
          }));
          return;
        }

        if (includeHistory) {
          const nextHistory = await readRecentStepHistory(STEP_HISTORY_DAYS);
          if (cancelled) {
            return;
          }

          setDeviceStepState((current) => ({
            ...current,
            history: nextHistory,
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
          history: mergeTodayIntoHistory(current.history.length ? current.history : [createDefaultTodayRecord()], todayRecord),
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
  }, [isNativeStepMode, isReady]);

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
      shop: {
        coinBalance: shopState.coinBalance,
        categories: CUSTOMIZATION_CATEGORIES,
        ownedItemIdsByCategory: shopState.ownedItemIdsByCategory,
        selectedItemIdsByCategory: shopState.selectedItemIdsByCategory,
        skinToneId: shopState.skinToneId,
        isOwnedItem: (categoryId, itemId) =>
          (shopState.ownedItemIdsByCategory?.[categoryId] ?? []).includes(itemId),
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
        source: today.source,
        ...behaviorAdmin,
        skinTones: CUSTOMIZATION_ITEMS.skinTone,
        skinToneId: shopState.skinToneId,
        setSkinTone: (nextSkinToneId) => {
          if (!adminEnabled) return;
          setShopState((current) => ({
            ...current,
            skinToneId: nextSkinToneId,
            selectedItemIdsByCategory: {
              ...current.selectedItemIdsByCategory,
              skinTone: nextSkinToneId,
            },
          }));
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
        setForcedSpecialActionKey: (nextKey) => {
          if (!adminEnabled) return;
          setBehaviorAdmin((current) => ({
            ...current,
            forcedSpecialActionKey: normalizeSpecialActionKey(nextKey),
          }));
        },
        resetBehavior: () => {
          if (!adminEnabled) return;
          setBehaviorAdmin({
            forcedEnergyLevel: null,
            forcedLongTermState: null,
            forcedSpecialActionKey: null,
          });
        },
        resetMock: () => {
          if (!adminEnabled || !isMockMode) return;
          setMockState(createMockStepSnapshot());
        },
      },
    }),
    [
      adminEnabled,
      adminVisible,
      behaviorAdmin,
      claimedMissionRewardIds,
      history,
      deviceStepState,
      isMockMode,
      isReady,
      mode,
      shopState,
      today,
    ],
  );

  return <StepDataContext.Provider value={value}>{children}</StepDataContext.Provider>;
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function normalizeSpecialActionKey(value) {
  if (value === null) return null;

  const key = String(value);
  if (key === "hipHopDancing") {
    return key;
  }

  return null;
}

export function useStepData() {
  const context = useContext(StepDataContext);

  if (!context) {
    throw new Error("useStepData must be used inside StepDataProvider");
  }

  return context;
}
