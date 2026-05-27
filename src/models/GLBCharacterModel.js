import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AnimationMixer,
  Box3,
  CanvasTexture,
  Color,
  LoopRepeat,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import { resolveFaceExpression } from "../faces/faceExpressions.js";

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
  const faceMeshRef = useRef(null);
  const faceParentRef = useRef(null);
  const scale = character.modelScale ?? [3, 3, 3];
  const basePosition = character.modelOffset ?? [0, -1, 0];
  const pivotOffsetY = (character.modelPivotY ?? 0) * scale[1];
  const skinTone = character.skinTone ?? character.palette?.skin ?? null;
  const faceExpression = resolveFaceExpression(character, animationState);

  const scene = useMemo(() => {
    const baseScene = cloneSkeleton(gltf.scene);
    baseScene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        const tintedMaterials = materials.map((material) => {
          if (!material) return material;
          const nextMaterial = material.clone();

          if (skinTone && nextMaterial.color) {
            nextMaterial.color = new Color(skinTone);
          }

          return nextMaterial;
        });

        node.material = Array.isArray(node.material) ? tintedMaterials : tintedMaterials[0];
      }
    });
    return baseScene;
  }, [gltf.scene, skinTone]);
  const headBone = useMemo(
    () => scene.getObjectByName(faceExpression.anchorBone) ?? null,
    [faceExpression.anchorBone, scene],
  );
  const faceTexture = useMemo(() => buildFaceTexture(), []);

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

    if (!faceMeshRef.current || !faceParentRef.current || !headBone) {
      return;
    }

    headBone.updateWorldMatrix(true, false);

    const headWorld = headBone.getWorldPosition(new Vector3());
    const headQuaternion = headBone.getWorldQuaternion(new Quaternion());
    const parentQuaternion = faceParentRef.current.getWorldQuaternion(new Quaternion());
    const localQuaternion = parentQuaternion.invert().multiply(headQuaternion);

    const right = new Vector3(1, 0, 0).applyQuaternion(headQuaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(headQuaternion);
    const forward = new Vector3(0, 0, 1).applyQuaternion(headQuaternion);

    const faceWorld = headWorld
      .clone()
      .add(right.multiplyScalar(faceExpression.offset[0]))
      .add(up.multiplyScalar(faceExpression.offset[1]))
      .add(forward.multiplyScalar(faceExpression.offset[2]));

    const faceLocal = faceParentRef.current.worldToLocal(faceWorld);

    faceMeshRef.current.position.copy(faceLocal);
    faceMeshRef.current.quaternion.copy(localQuaternion);
  });

  return (
    <group
      position={groundAlignedPosition}
      rotation={character.modelRotation ?? [0, Math.PI, 0]}
    >
      <group ref={faceParentRef} position={[0, -pivotOffsetY, 0]} scale={scale}>
        <primitive object={scene} />
        <mesh ref={faceMeshRef} renderOrder={5}>
          <planeGeometry args={faceExpression.size} />
          <meshBasicMaterial
            map={faceTexture}
            transparent
            alphaTest={0.08}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function buildFaceTexture() {
  const canvas =
    globalThis.document?.createElement?.("canvas") ??
    new OffscreenCanvas(768, 384);

  canvas.width = 768;
  canvas.height = 384;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const eyes = [
    { x: 222, y: 224 },
    { x: 546, y: 224 },
  ];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const eye of eyes) {
    ctx.save();
    ctx.translate(eye.x, eye.y);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, 0, 88, 74, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.ellipse(0, 6, 44, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6d8fa4";
    ctx.beginPath();
    ctx.ellipse(0, 38, 28, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#a8c6d7";
    ctx.beginPath();
    ctx.ellipse(5, 44, 18, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-20, -24, 16, 22, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}
