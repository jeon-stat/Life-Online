import { useEffect, useMemo, useState } from "react";

import { saveLayoutConfigToGitHub } from "./githubLayoutSync.js";
import { loadLayoutConfig } from "../layout/layoutConfigLoader.js";
import {
  loadGitHubToken,
  loadLocalLayoutFallback,
  saveGitHubToken,
  saveLocalLayoutFallback,
} from "../layout/layoutConfigSaver.js";
import { DEFAULT_LAYOUT_CONFIG } from "../layout/layoutDefaults.js";

export function useDragLayoutEditor({ enabled }) {
  const [layoutConfig, setLayoutConfig] = useState(() => loadLocalLayoutFallback());
  const [selectedId, setSelectedId] = useState("stage");
  const [token, setTokenState] = useState(() => loadGitHubToken());
  const [status, setStatus] = useState({ tone: "idle", message: "" });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const loaded = await loadLayoutConfig();
      if (!active) return;
      setLayoutConfig(loaded);
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  function setToken(nextToken) {
    setTokenState(nextToken);
    saveGitHubToken(nextToken);
  }

  function updateItem(id, patch) {
    setLayoutConfig((current) => {
      const next = {
        ...current,
        [id]: {
          ...(current[id] ?? {}),
          ...patch,
        },
      };

      saveLocalLayoutFallback(next);
      return next;
    });
  }

  function resetSelected() {
    if (!selectedId) return;
    updateItem(selectedId, DEFAULT_LAYOUT_CONFIG[selectedId] ?? {});
  }

  function resetAll() {
    saveLocalLayoutFallback(DEFAULT_LAYOUT_CONFIG);
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
    setStatus({ tone: "idle", message: "전체 레이아웃을 기본값으로 돌렸어요." });
  }

  async function saveToGitHub() {
    if (!enabled) return;
    if (!token) {
      setStatus({ tone: "error", message: "GitHub token을 먼저 입력해 주세요." });
      return;
    }

    try {
      const content = `${JSON.stringify(layoutConfig, null, 2)}\n`;
      await saveLayoutConfigToGitHub({ token, content });
      saveLocalLayoutFallback(layoutConfig);
      setStatus({ tone: "success", message: "저장 완료. GitHub Pages 반영까지 잠시만 기다려 주세요." });
    } catch {
      saveLocalLayoutFallback(layoutConfig);
      setStatus({ tone: "error", message: "GitHub 저장은 실패했지만 브라우저에는 로컬로 저장했어요." });
    }
  }

  return useMemo(
    () => ({
      enabled,
      layoutConfig,
      selectedId,
      setSelectedId,
      updateItem,
      resetSelected,
      resetAll,
      token,
      setToken,
      saveToGitHub,
      status,
      saveDisabled: !enabled || !token,
    }),
    [enabled, layoutConfig, selectedId, status, token],
  );
}
