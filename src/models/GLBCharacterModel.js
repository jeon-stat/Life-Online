import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, Box3, LoopRepeat } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function pickAnimationClip(clips = [], animationMap = {}, stateKey = "idle", defaultAnimation = "idle") {
  if (!clips.length) return null;

  const desiredKeys = [stateKey, defaultAnimation].filter(Boolean);

  for (const key of desiredKeys) {
    const mappedName = animationMap?.[key];
    if (mappedName) {
      const exactMatch = clips.find((clip) => clip.name === mappedName);
      if (exactMatch) return exactMatch;

      const looseMatch = clips.find((clip) => clip.name.toLowerCase().includes(mappedName.toLowerCase()));
      if (looseMatch) return looseMatch;
    }

    const fallbackByKey = clips.find((clip) => clip.name.toLowerCase().includes(String(key).toLowerCase()));
    if (fallbackByKey) return fallbackByKey;
  }

  if (stateKey === "idle" || defaultAnimation === "idle") {
    return [...clips].sort((a, b) => b.duration - a.duration)[0];
  }

  return clips[0];
}

export function GLBCharacterModel({ character, animationState = "idle" }) {
  const gltf = useLoader(GLTFLoader, character.modelUrl);
  const mixerRef = useRef(null);
  const scale = character.modelScale ?? [3, 3, 3];
  const basePosition = character.modelOffset ?? [0, -1, 0];
  const pivotOffsetY = (character.modelPivotY ?? 0) * scale[1];

  const scene = useMemo(() => {
    const baseScene = gltf.scene;
    baseScene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
    return baseScene;
  }, [gltf.scene]);

  const groundAlignedPosition = useMemo(() => {
    scene.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(scene);
    const bottomY =
      basePosition[1] -
      pivotOffsetY +
      bounds.min.y * scale[1];

    return [basePosition[0], basePosition[1] - bottomY, basePosition[2]];
  }, [basePosition, pivotOffsetY, scale, scene]);

  const selectedClip = useMemo(
    () =>
      pickAnimationClip(
        gltf.animations,
        character.animationMap,
        animationState,
        character.defaultAnimation,
      ),
    [animationState, character.animationMap, character.defaultAnimation, gltf.animations],
  );

  useEffect(() => {
    if (!selectedClip || !scene) return undefined;

    const mixer = new AnimationMixer(scene);
    mixerRef.current = mixer;

    const action = mixer.clipAction(selectedClip);
    action.reset();
    action.enabled = true;
    action.setLoop(LoopRepeat, Infinity);
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);
    action.fadeIn(0.2);
    action.play();
    scene.updateMatrixWorld(true);

    return () => {
      action.fadeOut(0.15);
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [scene, selectedClip]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return (
    <group
      position={groundAlignedPosition}
      rotation={character.modelRotation ?? [0, Math.PI, 0]}
    >
      <group position={[0, -pivotOffsetY, 0]} scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
