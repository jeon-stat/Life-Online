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
  trunk: "#7a5942",
  leaf: "#7bb56a",
  lampPost: "#667180",
  lampLight: "#ffe9b2",
  stone: "#d8dde5",
};

const MINI_WORLD_LAYOUT = {
  radius: 3.42,
  centerY: -3.38,
  pathLift: 0.06,
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
    rootRef.current.rotation.x = rotation.x;
    rootRef.current.rotation.y = rotation.y;
    rootRef.current.position.y = STAGE_LAYOUT.modelBaseY + Math.sin(t * 1.2) * state.bobAmount;
    const scalePulse = 1 + Math.sin(t * 0.7) * 0.015;
    rootRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  return (
    <group ref={rootRef} position={[0, STAGE_LAYOUT.modelBaseY, 0]}>
      <MiniWorld motionState={state.animationState} />
      <GLBCharacterModel
        character={character}
        animationState={state.animationState}
      />
    </group>
  );
}

function MiniWorld({ motionState }) {
  const worldRef = useRef(null);
  const pathCurve = useMemo(() => buildPathCurve(), []);

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    worldRef.current.rotation.y += getWorldRotationSpeed(motionState) * delta;
  });

  return (
    <group ref={worldRef}>
      <mesh position={[0, MINI_WORLD_LAYOUT.centerY, 0]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[MINI_WORLD_LAYOUT.radius, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.54]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.grass} />
      </mesh>
      <mesh renderOrder={1}>
        <tubeGeometry args={[pathCurve, 72, 0.13, 10, true]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.path} />
      </mesh>
      <mesh renderOrder={0}>
        <tubeGeometry args={[pathCurve, 72, 0.16, 10, true]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.pathEdge} />
      </mesh>
      <MiniTree position={getSurfacePoint(-1.18, 0.84, 0.02)} scale={0.96} />
      <MiniTree position={getSurfacePoint(1.26, -0.72, 0.03)} scale={0.82} />
      <MiniLamp position={getSurfacePoint(0.96, 1.18, 0.02)} />
      <MiniStone position={getSurfacePoint(-0.94, -1.2, 0.01)} />
    </group>
  );
}

function MiniTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.34, 8]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.trunk} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.leaf} />
      </mesh>
      <mesh position={[0.05, 0.62, 0.03]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.leaf} />
      </mesh>
    </group>
  );
}

function MiniLamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.38, 8]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.lampPost} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color={MINI_WORLD_THEME.lampLight} emissive="#ffe5a0" emissiveIntensity={0.35} />
      </mesh>
      <pointLight position={[0, 0.43, 0]} intensity={0.18} distance={1.4} color="#ffe9b2" />
    </group>
  );
}

function MiniStone({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 9, 9]} />
      <meshStandardMaterial color={MINI_WORLD_THEME.stone} />
    </mesh>
  );
}

function buildPathCurve() {
  const points = [];

  for (let step = 0; step < 9; step += 1) {
    const angle = (step / 8) * Math.PI * 2;
    const radiusX = 1.28 + Math.sin(angle * 2) * 0.14;
    const radiusZ = 1.02 + Math.cos(angle * 2) * 0.14;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;

    points.push(
      new Vector3(
        x,
        getSurfaceY(x, z) + MINI_WORLD_LAYOUT.pathLift,
        z,
      ),
    );
  }

  return new CatmullRomCurve3(points, true, "catmullrom", 0.35);
}

function getSurfacePoint(x, z, lift = 0) {
  return [x, getSurfaceY(x, z) + lift, z];
}

function getSurfaceY(x, z) {
  const radius = MINI_WORLD_LAYOUT.radius;
  const centerY = MINI_WORLD_LAYOUT.centerY;
  const height = Math.sqrt(Math.max(radius * radius - x * x - z * z, 0));

  return centerY + height;
}

function getWorldRotationSpeed(motionState) {
  switch (motionState) {
    case "run":
      return 0.42;
    case "walk":
      return 0.18;
    case "tired":
      return 0.015;
    case "idle":
    default:
      return 0.03;
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
    height: 292,
    position: "relative",
    backgroundColor: "transparent",
  },
  glowBack: {
    position: "absolute",
    top: 14,
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
    top: 6,
    width: 224,
    height: 272,
    marginLeft: -112,
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
