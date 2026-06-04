import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";

const BASE_STAGE_WIDTH = 360;
const BASE_STAGE_HEIGHT = 500;
const DETAIL_MINI_WORLD = {
  radius: 14.2,
  centerOffsetY: -13.9,
  characterScale: 0.5,
  sphereThetaLength: Math.PI,
};

export function FriendCharacterPreview({ character, state, size = 112, variant = "card" }) {
  const scale = size / BASE_STAGE_WIDTH;
  const shellHeight = Math.round(BASE_STAGE_HEIGHT * scale);
  const isDetail = variant === "detail";

  return (
    <View style={{ width: size, height: shellHeight, overflow: "hidden" }} pointerEvents="none">
      <CharacterStage
        character={character}
        state={state}
        presentation="full"
        scale={scale}
        miniWorldOverride={isDetail ? DETAIL_MINI_WORLD : undefined}
        onInteractionChange={undefined}
      />
    </View>
  );
}
