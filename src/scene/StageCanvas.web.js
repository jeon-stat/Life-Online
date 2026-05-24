import { StyleSheet } from "react-native";
import { Canvas } from "@react-three/fiber";

import { StageLights } from "./StageLights.js";
import { STAGE_LAYOUT } from "./stageConfig.js";

export function StageCanvas({ children }) {
  return (
    <Canvas
      camera={{ position: STAGE_LAYOUT.cameraPosition, fov: STAGE_LAYOUT.fov }}
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
