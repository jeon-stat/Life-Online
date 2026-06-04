import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

const BASE_STAGE_WIDTH = 360;
const BASE_STAGE_HEIGHT = STAGE_LAYOUT.heroHeight;

export function FriendCharacterPreview({ character, state, size = 112 }) {
  const scale = size / BASE_STAGE_WIDTH;
  const shellHeight = Math.round(BASE_STAGE_HEIGHT * scale);
  const offsetX = -Math.round((BASE_STAGE_WIDTH - size) / 2);
  const offsetY = -Math.round((BASE_STAGE_HEIGHT - shellHeight) / 2);

  return (
    <View style={{ width: size, height: shellHeight, overflow: "hidden" }} pointerEvents="none">
      <View
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: BASE_STAGE_WIDTH,
          height: BASE_STAGE_HEIGHT,
          transform: [{ scale }],
        }}
      >
        <CharacterStage
          character={character}
          state={state}
          presentation="full"
          height={BASE_STAGE_HEIGHT}
          onInteractionChange={undefined}
        />
      </View>
    </View>
  );
}
