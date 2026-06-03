import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Vector3,
} from "three";

import { CHARACTER_CLASSES } from "../characters.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageLights } from "../scene/StageLights.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

const PREVIEW_LAYOUT = {
  radius: 8.8,
  centerOffsetY: -8.65,
  characterScale: 0.5,
  sphereThetaLength: Math.PI,
};

const PREVIEW_PATH = {
  halfWidth: 0.54,
  lift: 0.007,
  centerX: 0,
  segments: 124,
  stripSegments: 8,
};

const ENERGY_LEVEL_TO_ACTION_KEY = {
  0: "energy0",
  1: "energy1",
  2: "energy2",
  3: "energy3",
  4: "energy4",
  5: "energy5",
  6: "energy6",
};

const MOTION_BY_ENERGY = {
  0: "neutral",
  1: "neutral",
  2: "neutral",
  3: "neutral",
  4: "walk",
  5: "run",
  6: "run",
};

export function FriendCharacterPreview({ friend, size = 112 }) {
  const width = size;
  const height = Math.round(size * 1.08);

  const character = useMemo(() => {
    const base =
      CHARACTER_CLASSES.find((entry) => entry.id === friend?.avatarCharacterId) ??
      CHARACTER_CLASSES[0];
    return {
      ...base,
      skinTone: friend?.skinTone ?? base.palette?.skin ?? "#f7d9cf",
    };
  }, [friend?.avatarCharacterId, friend?.skinTone]);

  const energyLevel = Number(friend?.energyLevel ?? 3);
  const animationState = ENERGY_LEVEL_TO_ACTION_KEY[energyLevel] ?? "energy3";
  const motionState = MOTION_BY_ENERGY[energyLevel] ?? "neutral";

  return (
    <View style={[styles.shell, { width, height }]} pointerEvents="none">
      <Canvas
        camera={{ position: STAGE_LAYOUT.cameraPosition, fov: STAGE_LAYOUT.fov }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={styles.canvas}
      >
        <StageLights />
        <FriendScene
          character={character}
          animationState={animationState}
          motionState={motionState}
        />
      </Canvas>
    </View>
  );
}

function FriendScene({ character, animationState, motionState }) {
  const rootRef = useRef(null);
  const worldRef = useRef(null);

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime();
    const bobAmount = motionState === "walk" || motionState === "run" ? 0.12 : 0.08;
    const scalePulse = 1 + Math.sin(t * 0.7) * 0.015;

    rootRef.current.rotation.x = STAGE_LAYOUT.defaultRotation.x;
    rootRef.current.rotation.y = STAGE_LAYOUT.defaultRotation.y;
    rootRef.current.position.y = STAGE_LAYOUT.modelBaseY + Math.sin(t * 1.2) * bobAmount;
    rootRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  const pathGeometry = useMemo(
    () =>
      buildMeridianPathGeometry({
        radius: PREVIEW_LAYOUT.radius,
        halfWidth: PREVIEW_PATH.halfWidth,
        lift: PREVIEW_PATH.lift,
        centerX: PREVIEW_PATH.centerX,
        segments: PREVIEW_PATH.segments,
        stripSegments: PREVIEW_PATH.stripSegments,
      }),
    [],
  );

  return (
    <group ref={rootRef} position={[0, STAGE_LAYOUT.modelBaseY, 0]}>
      <MiniWorld pathGeometry={pathGeometry} motionState={motionState} />

      <group position={[0, 0.16, 0]} scale={PREVIEW_LAYOUT.characterScale}>
        <GLBCharacterModel
          character={character}
          animationState={animationState}
          animationSpeed={1}
          loopMode="repeat"
        />
      </group>
    </group>
  );
}

function MiniWorld({ pathGeometry, motionState }) {
  const worldRef = useRef(null);

  useFrame((frameState) => {
    if (!worldRef.current) return;

    const delta = frameState.clock.getDelta();
    worldRef.current.rotation.x -= getWorldRotationSpeed(motionState) * delta;
  });

  return (
    <group position={[0, PREVIEW_LAYOUT.centerOffsetY, 0]}>
      <group ref={worldRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry
            args={[
              PREVIEW_LAYOUT.radius,
              64,
              42,
              0,
              Math.PI * 2,
              0,
              PREVIEW_LAYOUT.sphereThetaLength,
            ]}
          />
          <meshStandardMaterial color="#8fbe70" />
        </mesh>

        <mesh geometry={pathGeometry} renderOrder={0}>
          <meshStandardMaterial
            color="#d89a4a"
            side={DoubleSide}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </group>
    </group>
  );
}

function buildMeridianPathGeometry({
  radius,
  halfWidth,
  lift,
  centerX,
  segments,
  stripSegments,
}) {
  const geometry = new BufferGeometry();
  const positions = [];
  const indices = [];

  for (let step = 0; step <= segments; step += 1) {
    const angle = (step / segments) * Math.PI * 2;

    for (let band = 0; band <= stripSegments; band += 1) {
      const t = band / stripSegments - 0.5;
      const x = centerX + t * halfWidth * 2;

      const point = projectMeridianBandPoint(radius + lift, x, angle);
      positions.push(point.x, point.y, point.z);

      if (step < segments && band < stripSegments) {
        const row = stripSegments + 1;
        const base = step * row + band;

        indices.push(base, base + 1, base + row);
        indices.push(base + 1, base + row + 1, base + row);
      }
    }
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function projectMeridianBandPoint(radius, x, angle) {
  const safeX = Math.max(-radius * 0.85, Math.min(radius * 0.85, x));
  const yzRadius = Math.sqrt(radius * radius - safeX * safeX);

  return new Vector3(
    safeX,
    Math.cos(angle) * yzRadius,
    Math.sin(angle) * yzRadius,
  );
}

function getWorldRotationSpeed(motionState) {
  switch (motionState) {
    case "run":
      return 0.26;
    case "walk":
      return 0.14;
    case "tired":
      return 0.004;
    case "neutral":
    default:
      return 0.02;
  }
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});
