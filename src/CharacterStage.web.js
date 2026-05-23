import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

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
          Math.abs(gestureState.dx) > 4 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
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
      <View style={styles.canvasViewport}>
        <StageCanvas>
          <StageRig rotation={rotation}>
            <PongoModel character={character} />
          </StageRig>
        </StageCanvas>
      </View>
      <View style={styles.controlPanel}>
        <Text style={styles.controlTitle}>Rotate Character</Text>
        <Text style={styles.controlHint}>
          Drag this bar left or right. Vertical page scrolling is kept separate.
        </Text>
        <View style={styles.gestureTrack} {...panResponder.panHandlers}>
          <View style={styles.gestureTrackInner}>
            <View style={styles.gestureKnob} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: STAGE_LAYOUT.background,
  },
  canvasViewport: {
    flex: 1,
  },
  controlPanel: {
    paddingTop: 8,
    paddingBottom: 6,
    gap: 6,
  },
  controlTitle: {
    color: "#223047",
    fontSize: 14,
    fontWeight: "800",
  },
  controlHint: {
    color: "#627182",
    fontSize: 12,
    lineHeight: 16,
  },
  gestureTrack: {
    height: 44,
    justifyContent: "center",
    cursor: "ew-resize",
    touchAction: "none",
    userSelect: "none",
  },
  gestureTrackInner: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#e7ecf4",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  gestureKnob: {
    width: 54,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#27364d",
  },
});
