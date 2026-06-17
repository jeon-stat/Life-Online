import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function canUseWebStorage() {
  return Platform.OS === "web" && typeof window !== "undefined" && Boolean(window.localStorage);
}

export async function readPersistedJson(key, fallbackValue) {
  if (canUseWebStorage()) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return fallbackValue;
      }

      return JSON.parse(raw);
    } catch {
      return fallbackValue;
    }
  }

  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }

    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

export async function writePersistedJson(key, value) {
  const raw = JSON.stringify(value);

  if (canUseWebStorage()) {
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // Ignore persistence failures and keep the in-memory state alive.
    }

    return value;
  }

  try {
    await AsyncStorage.setItem(key, raw);
  } catch {
    // Ignore persistence failures and keep the in-memory state alive.
  }

  return value;
}
