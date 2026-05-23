import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { CHARACTER_SCALE } from "./stageConfig.js";

export function StageRig({ children }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = -0.24 + Math.sin(state.clock.elapsedTime * 0.35) * 0.02;
    ref.current.rotation.x = 0.03 + Math.cos(state.clock.elapsedTime * 0.45) * 0.01;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
  });

  return (
    <group ref={ref} scale={[CHARACTER_SCALE, CHARACTER_SCALE, CHARACTER_SCALE]}>
      {children}
    </group>
  );
}
