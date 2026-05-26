import { DEFAULT_LAYOUT_CONFIG, mergeLayoutConfig } from "./layoutDefaults.js";
import { loadLocalLayoutFallback } from "./layoutConfigSaver.js";

function getBasePath() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.pathname.includes("/Life-Online") ? "/Life-Online" : "";
}

export function getLayoutConfigUrl() {
  return `${getBasePath()}/config/layout-config.json`;
}

export async function loadLayoutConfig() {
  const localFallback = loadLocalLayoutFallback();

  if (typeof fetch === "undefined") {
    return mergeLayoutConfig(DEFAULT_LAYOUT_CONFIG, localFallback);
  }

  try {
    const response = await fetch(getLayoutConfigUrl(), { cache: "no-store" });
    if (!response.ok) {
      return mergeLayoutConfig(DEFAULT_LAYOUT_CONFIG, localFallback);
    }

    const remoteConfig = await response.json();
    return mergeLayoutConfig(
      mergeLayoutConfig(DEFAULT_LAYOUT_CONFIG, remoteConfig),
      localFallback,
    );
  } catch {
    return mergeLayoutConfig(DEFAULT_LAYOUT_CONFIG, localFallback);
  }
}
