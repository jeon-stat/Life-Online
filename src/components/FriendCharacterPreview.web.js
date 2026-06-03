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

const PREVIEW_LAYOUT = {
  radius: 6.7,
  centerOffsetY: -5.85,
  characterScale: 0.68,
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
      <View style={styles.sky} />
      <View style={styles.sun} />
      <View style={[styles.cloud, styles.cloudOne]} />
      <View style={[styles.cloud, styles.cloudTwo]} />
      <View style={[styles.flower, styles.flowerOne]} />
      <View style={[styles.flower, styles.flowerTwo]} />
      <Canvas
        camera={{ position: [0, 1.48, 6.15], fov: 25 }}
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
  const sceneRef = useRef(null);
  const characterWrapRef = useRef(null);

  useFrame((frameState) => {
    if (!sceneRef.current || !characterWrapRef.current) return;

    const t = frameState.clock.getElapsedTime();
    const bob = motionState === "run" ? 0.11 : motionState === "walk" ? 0.08 : 0.05;
    const rotationSpeed = motionState === "run" ? 0.22 : motionState === "walk" ? 0.14 : 0.02;

    sceneRef.current.rotation.y = Math.sin(t * 0.22) * 0.12;
    sceneRef.current.rotation.x = 0.04;
    sceneRef.current.position.y = PREVIEW_LAYOUT.centerOffsetY + Math.sin(t * 1.35) * 0.03;
    characterWrapRef.current.position.y = 0.18 + Math.sin(t * 1.2) * bob;
    characterWrapRef.current.rotation.y = Math.sin(t * 0.6) * rotationSpeed;
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
    <group ref={sceneRef}>
      <MiniWorld pathGeometry={pathGeometry} />

      <group ref={characterWrapRef} position={[0, 0.18, 0]} scale={PREVIEW_LAYOUT.characterScale}>
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

function MiniWorld({ pathGeometry }) {
  const worldRef = useRef(null);

  useFrame((frameState) => {
    if (!worldRef.current) return;

    const t = frameState.clock.getElapsedTime();
    worldRef.current.rotation.x = Math.sin(t * 0.03) * 0.02;
    worldRef.current.rotation.y += 0.004;
  });

  return (
    <group position={[0, PREVIEW_LAYOUT.centerOffsetY, 0]}>
      <group ref={worldRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry
            args={[
              PREVIEW_LAYOUT.radius,
              60,
              38,
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

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fbfbf8",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  sun: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f7d27c",
    opacity: 0.72,
  },
  cloud: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.05)",
    opacity: 0.88,
  },
  cloudOne: {
    top: 16,
    left: 12,
    width: 26,
    height: 12,
  },
  cloudTwo: {
    top: 30,
    right: 18,
    width: 30,
    height: 13,
  },
  flower: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.35)",
    opacity: 0.55,
  },
  flowerOne: {
    bottom: 12,
    left: 12,
  },
  flowerTwo: {
    bottom: 10,
    right: 15,
  },
});
