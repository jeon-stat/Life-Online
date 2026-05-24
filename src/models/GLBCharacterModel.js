import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function GLBCharacterModel({ character }) {
  const gltf = useLoader(GLTFLoader, character.modelUrl);

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
    return cloned;
  }, [gltf.scene]);

  return (
    <group
      position={character.modelOffset ?? [0, -1, 0]}
      rotation={character.modelRotation ?? [0, Math.PI, 0]}
      scale={character.modelScale ?? [3, 3, 3]}
    >
      <primitive
        object={scene}
        position={[0, -(character.modelPivotY ?? 0), 0]}
      />
    </group>
  );
}
