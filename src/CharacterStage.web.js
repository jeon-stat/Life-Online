import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { PongoModel } from "./models/PongoModel.js";
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
    <View style={styles.stage}>
      <StageCanvas>
        <StageRig rotation={rotation}>
          <PongoModel character={character} />
        </StageRig>
      </StageCanvas>
      <View style={styles.gestureHotspot} {...panResponder.panHandlers} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: STAGE_LAYOUT.background,
  },
  gestureHotspot: {
    position: "absolute",
    left: "50%",
    top: 66,
    width: 250,
    height: 300,
    marginLeft: -125,
    backgroundColor: "transparent",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  },
});
