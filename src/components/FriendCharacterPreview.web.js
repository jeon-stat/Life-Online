import { View } from "react-native";

import { CharacterStage } from "./CharacterStage";

const BASE_STAGE_WIDTH = 360;
const BASE_STAGE_HEIGHT = 500;
const DETAIL_CAMERA_POSITION = [0, 1.56, 6.9];
const DETAIL_FOV = 24;

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
        cameraPosition={isDetail ? DETAIL_CAMERA_POSITION : undefined}
        fov={isDetail ? DETAIL_FOV : undefined}
        onInteractionChange={undefined}
      />
    </View>
  );
}
