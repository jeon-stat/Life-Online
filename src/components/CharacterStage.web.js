import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";

import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { getRotationFromDrag } from "../scene/rotationMath.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

const MINI_WORLD_THEME = {
  grass: "#9acb7c",
  path: "#b9782f",
  pathEdge: "#8e5c26",
};

const MINI_WORLD_LAYOUT = {
  radius: 8.4,
  centerOffsetY: -8.4,
  characterScale: 0.6,
  sphereThetaLength: Math.PI,
  pathHalfWidth: 1.75,
  pathEdgeHalfWidth: 2.15,
  pathLift: 0.24,
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
      <group scale={MINI_WORLD_LAYOUT.characterScale}>
        <GLBCharacterModel
          character={character}
          animationState={state.animationState}
        />
      </group>
    </group>
  );
}

function MiniWorld({ motionState, animationSpeed }) {
  const worldRef = useRef(null);
  const pathGeometry = useMemo(
    () =>
      buildGreatCircleBandGeometry(
        MINI_WORLD_LAYOUT.radius,
        MINI_WORLD_LAYOUT.pathHalfWidth,
        MINI_WORLD_LAYOUT.pathLift,
      ),
    [],
  );
  const pathEdgeGeometry = useMemo(
    () =>
      buildGreatCircleBandGeometry(
        MINI_WORLD_LAYOUT.radius,
        MINI_WORLD_LAYOUT.pathEdgeHalfWidth,
        MINI_WORLD_LAYOUT.pathLift * 0.5,
      ),
    [],
  );

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    worldRef.current.rotation.x -= getWorldRotationSpeed(motionState, animationSpeed) * delta;
  });

  return (
    <group position={[0, MINI_WORLD_LAYOUT.centerOffsetY, 0]}>
      <group ref={worldRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry
            args={[
              MINI_WORLD_LAYOUT.radius,
              64,
              42,
              0,
              Math.PI * 2,
              0,
              MINI_WORLD_LAYOUT.sphereThetaLength,
            ]}
          />
          <meshStandardMaterial color={MINI_WORLD_THEME.grass} />
        </mesh>
        <mesh geometry={pathEdgeGeometry} renderOrder={1}>
          <meshStandardMaterial color={MINI_WORLD_THEME.pathEdge} side={DoubleSide} />
        </mesh>
        <mesh geometry={pathGeometry} renderOrder={2}>
          <meshStandardMaterial color={MINI_WORLD_THEME.path} side={DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function buildGreatCircleBandGeometry(radius, halfWidth, lift = 0) {
  const geometry = new BufferGeometry();
  const positions = [];
  const indices = [];
  const segments = 128;

  for (let step = 0; step <= segments; step += 1) {
    const angle = (step / segments) * Math.PI * 2;
    const left = projectBandPoint(radius, -halfWidth, angle, lift);
    const right = projectBandPoint(radius, halfWidth, angle, lift);

    positions.push(left.x, left.y, left.z);
    positions.push(right.x, right.y, right.z);

    if (step < segments) {
      const base = step * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function projectBandPoint(radius, xOffset, angle, lift) {
  return new Vector3(xOffset, Math.cos(angle), Math.sin(angle))
    .normalize()
    .multiplyScalar(radius + lift);
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
    top: 32,
    left: "50%",
    marginLeft: -138,
    width: 276,
    height: 276,
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
    width: 292,
    height: STAGE_LAYOUT.heroHeight - 16,
    marginLeft: -146,
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
