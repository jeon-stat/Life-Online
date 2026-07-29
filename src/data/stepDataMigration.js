import {
  CUSTOMIZATION_CATEGORIES,
  DEFAULT_SHOP_COIN_BALANCE,
  createDefaultOwnedItemIds,
  createDefaultSelectedItemIds,
} from "./customizationCatalog.js";
import { createDefaultGrowthState, normalizeGrowthState, requiredPoints } from "../game/progression.js";
import { DEFAULT_STEP_GOAL } from "../game/stepRules.js";
import { formatDateKey, normalizeDateKey, uniqueDateRecords } from "../game/dateUtils.js";

export const STEP_STORAGE_KEY = "life-online-step-data-v2";
export const STORAGE_VERSION = 3;
export const HISTORY_RETENTION_DAYS = 365;

export function createDefaultShopState() {
  const ownedItemIdsByCategory = createDefaultOwnedItemIds();
  const selectedItemIdsByCategory = createDefaultSelectedItemIds();

  return {
    coinBalance: DEFAULT_SHOP_COIN_BALANCE,
    ownedItemIdsByCategory,
    selectedItemIdsByCategory,
    skinToneId: selectedItemIdsByCategory.skinTone,
  };
}

export function createDefaultDeviceStepState() {
  return {
    history: [],
    lastSyncAt: null,
    pedometerAvailable: null,
    permissionStatus: "unknown",
    source: "device",
  };
}

export function createDefaultStepRecord(date = new Date(), source = "device", hasData = false) {
  const dateKey = formatDateKey(date);

  return {
    id: dateKey,
    date: dateKey,
    steps: 0,
    source,
    hasData,
    hourlySteps: null,
  };
}

export function migratePersistedStepData(value) {
  if (value?.version === STORAGE_VERSION && value?.growthState) {
    return normalizePersistedStepData(value);
  }

  const shopState = normalizeShopState(value?.shopState);
  const claimedMissionRewardIds = uniqueStrings(value?.claimedMissionRewardIds);
  const deviceStepState = normalizeDeviceStepState(value?.deviceStepState);
  const growthState = migrateLegacyGrowthState({
    growthState: value?.growthState,
    history: deviceStepState.history,
  });

  return normalizePersistedStepData({
    version: STORAGE_VERSION,
    shopState,
    claimedMissionRewardIds,
    deviceStepState,
    growthState,
  });
}

export function normalizePersistedStepData(value) {
  return {
    version: STORAGE_VERSION,
    shopState: normalizeShopState(value?.shopState),
    claimedMissionRewardIds: uniqueStrings(value?.claimedMissionRewardIds),
    deviceStepState: normalizeDeviceStepState(value?.deviceStepState),
    growthState: normalizeGrowthState(value?.growthState),
  };
}

export function normalizeShopState(value) {
  const defaultShopState = createDefaultShopState();
  const persistedOwned = value?.ownedItemIdsByCategory ?? {};
  const persistedSelected = value?.selectedItemIdsByCategory ?? {};
  const ownedItemIdsByCategory = {};
  const selectedItemIdsByCategory = {};

  for (const category of CUSTOMIZATION_CATEGORIES) {
    const categoryId = category.id;
    const defaultOwnedIds = defaultShopState.ownedItemIdsByCategory?.[categoryId] ?? [];
    const ownedIds = uniqueStrings([
      ...(Array.isArray(persistedOwned?.[categoryId]) ? persistedOwned[categoryId] : []),
      ...defaultOwnedIds,
    ]);
    const selectedId = normalizeSelectedId(
      categoryId,
      ownedIds,
      persistedSelected?.[categoryId] ?? defaultShopState.selectedItemIdsByCategory?.[categoryId],
    );

    ownedItemIdsByCategory[categoryId] = ownedIds;
    selectedItemIdsByCategory[categoryId] = selectedId;
  }

  return {
    coinBalance: Math.max(0, Math.floor(Number(value?.coinBalance ?? defaultShopState.coinBalance))),
    ownedItemIdsByCategory,
    selectedItemIdsByCategory,
    skinToneId: selectedItemIdsByCategory.skinTone ?? defaultShopState.skinToneId ?? null,
  };
}

