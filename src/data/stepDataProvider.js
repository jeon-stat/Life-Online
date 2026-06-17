import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
const STEP_STORAGE_KEY = "life-online-step-data-v1";

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

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
}

function normalizeOwnedIds(defaultIds, persistedIds) {
  return uniqueStrings([...(Array.isArray(persistedIds) ? persistedIds : []), ...defaultIds]);
}

function normalizeSelectedId(categoryId, ownedIds, fallbackSelectedId) {
  const selectedId = String(fallbackSelectedId ?? "").trim();
  if (categoryId === "skinTone" && selectedId) {
    return ownedIds.includes(selectedId) ? selectedId : ownedIds[0] ?? null;
  }

  return ownedIds.includes(selectedId) ? selectedId : ownedIds[0] ?? null;
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
    const ownedIds = normalizeOwnedIds(defaultOwnedIds, persistedOwned?.[categoryId]);
    const selectedId = normalizeSelectedId(categoryId, ownedIds, persistedSelected?.[categoryId] ?? defaultShopState.selectedItemIdsByCategory?.[categoryId]);

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

function normalizeClaimedMissionRewardIds(value) {
  return uniqueStrings(value);
}

export function StepDataProvider({ children, mode = "mock", adminEnabled = false }) {
  const [mockState, setMockState] = useState(() => createMockStepSnapshot());
  const [adminVisible, setAdminVisible] = useState(false);
  const [shopState, setShopState] = useState(() => createDefaultShopState());
  const [claimedMissionRewardIds, setClaimedMissionRewardIds] = useState([]);
  const [behaviorAdmin, setBehaviorAdmin] = useState(() => ({
    forcedEnergyLevel: null,
    forcedLongTermState: null,
    forcedSpecialActionKey: null,
  }));
  const [isReady, setIsReady] = useState(false);
  const isMockMode = mode === "mock";
  const history = isMockMode ? mockState.history : [];
  const today = history[0] ?? {
    id: "today",
    date: new Date().toISOString().slice(0, 10),
    steps: 0,
    source: isMockMode ? "mock" : "device",
  };

  useEffect(() => {
    let cancelled = false;

    readPersistedJson(STEP_STORAGE_KEY, null)
      .then((value) => {
        if (cancelled) {
          return;
        }

        setShopState(normalizeShopState(value?.shopState));
        setClaimedMissionRewardIds(normalizeClaimedMissionRewardIds(value?.claimedMissionRewardIds));
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
    });
  }, [claimedMissionRewardIds, isReady, shopState]);

  const value = useMemo(
    () => ({
      mode,
      isReady,
      goal: DEFAULT_STEP_GOAL,
      today,
      history,
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
      isMockMode,
      mode,
      shopState,
      today,
      isReady,
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
