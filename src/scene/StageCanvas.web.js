import { StyleSheet } from "react-native";
import { Canvas } from "@react-three/fiber";

import { StageLights } from "./StageLights.js";
import { STAGE_LAYOUT } from "./stageConfig.js";

export function StageCanvas({ children, cameraPosition = STAGE_LAYOUT.cameraPosition, fov = STAGE_LAYOUT.fov }) {
  return (
    <Canvas
      camera={{ position: cameraPosition, fov }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={styles.canvas}
    >
      <StageLights />
      {children}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: "transparent",
  },
});
