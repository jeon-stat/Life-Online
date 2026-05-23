import { Canvas } from "@react-three/fiber";

import { StageLights } from "./StageLights.js";
import { STAGE_LAYOUT } from "./stageConfig.js";

export function StageCanvas({ children }) {
  return (
    <Canvas
      camera={{ position: STAGE_LAYOUT.cameraPosition, fov: STAGE_LAYOUT.fov }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#f8fbff"]} />
      <fog attach="fog" args={["#f8fbff", 8, 16]} />
      <StageLights />
      {children}
    </Canvas>
  );
}
