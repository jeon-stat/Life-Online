import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { Box3, Group, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function prepareScene(scene, character) {
  const root = scene.clone(true);
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = false;
      node.receiveShadow = false;
      if (node.material) {
        node.material.needsUpdate = true;
      }
    }
  });

  const box = new Box3().setFromObject(root);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const targetHeight = character.modelTargetHeight ?? 4.2;
  const scale = size.y > 0 ? targetHeight / size.y : 1;

  root.position.set(-center.x, -box.min.y, -center.z);
  root.scale.setScalar(scale);

  const wrapper = new Group();
  wrapper.add(root);

  const [offsetX = 0, offsetY = 0, offsetZ = 0] = character.modelOffset ?? [0, 0, 0];
  wrapper.position.set(offsetX, offsetY, offsetZ);

  return wrapper;
}

export function GLBCharacterModel({ character }) {
  const gltf = useLoader(GLTFLoader, character.modelUrl);

  const model = useMemo(
    () => prepareScene(gltf.scene, character),
    [character, gltf.scene],
  );

  return <primitive object={model} />;
}
