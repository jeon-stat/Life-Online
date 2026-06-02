import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";

import { CHARACTER_CLASSES } from "../characters.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageLights } from "../scene/StageLights.js";

export function FriendCharacterPreview({ friend, size = 88 }) {
  const wrapperHeight = Math.round(size * (size > 100 ? 1.04 : 1.12));
  const character = useMemo(() => resolvePreviewCharacter(friend), [friend?.avatarCharacterId, friend?.skinTone]);
  const animationState = useMemo(() => `energy${Math.max(0, Math.min(6, friend?.energyLevel ?? 3))}`, [friend?.energyLevel]);

  return (
    <View style={[styles.shell, { width: size, height: wrapperHeight }]}>
      <Canvas
        camera={{ position: [0, 1.22, 5.9], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={styles.canvas}
      >
        <StageLights />
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
    rootRef.current.position.y = 0.06 + Math.sin(t * 1.2) * 0.035;
    rootRef.current.rotation.y = Math.sin(t * 0.2) * 0.08;
  });

  return (
    <group ref={rootRef} position={[0, 0.05, 0]}>
      <group position={[0, 0.08, 0]} scale={0.68}>
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

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});
