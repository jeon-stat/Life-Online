import { useMemo } from "react";

import { CHARACTER_SCALE } from "./stageConfig.js";

export function StageRig({ children, rotation }) {
  const groupRotation = useMemo(
    () => [rotation.x, rotation.y, 0],
    [rotation.x, rotation.y],
  );

  return (
    <group
      scale={[CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE]}
      rotation={groupRotation}
      position={[0, 0.02, 0]}
    >
      {children}
    </group>
  );
}
