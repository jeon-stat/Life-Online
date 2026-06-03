import { StyleSheet, View } from "react-native";

import { CharacterStage } from "./CharacterStage";

const STAGE_BASE_WIDTH = 340;
const STAGE_BASE_HEIGHT = 500;

export function FriendCharacterPreview({ character, state, size = 112 }) {
  const shellHeight = Math.round(size * 1.08);
  const scale = Math.max(0.19, Math.min(0.34, size / 320));
  const scaledWidth = Math.round(STAGE_BASE_WIDTH * scale);
  const scaledHeight = Math.round(STAGE_BASE_HEIGHT * scale);

  return (
    <View style={[styles.shell, { width: size, height: shellHeight }]} pointerEvents="none">
      <View
        style={[
          styles.stageClip,
          {
            width: scaledWidth,
            height: scaledHeight,
          },
        ]}
      >
        <View
          style={[
            styles.stageScaleWrap,
            {
              width: STAGE_BASE_WIDTH,
              height: STAGE_BASE_HEIGHT,
              transform: [{ scale }],
            },
          ]}
        >
          <CharacterStage character={character} state={state} onInteractionChange={undefined} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  stageClip: {
    position: "absolute",
    left: "50%",
    top: 0,
    marginLeft: -170,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  stageScaleWrap: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
