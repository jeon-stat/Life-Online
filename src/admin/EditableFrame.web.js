import { useMemo, useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function EditableFrame({
  id,
  label,
  enabled,
  selected,
  layout,
  onSelect,
  onChange,
  children,
}) {
  const dragStartRef = useRef(layout);
  const resizeStartRef = useRef(layout);

  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: (_, gestureState) => enabled && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2),
        onPanResponderGrant: () => {
          dragStartRef.current = layout;
          onSelect?.(id);
        },
        onPanResponderMove: (_, gestureState) => {
          onChange?.(id, {
            x: dragStartRef.current.x + gestureState.dx,
            y: dragStartRef.current.y + gestureState.dy,
          });
        },
      }),
    [enabled, id, layout, onChange, onSelect],
  );

  const resizeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: () => {
          resizeStartRef.current = layout;
          onSelect?.(id);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextScale = Math.max(0.5, Math.min(1.8, resizeStartRef.current.scale + gestureState.dx * 0.003));
          onChange?.(id, { scale: Number(nextScale.toFixed(3)) });
        },
      }),
    [enabled, id, layout, onChange, onSelect],
  );

  function handleWheel(event) {
    if (!enabled || !selected) return;
    event.preventDefault?.();
    const nextScale = Math.max(0.5, Math.min(1.8, layout.scale + (event.deltaY < 0 ? 0.04 : -0.04)));
    onChange?.(id, { scale: Number(nextScale.toFixed(3)) });
  }

  return (
    <View
      onWheel={handleWheel}
      style={[
        styles.shell,
        {
          transform: [{ translateX: layout.x ?? 0 }, { translateY: layout.y ?? 0 }, { scale: layout.scale ?? 1 }],
        },
      ]}
    >
      <Pressable onPress={() => onSelect?.(id)} style={[styles.frame, selected && styles.frameSelected]}>
        {children}
      </Pressable>

      {enabled ? (
        <>
          <View style={[styles.badge, selected && styles.badgeSelected]} {...moveResponder.panHandlers}>
            <Text style={styles.badgeText}>{label}</Text>
          </View>
          <View style={[styles.handle, selected && styles.handleSelected]} {...resizeResponder.panHandlers} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
  },
  frame: {
    borderWidth: 1,
    borderColor: "transparent",
    borderStyle: "dashed",
    borderRadius: theme.radius.lg,
  },
  frameSelected: {
    borderColor: "#f6b879",
    boxShadow: "0 0 0 2px rgba(246, 184, 121, 0.24)",
  },
  badge: {
    position: "absolute",
    top: -12,
    left: 12,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(36,50,71,0.88)",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  },
  badgeSelected: {
    backgroundColor: "rgba(246,184,121,0.95)",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  handle: {
    position: "absolute",
    right: 10,
    bottom: 10,
    zIndex: 10,
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "rgba(36,50,71,0.9)",
    borderWidth: 2,
    borderColor: "#ffffff",
    cursor: "nwse-resize",
    touchAction: "none",
    userSelect: "none",
  },
  handleSelected: {
    backgroundColor: "rgba(246,184,121,0.95)",
  },
});
