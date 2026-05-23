import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { MageModel } from "./models/MageModel.js";
import { PirateModel } from "./models/PirateModel.js";
import { WarriorModel } from "./models/WarriorModel.js";
import { StageCanvas } from "./scene/StageCanvas.web.js";
import { StageRig } from "./scene/StageRig.js";
import { STAGE_LAYOUT } from "./scene/stageConfig.js";

export function CharacterStage({ character }) {
  const [rotation, setRotation] = useState(STAGE_LAYOUT.defaultRotation);
  const dragStartRef = useRef(STAGE_LAYOUT.defaultRotation);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStartRef.current = rotation;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextY =
            dragStartRef.current.y + gestureState.dx * STAGE_LAYOUT.rotationLimit.yStep;
          const nextX = clamp(
            dragStartRef.current.x - gestureState.dy * STAGE_LAYOUT.rotationLimit.xStep,
            -STAGE_LAYOUT.rotationLimit.x,
            STAGE_LAYOUT.rotationLimit.x,
          );

          setRotation({ x: nextX, y: nextY });
        },
      }),
    [rotation],
  );

  return (
    <View style={styles.stage}>
      <StageCanvas>
        <StageRig rotation={rotation}>
          <ClassModel character={character} />
        </StageRig>
      </StageCanvas>
      <View style={styles.gestureLayer} {...panResponder.panHandlers} />
    </View>
  );
}

function ClassModel({ character }) {
  if (character.id === "mage") return <MageModel character={character} />;
  if (character.id === "pirate") return <PirateModel character={character} />;
  return <WarriorModel character={character} />;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: STAGE_LAYOUT.background,
  },
  gestureLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    cursor: "grab",
  },
});
