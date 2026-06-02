import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useFrame } from "@react-three/fiber";

import { CHARACTER_CLASSES } from "../characters.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { StageRig } from "../scene/StageRig.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

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
  const wrapperHeight = Math.round(size * 1.18);
  const character = useMemo(() => resolvePreviewCharacter(friend), [friend?.avatarCharacterId, friend?.skinTone]);
  const energyLevel = Math.max(0, Math.min(6, friend?.energyLevel ?? 3));
  const actionKey = ENERGY_LEVEL_TO_ACTION_KEY[energyLevel] ?? "energy3";

  return (
    <View style={[styles.shell, { width: size, height: wrapperHeight }]}>
      <StageCanvas>
        <PreviewCharacter character={character} actionKey={actionKey} />
      </StageCanvas>
    </View>
  );
}

function PreviewCharacter({ character, actionKey }) {
  const worldRef = useRef(null);

  useFrame((frameState) => {
    if (!worldRef.current) return;

    const t = frameState.clock.getElapsedTime();
    worldRef.current.position.y = Math.sin(t * 1.1) * 0.04;
    worldRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
  });

  return (
    <group ref={worldRef} position={[0, 0, 0]}>
      <StageRig rotation={STAGE_LAYOUT.defaultRotation}>
        <group position={[0, 0.24, 0]} scale={0.82}>
          <GLBCharacterModel
            character={character}
            animationState={actionKey}
            animationSpeed={0.95}
            loopMode="repeat"
          />
        </group>
      </StageRig>
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
    borderRadius: 18,
    backgroundColor: "#f4f7f1",
  },
});
