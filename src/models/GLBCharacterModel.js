import { createPortal, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AnimationMixer, DoubleSide, LoopRepeat, SRGBColorSpace, TextureLoader } from "three";
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

export function GLBCharacterModel({ character, animationState = "idle", faceExpression = null }) {
  const gltf = useLoader(GLTFLoader, character.modelUrl);
  const mixerRef = useRef(null);
  const scale = character.modelScale ?? [3, 3, 3];
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
  const faceAnchor = useMemo(() => {
    if (!faceExpression?.anchorBone) return null;

    return gltf.scene.getObjectByName(faceExpression.anchorBone) ?? null;
  }, [faceExpression?.anchorBone, gltf.scene]);

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
      position={character.modelOffset ?? [0, -1, 0]}
      rotation={character.modelRotation ?? [0, Math.PI, 0]}
    >
      {faceExpression ? (
        <FaceExpressionPlane anchor={faceAnchor} faceExpression={faceExpression} />
      ) : null}
      <primitive
        object={scene}
        position={[0, -pivotOffsetY, 0]}
        scale={scale}
      />
    </group>
  );
}

function FaceExpressionPlane({ anchor, faceExpression }) {
  const textureSource = faceExpression.image?.uri ?? faceExpression.image;
  const texture = useLoader(TextureLoader, textureSource);
  const size = faceExpression.size ?? [2.18, 1.34];
  const position = anchor
    ? (faceExpression.anchorPosition ?? [0, 0.12, 0.14])
    : (faceExpression.position ?? [0, 0.92, 0.74]);

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const faceMesh = (
    <mesh position={position} renderOrder={8}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        alphaTest={0.05}
        depthWrite={false}
        map={texture}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );

  return anchor ? createPortal(faceMesh, anchor) : faceMesh;
}
