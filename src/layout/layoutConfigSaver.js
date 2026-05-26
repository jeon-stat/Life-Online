import { DEFAULT_LAYOUT_CONFIG, mergeLayoutConfig } from "./layoutDefaults.js";

export const LOCAL_LAYOUT_KEY = "lifeOnline.layoutConfig.local";
export const GITHUB_TOKEN_KEY = "lifeOnline.githubToken";

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadLocalLayoutFallback() {
  if (!canUseLocalStorage()) {
    return DEFAULT_LAYOUT_CONFIG;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_LAYOUT_KEY);
    if (!raw) return DEFAULT_LAYOUT_CONFIG;
    return mergeLayoutConfig(DEFAULT_LAYOUT_CONFIG, JSON.parse(raw));
  } catch {
    return DEFAULT_LAYOUT_CONFIG;
  }
}

export function saveLocalLayoutFallback(layoutConfig) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_LAYOUT_KEY, JSON.stringify(layoutConfig));
}

export function loadGitHubToken() {
  if (!canUseLocalStorage()) {
    return "";
  }

  return window.localStorage.getItem(GITHUB_TOKEN_KEY) ?? "";
}

export function saveGitHubToken(token) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(GITHUB_TOKEN_KEY, token);
}
