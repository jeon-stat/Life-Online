import { Suspense, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { useFrame } from "@react-three/fiber";

import { theme } from "../constants/theme.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { getRotationFromDrag } from "../scene/rotationMath.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

export function CharacterStage({ character, state, onInteractionChange }) {
  const [rotation, setRotation] = useState(STAGE_LAYOUT.defaultRotation);
  const rotationRef = useRef(STAGE_LAYOUT.defaultRotation);
  const dragStartRef = useRef(STAGE_LAYOUT.defaultRotation);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          dragStartRef.current = rotationRef.current;
          onInteractionChange?.(true);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextRotation = getRotationFromDrag(
            dragStartRef.current,
            gestureState,
            STAGE_LAYOUT.rotationLimit,
          );

          rotationRef.current = nextRotation;
          setRotation(nextRotation);
        },
        onPanResponderRelease: () => {
          onInteractionChange?.(false);
        },
        onPanResponderTerminate: () => {
          onInteractionChange?.(false);
        },
      }),
    [onInteractionChange],
  );

  return (
    <View style={[styles.shell, { backgroundColor: state.stageColor }]}>
      <View style={styles.glowBack} />
      <View style={styles.effectWrap} pointerEvents="none">
        <StageEffect effect={state.effect} />
      </View>
      <StageCanvas>
        <AnimatedCharacter character={character} rotation={rotation} state={state} />
      </StageCanvas>
      <View style={styles.gestureHotspot} {...panResponder.panHandlers} />
      <View style={styles.statusChip}>
        <Text style={styles.statusChipText}>{state.statusLabel}</Text>
      </View>
    </View>
  );
}

function AnimatedCharacter({ character, rotation, state }) {
  const rootRef = useRef(null);

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime() * state.animationSpeed;
    rootRef.current.rotation.x = rotation.x;
    rootRef.current.rotation.y = rotation.y;
    rootRef.current.position.y = Math.sin(t * 1.2) * state.bobAmount;
    const scalePulse = 1 + Math.sin(t * 0.7) * 0.015;
    rootRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  return (
    <group ref={rootRef} position={[0, 0.02, 0]}>
      <GLBCharacterModel character={character} />
    </group>
  );
}

function StageEffect({ effect }) {
  if (effect === "sparkle") {
    return (
      <>
        <View style={[styles.spark, styles.sparkOne]} />
        <View style={[styles.spark, styles.sparkTwo]} />
        <View style={[styles.spark, styles.sparkThree]} />
      </>
    );
  }

  if (effect === "sleepy") {
    return (
      <>
        <View style={[styles.orb, styles.orbOne]} />
        <View style={[styles.orb, styles.orbTwo]} />
      </>
    );
  }

  return (
    <>
      <View style={[styles.dot, styles.dotOne]} />
      <View style={[styles.dot, styles.dotTwo]} />
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 340,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    position: "relative",
  },
  glowBack: {
    position: "absolute",
    top: 34,
    left: "50%",
    marginLeft: -92,
    width: 184,
    height: 184,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  effectWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  gestureHotspot: {
    position: "absolute",
    left: "50%",
    top: 16,
    width: 280,
    height: 300,
    marginLeft: -140,
    backgroundColor: "transparent",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  },
  statusChip: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  statusChipText: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  spark: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#ffd27b",
  },
  sparkOne: {
    top: 42,
    left: 44,
  },
  sparkTwo: {
    top: 88,
    right: 52,
  },
  sparkThree: {
    top: 156,
    left: 66,
  },
  orb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  orbOne: {
    top: 56,
    right: 42,
  },
  orbTwo: {
    top: 96,
    right: 22,
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  dotOne: {
    top: 76,
    left: 36,
  },
  dotTwo: {
    top: 126,
    right: 34,
  },
});
