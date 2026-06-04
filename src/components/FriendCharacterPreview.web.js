import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";

const BASE_STAGE_WIDTH = 360;
const BASE_STAGE_HEIGHT = 500;

export function FriendCharacterPreview({ character, state, size = 112 }) {
  const scale = size / BASE_STAGE_WIDTH;
  const shellHeight = Math.round(BASE_STAGE_HEIGHT * scale);

  return (
    <View style={{ width: size, height: shellHeight, overflow: "hidden" }} pointerEvents="none">
      <CharacterStage
        character={character}
        state={state}
        presentation="full"
        scale={scale}
        onInteractionChange={undefined}
      />
    </View>
  );
}