export function normalizeDeviceStepState(value) {
  const defaultState = createDefaultDeviceStepState();

  return {
    history: normalizeStepHistory(value?.history ?? defaultState.history),
    lastSyncAt: typeof value?.lastSyncAt === "string" ? value.lastSyncAt : defaultState.lastSyncAt,
    pedometerAvailable:
      typeof value?.pedometerAvailable === "boolean" ? value.pedometerAvailable : defaultState.pedometerAvailable,
    permissionStatus: normalizePermissionStatus(value?.permissionStatus),
    source: value?.source === "mock" ? "mock" : defaultState.source,
  };
}

export function normalizeStepRecord(value, fallbackDate = new Date(), fallbackSource = "device") {
  const date = normalizeDateKey(value?.date ?? value?.id ?? fallbackDate, fallbackDate);
  return {
    id: String(value?.id ?? date),
    date,
    steps: Math.max(0, Math.floor(Number(value?.steps ?? 0))),
    source: String(value?.source ?? fallbackSource),
    hasData: value?.hasData !== false,
    hourlySteps: normalizeHourlySteps(value?.hourlySteps),
  };
}

export function normalizeStepHistory(value) {
  return uniqueDateRecords(
    (Array.isArray(value) ? value : []).map((record) => normalizeStepRecord(record)),
  ).slice(0, HISTORY_RETENTION_DAYS);
}

export function mergeStepHistory(history = [], incomingRecords = []) {
  return normalizeStepHistory([...(Array.isArray(incomingRecords) ? incomingRecords : []), ...(Array.isArray(history) ? history : [])]);
}

function normalizeSelectedId(categoryId, ownedIds, fallbackSelectedId) {
  const selectedId = String(fallbackSelectedId ?? "").trim();
  if (categoryId === "skinTone" && selectedId) {
    return ownedIds.includes(selectedId) ? selectedId : ownedIds[0] ?? null;
  }

  return ownedIds.includes(selectedId) ? selectedId : ownedIds[0] ?? null;
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function normalizePermissionStatus(value) {
  const status = String(value ?? "").trim();
  if (status === "granted" || status === "denied" || status === "undetermined" || status === "unavailable") {
    return status;
  }

  return "unknown";
}

function normalizeHourlySteps(value) {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.map((step) => Math.max(0, Math.floor(Number(step ?? 0))));
}

function migrateLegacyGrowthState({ growthState, history = [] }) {
  if (growthState) {
    return normalizeGrowthState(growthState);
  }

  const defaults = createDefaultGrowthState();
  const legacy = getLegacyProgressSnapshot(history);

  return {
    ...defaults,
    currentLevel: legacy.level,
    growthPoints: legacy.points,
    highestLevelReached: legacy.level,
    unlockedRewardIds: [],
  };
}

function getLegacyProgressSnapshot(history = []) {
  let totalXp = 0;

  for (const record of Array.isArray(history) ? history : []) {
    const ratio = (record?.steps ?? 0) / DEFAULT_STEP_GOAL;

    if (ratio >= 1.2) {
      totalXp += 30;
    } else if (ratio >= 1) {
      totalXp += 25;
    } else if (ratio >= 0.7) {
      totalXp += 14;
    } else if (ratio >= 0.3) {
      totalXp += 6;
    }
  }

  const approximateLevel = Math.max(1, Math.min(20, Math.floor(totalXp / 100) + 1));
  const xpIntoLevel = totalXp % 100;
  const needed = requiredPoints(approximateLevel);
  const approximatePoints = Math.max(0, Math.min(needed - 1, Math.round((xpIntoLevel / 100) * needed)));

  return {
    totalXp,
    level: approximateLevel,
    points: approximatePoints,
  };
}
