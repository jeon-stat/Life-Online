import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";

export function FriendCharacterPreview({ character, state, size = 112 }) {
  const shellHeight = Math.round(size * 1.42);

  return (
    <View style={{ width: size, height: shellHeight, overflow: "hidden" }} pointerEvents="none">
      <CharacterStage
        character={character}
        state={state}
        presentation="thumbnail"
        height={shellHeight}
        onInteractionChange={undefined}
      />
    </View>
  );
}
