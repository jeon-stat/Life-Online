import { readPersistedJson, writePersistedJson } from "../storage/persistedJson.js";

const STORAGE_KEY = "life-online-auth-v1";

let memoryState = {
  accounts: [],
  sessionId: null,
};

export function normalizeAuthState(value) {
  return {
    accounts: Array.isArray(value?.accounts) ? value.accounts : [],
    sessionId: value?.sessionId ?? null,
  };
}

export async function loadAuthState() {
  const nextState = normalizeAuthState(await readPersistedJson(STORAGE_KEY, memoryState));
  memoryState = nextState;
  return nextState;
}

export async function saveAuthState(nextState) {
  const normalized = normalizeAuthState(nextState);
  memoryState = normalized;
  await writePersistedJson(STORAGE_KEY, normalized);
  return normalized;
}

export function createLocalAccount(currentState, { handle, nickname }) {
  const normalizedHandle = String(handle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  const normalizedNickname = String(nickname ?? "").trim();
  const current = normalizeAuthState(currentState);

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

  return normalizeAuthState({
    accounts: [account, ...current.accounts],
    sessionId: account.id,
  });
}

export function loginWithHandle(currentState, handle) {
  const current = normalizeAuthState(currentState);
  const normalizedHandle = String(handle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const account = current.accounts.find((item) => item.handle === normalizedHandle);
  if (!account) {
    throw new Error("account_not_found");
  }

  return normalizeAuthState({
    ...current,
    sessionId: account.id,
  });
}

export function logoutLocalAccount(currentState) {
  const current = normalizeAuthState(currentState);
  return normalizeAuthState({
    ...current,
    sessionId: null,
  });
}
