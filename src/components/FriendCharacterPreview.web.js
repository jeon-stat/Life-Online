import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";

const STAGE_BASE_HEIGHT = 500;

export function FriendCharacterPreview({ character, state, size = 112 }) {
  const scale = Math.max(0.22, Math.min(0.34, size / 420));
  const shellHeight = Math.round(STAGE_BASE_HEIGHT * scale);

  return (
    <View style={{ width: size, height: shellHeight }} pointerEvents="none">
      <CharacterStage character={character} state={state} scale={scale} onInteractionChange={undefined} />
    </View>
  );
}
