import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";

import { CHARACTER_CLASSES } from "../characters.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageLights } from "../scene/StageLights.js";

const PREVIEW_WORLD = {
  radius: 5.1,
  centerOffsetY: -4.85,
  characterScale: 0.38,
  sphereThetaLength: Math.PI,
  halfWidth: 0.46,
  lift: 0.006,
  centerX: 0,
  segments: 96,
  stripSegments: 6,
};

export function FriendCharacterPreview({ friend, size = 88 }) {
  const wrapperHeight = Math.round(size * (size > 100 ? 1 : 1.18));
  const character = useMemo(() => resolvePreviewCharacter(friend), [friend?.avatarCharacterId, friend?.skinTone]);
  const animationState = useMemo(() => `energy${Math.max(0, Math.min(6, friend?.energyLevel ?? 3))}`, [friend?.energyLevel]);

  return (
    <View style={[styles.shell, { width: size, height: wrapperHeight }]}>
      <View style={styles.sky}>
        <View style={styles.sparkOne} />
        <View style={styles.sparkTwo} />
        <View style={styles.sparkThree} />
        <View style={styles.sparkFour} />
      </View>

      <Canvas
        camera={{ position: [0, 1.05, 6.25], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={styles.canvas}
      >
        <StageLights />
        <PreviewWorld />
        <PreviewCharacter character={character} animationState={animationState} />
      </Canvas>
    </View>
  );
}

function PreviewCharacter({ character, animationState }) {
  const rootRef = useRef(null);

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime();
    rootRef.current.position.y = 0.09 + Math.sin(t * 1.1) * 0.04;
    rootRef.current.rotation.y = Math.sin(t * 0.25) * 0.08;
  });

  return (
    <group ref={rootRef} position={[0, 0.08, 0]}>
      <group position={[0, 0.1, 0]} scale={PREVIEW_WORLD.characterScale}>
        <GLBCharacterModel
          character={character}
          animationState={animationState}
          animationSpeed={0.95}
          loopMode="repeat"
        />
      </group>
    </group>
  );
}

function PreviewWorld() {
  const worldRef = useRef(null);

  const pathGeometry = useMemo(
    () =>
      buildMeridianPathGeometry({
        radius: PREVIEW_WORLD.radius,
        halfWidth: PREVIEW_WORLD.halfWidth,
        lift: PREVIEW_WORLD.lift,
        centerX: PREVIEW_WORLD.centerX,
        segments: PREVIEW_WORLD.segments,
        stripSegments: PREVIEW_WORLD.stripSegments,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!worldRef.current) return;

    worldRef.current.rotation.x -= 0.022 * delta;
    worldRef.current.rotation.y += 0.018 * delta;
  });

  return (
    <group position={[0, PREVIEW_WORLD.centerOffsetY, 0]}>
      <group ref={worldRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry
            args={[
              PREVIEW_WORLD.radius,
              64,
              42,
              0,
              Math.PI * 2,
              0,
              PREVIEW_WORLD.sphereThetaLength,
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

function resolvePreviewCharacter(friend) {
  const baseCharacter = CHARACTER_CLASSES.find((item) => item.id === friend?.avatarCharacterId) ?? CHARACTER_CLASSES[0];
  const skinTone = friend?.skinTone ?? baseCharacter.palette?.skin ?? "#f4cbbb";

  return {
    ...baseCharacter,
    skinTone,
    modelScale: [2.22, 2.22, 2.22],
    modelOffset: [0, 1.48, 0],
    modelPivotY: 0.48,
    modelRotation: [0, 0.1, 0],
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
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#eef8ee",
  },
  sparkOne: {
    position: "absolute",
    top: "10%",
    left: "16%",
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f7cf7b",
  },
  sparkTwo: {
    position: "absolute",
    top: "26%",
    right: "18%",
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#f7cf7b",
  },
  sparkThree: {
    position: "absolute",
    top: "40%",
    left: "24%",
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#f7cf7b",
  },
  sparkFour: {
    position: "absolute",
    top: "18%",
    right: "10%",
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#f7cf7b",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});
