import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

export function FriendCharacterPreview({ character, state, size = 112 }) {
  const scale = Math.max(0.22, Math.min(0.34, size / 420));
  const shellHeight = Math.round(STAGE_LAYOUT.heroHeight * scale);
  const stageWidth = Math.round(size / scale);

  return (
    <View style={{ width: size, height: shellHeight, overflow: "hidden" }} pointerEvents="none">
      <View
        style={{
          width: stageWidth,
          height: STAGE_LAYOUT.heroHeight,
          transform: [{ scale }],
          transformOrigin: "top center",
        }}
      >
        <CharacterStage character={character} state={state} onInteractionChange={undefined} />
      </View>
    </View>
  );
}
