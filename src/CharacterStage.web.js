import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { MageModel } from "./models/MageModel.js";
import { PirateModel } from "./models/PirateModel.js";
import { WarriorModel } from "./models/WarriorModel.js";
import { StageCanvas } from "./scene/StageCanvas.web.js";
import { StageRig } from "./scene/StageRig.js";
import { getRotationFromDrag } from "./scene/rotationMath.js";
import { STAGE_LAYOUT } from "./scene/stageConfig.js";

export function CharacterStage({ character, onInteractionChange }) {
  const [rotation, setRotation] = useState(STAGE_LAYOUT.defaultRotation);
  const rotationRef = useRef(STAGE_LAYOUT.defaultRotation);
  const dragStartRef = useRef(STAGE_LAYOUT.defaultRotation);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
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

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: STAGE_LAYOUT.background,
  },
  gestureLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  },
});
