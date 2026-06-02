import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";

import { CHARACTER_CLASSES } from "../characters.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

const MINI_WORLD_THEME = {
  grass: "#8fbe70",
  path: "#d89a4a",
};

const MINI_WORLD_LAYOUT = {
  radius: 8.8,
  centerOffsetY: -8.65,
  characterScale: 0.5,
  sphereThetaLength: Math.PI,
};

const MINI_WORLD_PATH = {
  halfWidth: 0.7,
  lift: 0.007,
  centerX: 0,
  segments: 128,
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

export function FriendCharacterPreview({ friend, size = 88 }) {
  const wrapperHeight = Math.round(size * (size > 100 ? 1.08 : 1.28));
  const character = useMemo(() => resolvePreviewCharacter(friend), [friend?.avatarCharacterId, friend?.skinTone]);
  const energyLevel = Math.max(0, Math.min(6, friend?.energyLevel ?? 3));
  const actionKey = ENERGY_LEVEL_TO_ACTION_KEY[energyLevel] ?? "energy3";

  return (
    <View style={[styles.shell, { width: size, height: wrapperHeight }]}>
      <StageCanvas>
        <PreviewScene character={character} actionKey={actionKey} />
      </StageCanvas>
    </View>
  );
}

function PreviewScene({ character, actionKey }) {
  const rootRef = useRef(null);

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime();
    rootRef.current.rotation.x = STAGE_LAYOUT.defaultRotation.x;
    rootRef.current.rotation.y = STAGE_LAYOUT.defaultRotation.y;
    rootRef.current.position.y = STAGE_LAYOUT.modelBaseY + Math.sin(t * 1.2) * 0.05;
  });

  return (
    <group ref={rootRef} position={[0, STAGE_LAYOUT.modelBaseY, 0]} scale={0.42}>
      <MiniWorld />

      <group position={[0, 0.16, 0]} scale={MINI_WORLD_LAYOUT.characterScale}>
        <GLBCharacterModel
          character={character}
          animationState={actionKey}
          animationSpeed={0.95}
          loopMode="repeat"
        />
      </group>
    </group>
  );
}

function MiniWorld() {
  const worldRef = useRef(null);

  const pathGeometry = useMemo(
    () =>
      buildMeridianPathGeometry({
        radius: MINI_WORLD_LAYOUT.radius,
        halfWidth: MINI_WORLD_PATH.halfWidth,
        lift: MINI_WORLD_PATH.lift,
        centerX: MINI_WORLD_PATH.centerX,
        segments: MINI_WORLD_PATH.segments,
        stripSegments: MINI_WORLD_PATH.stripSegments,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!worldRef.current) return;

    worldRef.current.rotation.x -= 0.02 * delta;
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

        <mesh geometry={pathGeometry} renderOrder={0}>
          <meshStandardMaterial
            color={MINI_WORLD_THEME.path}
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

function resolvePreviewCharacter(friend) {
  const baseCharacter = CHARACTER_CLASSES.find((item) => item.id === friend?.avatarCharacterId) ?? CHARACTER_CLASSES[0];
  const skinTone = friend?.skinTone ?? baseCharacter.palette?.skin ?? "#f4cbbb";

  return {
    ...baseCharacter,
    skinTone,
    modelScale: [2.72, 2.72, 2.72],
    modelOffset: [0, 1.74, 0],
    modelPivotY: 0.62,
    modelRotation: [0, 0, 0],
  };
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
  },
});
