import { Platform } from "react-native";

const STORAGE_KEY = "life-online-auth-v1";

let memoryState = {
  accounts: [],
  sessionId: null,
};

function canUseLocalStorage() {
  return Platform.OS === "web" && typeof window !== "undefined" && window.localStorage;
}

function normalizeState(value) {
  return {
    accounts: Array.isArray(value?.accounts) ? value.accounts : [],
    sessionId: value?.sessionId ?? null,
  };
}

export function loadAuthState() {
  if (!canUseLocalStorage()) {
    return normalizeState(memoryState);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeState(memoryState);
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState(memoryState);
  }
}

export function saveAuthState(nextState) {
  const normalized = normalizeState(nextState);
  memoryState = normalized;

  if (!canUseLocalStorage()) {
    return normalized;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    return normalized;
  }

  return normalized;
}

export function createLocalAccount({ handle, nickname }) {
  const current = loadAuthState();
  const normalizedHandle = String(handle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  const normalizedNickname = String(nickname ?? "").trim();

  if (!normalizedHandle || !normalizedNickname) {
    throw new Error("invalid_profile");
  }

  if (current.accounts.some((account) => account.handle === normalizedHandle)) {
    throw new Error("handle_taken");
  }

  const account = {
    id: `account-${Date.now()}`,
    handle: normalizedHandle,
    nickname: normalizedNickname,
    createdAt: new Date().toISOString(),
  };

  return saveAuthState({
    accounts: [account, ...current.accounts],
    sessionId: account.id,
  });
}

export function loginWithHandle(handle) {
  const current = loadAuthState();
  const normalizedHandle = String(handle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const account = current.accounts.find((item) => item.handle === normalizedHandle);
  if (!account) {
    throw new Error("account_not_found");
  }

  return saveAuthState({
    ...current,
    sessionId: account.id,
  });
}

export function logoutLocalAccount() {
  const current = loadAuthState();
  return saveAuthState({
    ...current,
    sessionId: null,
  });
}
