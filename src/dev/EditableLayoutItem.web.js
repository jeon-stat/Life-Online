import { useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

const STORAGE_KEY = "life-online-dev-layout-v1";

function loadLayouts() {
  if (typeof window === "undefined" || !window.localStorage) {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveLayouts(nextLayouts) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayouts));
}

export function EditableLayoutItem({ id, enabled, defaultLayout, label, children }) {
  const loaded = useMemo(() => loadLayouts(), []);
  const [layout, setLayout] = useState(() => ({
    x: loaded[id]?.x ?? defaultLayout?.x ?? 0,
    y: loaded[id]?.y ?? defaultLayout?.y ?? 0,
    scale: loaded[id]?.scale ?? defaultLayout?.scale ?? 1,
  }));

  const dragStartRef = useRef(layout);
  const resizeStartRef = useRef(layout);

  function persist(nextLayout) {
    const nextLayouts = {
      ...loadLayouts(),
      [id]: nextLayout,
    };
    saveLayouts(nextLayouts);
  }

  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: () => {
          dragStartRef.current = layout;
        },
        onPanResponderMove: (_, gestureState) => {
          setLayout({
            ...dragStartRef.current,
            x: dragStartRef.current.x + gestureState.dx,
            y: dragStartRef.current.y + gestureState.dy,
          });
        },
        onPanResponderRelease: () => {
          persist(layout);
        },
      }),
    [enabled, layout],
  );

  const resizeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: () => {
          resizeStartRef.current = layout;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextScale = Math.max(0.72, Math.min(1.4, resizeStartRef.current.scale + gestureState.dx * 0.0035));
          setLayout({
            ...resizeStartRef.current,
            scale: Number(nextScale.toFixed(3)),
          });
        },
        onPanResponderRelease: () => {
          persist(layout);
        },
      }),
    [enabled, layout],
  );

  function handleReset() {
    const nextLayout = {
      x: defaultLayout?.x ?? 0,
      y: defaultLayout?.y ?? 0,
      scale: defaultLayout?.scale ?? 1,
    };
    setLayout(nextLayout);
    persist(nextLayout);
  }

  return (
    <View
      style={[
        styles.shell,
        {
          transform: [{ translateX: layout.x }, { translateY: layout.y }, { scale: layout.scale }],
        },
      ]}
    >
      {enabled ? (
        <>
          <View style={styles.moveHandle} {...moveResponder.panHandlers}>
            <Text style={styles.handleText}>{label ?? id}</Text>
          </View>
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>리셋</Text>
          </Pressable>
          <View style={styles.resizeHandle} {...resizeResponder.panHandlers} />
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
  },
  moveHandle: {
    position: "absolute",
    top: -10,
    left: 12,
    zIndex: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(36, 50, 71, 0.88)",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  },
  handleText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  resetButton: {
    position: "absolute",
    top: -10,
    right: 14,
    zIndex: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetText: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "900",
  },
  resizeHandle: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 8,
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "rgba(246, 184, 121, 0.95)",
    borderWidth: 1,
    borderColor: "#ffffff",
    cursor: "nwse-resize",
    touchAction: "none",
    userSelect: "none",
  },
});
