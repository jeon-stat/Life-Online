import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3 } from "three";

import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { getRotationFromDrag } from "../scene/rotationMath.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

const MINI_WORLD_THEME = {
  grass: "#9acb7c",
  grassShade: "#7daf64",
  path: "#e7d2ad",
  pathEdge: "#cfb287",
};

const MINI_WORLD_LAYOUT = {
  radius: 4.48,
  centerY: -4.46,
  pathInset: 0.26,
  pathLift: 0.04,
  basePhi: 0.46,
  anchorTheta: -Math.PI / 2,
};

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
    <View style={styles.shell}>
      <View style={styles.glowBack} />
      <View style={styles.effectWrap} pointerEvents="none">
        <StageEffect effect={state.effect} />
      </View>
      <StageCanvas>
        <AnimatedCharacter
          character={character}
          rotation={rotation}
          state={state}
        />
      </StageCanvas>
      <View style={styles.gestureHotspot} {...panResponder.panHandlers} />
    </View>
  );
}

function AnimatedCharacter({ character, rotation, state }) {
  const rootRef = useRef(null);

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime() * state.animationSpeed;
    const bobAmount =
      state.animationState === "walk" || state.animationState === "run"
        ? state.bobAmount * 0.12
        : state.bobAmount * 0.08;

    rootRef.current.rotation.x = rotation.x;
    rootRef.current.rotation.y = rotation.y;
    rootRef.current.position.y = STAGE_LAYOUT.modelBaseY + Math.sin(t * 1.2) * bobAmount;
    const scalePulse = 1 + Math.sin(t * 0.7) * 0.015;
    rootRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  return (
    <group ref={rootRef} position={[0, STAGE_LAYOUT.modelBaseY, 0]}>
      <MiniWorld
        motionState={state.animationState}
        animationSpeed={state.animationSpeed}
      />
      <GLBCharacterModel
        character={character}
        animationState={state.animationState}
      />
    </group>
  );
}

function MiniWorld({ motionState, animationSpeed }) {
  const worldRef = useRef(null);
  const { anchorPoint, pathCurve } = useMemo(() => buildPathCurve(), []);

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    worldRef.current.rotation.y -= getWorldRotationSpeed(motionState, animationSpeed) * delta;
  });

  return (
    <group position={[0, -anchorPoint.y, -anchorPoint.z]}>
      <group ref={worldRef}>
        <mesh position={[0, MINI_WORLD_LAYOUT.centerY, 0]}>
          <sphereGeometry
            args={[
              MINI_WORLD_LAYOUT.radius,
              56,
              36,
              0,
              Math.PI * 2,
              0,
              Math.PI * 0.48,
            ]}
          />
          <meshStandardMaterial color={MINI_WORLD_THEME.grass} />
        </mesh>
        <mesh position={[0, -0.018, 0]} renderOrder={0}>
          <tubeGeometry args={[pathCurve, 180, 0.24, 16, true]} />
          <meshStandardMaterial color={MINI_WORLD_THEME.pathEdge} />
        </mesh>
        <mesh renderOrder={1}>
          <tubeGeometry args={[pathCurve, 180, 0.17, 16, true]} />
          <meshStandardMaterial color={MINI_WORLD_THEME.path} />
        </mesh>
      </group>
    </group>
  );
}

function buildPathCurve() {
  const points = [];
  const totalSteps = 32;

  for (let step = 0; step < totalSteps; step += 1) {
    const theta =
      MINI_WORLD_LAYOUT.anchorTheta + (step / totalSteps) * Math.PI * 2;
    points.push(getPathPoint(theta));
  }

  return {
    anchorPoint: getPathPoint(MINI_WORLD_LAYOUT.anchorTheta),
    pathCurve: new CatmullRomCurve3(points, true, "catmullrom", 0.5),
  };
}

function getPathPoint(theta) {
  const surfaceRadius = MINI_WORLD_LAYOUT.radius - MINI_WORLD_LAYOUT.pathInset;
  const phi =
    MINI_WORLD_LAYOUT.basePhi +
    Math.sin(theta * 2) * 0.04 +
    Math.cos(theta * 3) * 0.015;
  const x = Math.sin(phi) * Math.cos(theta) * surfaceRadius;
  const z = Math.sin(phi) * Math.sin(theta) * surfaceRadius;
  const y =
    MINI_WORLD_LAYOUT.centerY +
    Math.cos(phi) * surfaceRadius +
    MINI_WORLD_LAYOUT.pathLift;

  return new Vector3(x, y, z);
}

function getWorldRotationSpeed(motionState, animationSpeed = 1) {
  switch (motionState) {
    case "run":
      return 0.34 * animationSpeed;
    case "walk":
      return 0.22 * animationSpeed;
    case "tired":
      return 0.002 * animationSpeed;
    case "idle":
    default:
      return 0.008 * animationSpeed;
  }
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
    height: STAGE_LAYOUT.heroHeight,
    position: "relative",
    backgroundColor: "transparent",
  },
  glowBack: {
    position: "absolute",
    top: 18,
    left: "50%",
    marginLeft: -112,
    width: 224,
    height: 224,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  effectWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  gestureHotspot: {
    position: "absolute",
    left: "50%",
    top: 6,
    width: 252,
    height: STAGE_LAYOUT.heroHeight - 16,
    marginLeft: -126,
    backgroundColor: "transparent",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
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
