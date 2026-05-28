import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";

import {
  ACTION_KEYS,
  getActionDurationRange,
  pickWeightedAction,
  resolveActionByKey,
} from "../game/behavior.js";
import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { getRotationFromDrag } from "../scene/rotationMath.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

/**
 * 색상 조정
 * grass = 지구 색
 * path = 길 색
 */
const MINI_WORLD_THEME = {
  grass: "#8fbe70",
  /* #d89a4a #ff00ff #8fbe70 */
  path: "#d89a4a",
};

/**
 * 지구/캐릭터 전체 조정
 */
const MINI_WORLD_LAYOUT = {
  // 지구 크기. 커질수록 지구가 크게 보임.
  radius: 8.8,

  // 지구를 아래로 내리는 값. 더 음수면 지구가 아래로 내려감.
  centerOffsetY: -8.65,

  // 캐릭터 크기. 커질수록 캐릭터가 커짐.
  characterScale: 0.5,

  // 지구를 얼마나 보여줄지. Math.PI면 반구 정도.
  sphereThetaLength: Math.PI,
};

/**
 * 길 조정
 * 지금 목표: 캐릭터 발밑을 앞뒤로 지나는 "자오선 길"
 */
const MINI_WORLD_PATH = {
  // 길 폭. 커질수록 길이 넓어짐.
  halfWidth: 0.7,

  // 길을 지구 표면에서 얼마나 띄울지.
  // 길이 안 보이면 이 값을 올려라. 1.0 ~ 1.4까지 테스트.
  lift: 0.007,

  // 길이 지나가는 중심 X 위치.
  // 0이면 캐릭터 중앙 발밑. 좌우로 밀고 싶으면 -0.5 / 0.5 등으로 조정.
  centerX: 0,

  // 길 해상도. 높을수록 부드럽지만 무거움.
  segments: 128,

  // 길 폭 방향 분할. 높을수록 길 가장자리가 부드러움.
  stripSegments: 8,
};

function useBehaviorPlayback(behavior, motionOverride) {
  const [currentActionKey, setCurrentActionKey] = useState(
    () => resolveActionByKey(behavior?.actions, motionOverride)?.key ?? behavior?.defaultActionKey ?? ACTION_KEYS.idle,
  );
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const actions = behavior?.actions ?? [];
    if (!actions.length) {
      setCurrentActionKey(ACTION_KEYS.idle);
      return undefined;
    }

    const forcedAction = resolveActionByKey(actions, motionOverride);
    if (forcedAction) {
      setCurrentActionKey(forcedAction.key);
      return undefined;
    }

    let active = true;
    let previousActionKey = resolveActionByKey(actions, behavior?.defaultActionKey)?.key ?? actions[0].key;

    const scheduleNext = (forceActionKey = null, recovery = false) => {
      if (!active) return;

      const nextAction = forceActionKey
        ? resolveActionByKey(actions, forceActionKey)
        : pickWeightedAction(actions, previousActionKey) ?? actions[0];

      if (!nextAction) {
        setCurrentActionKey(ACTION_KEYS.idle);
        return;
      }

      previousActionKey = nextAction.key;
      setCurrentActionKey(nextAction.key);

      const [minWait, maxWait] = getActionDurationRange(nextAction, { recovery });
      const waitMs = randomBetween(minWait, maxWait) * 1000;
      timerRef.current = setTimeout(() => {
        if (!active) return;

        if (nextAction.key === ACTION_KEYS.run) {
          scheduleNext(ACTION_KEYS.walk, true);
          return;
        }

        scheduleNext();
      }, waitMs);
    };

    scheduleNext();

    return () => {
      active = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [behavior?.signature, behavior?.defaultActionKey, motionOverride]);

  return behavior?.actionMap?.[currentActionKey] ?? behavior?.actionMap?.[behavior?.defaultActionKey] ?? null;
}

export function CharacterStage({ character, state, onInteractionChange }) {
  const [rotation, setRotation] = useState(STAGE_LAYOUT.defaultRotation);
  const rotationRef = useRef(STAGE_LAYOUT.defaultRotation);
  const dragStartRef = useRef(STAGE_LAYOUT.defaultRotation);
  const currentAction = useBehaviorPlayback(state.behavior, state.motionOverride);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          dragStartRef.current = rotationRef.current;
          onInteractionChange?.(true);
        },
        onPanResponderMove: (_, gestureState) => {
          const nextRotation = getRotationFromDrag(
            dragStartRef.current,
            gestureState,
            STAGE_LAYOUT.rotationLimit,
          );

          rotationRef.current = nextRotation;
          setRotation(nextRotation);
        },
        onPanResponderRelease: () => {
          onInteractionChange?.(false);
        },
        onPanResponderTerminate: () => {
          onInteractionChange?.(false);
        },
      }),
    [onInteractionChange],
  );

  return (
    <View style={styles.shell}>
      <View style={[styles.glowBack, { backgroundColor: state.background?.[0] ?? "rgba(255,255,255,0.48)" }]} />
      <View style={styles.effectWrap} pointerEvents="none">
        <StageEffect effect={state.effect} />
      </View>
      <StageCanvas>
        <AnimatedCharacter character={character} rotation={rotation} state={state} currentAction={currentAction} />
      </StageCanvas>
      <View style={styles.gestureHotspot} {...panResponder.panHandlers} />
    </View>
  );
}

function AnimatedCharacter({ character, rotation, state, currentAction }) {
  const rootRef = useRef(null);
  const actionKey = currentAction?.key ?? state.animationState ?? ACTION_KEYS.idle;
  const actionClipSpeed = currentAction?.clipSpeed ?? state.animationSpeed ?? 1;
  const worldRotationSpeed = currentAction?.worldSpeed ?? 0;

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime() * actionClipSpeed;
    const bobAmount =
      actionKey === "walk" || actionKey === "run"
        ? state.bobAmount * 0.12
        : state.bobAmount * 0.08;

    rootRef.current.rotation.x = rotation.x;
    rootRef.current.rotation.y = rotation.y;
    rootRef.current.position.y = STAGE_LAYOUT.modelBaseY + Math.sin(t * 1.2) * bobAmount;

    const scalePulse = 1 + Math.sin(t * 0.7) * 0.015;
    rootRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  return (
    <group ref={rootRef} position={[0, STAGE_LAYOUT.modelBaseY, 0]}>
      <MiniWorld motionState={actionKey} rotationSpeed={worldRotationSpeed} />

      <group position={[0, 0.16, 0]} scale={MINI_WORLD_LAYOUT.characterScale}>
        <GLBCharacterModel character={character} animationState={actionKey} animationSpeed={actionClipSpeed} />
      </group>
    </group>
  );
}

function MiniWorld({ motionState, rotationSpeed = 0 }) {
  const worldRef = useRef(null);

  const pathGeometry = useMemo(
    () =>
      buildMeridianPathGeometry({
        radius: MINI_WORLD_LAYOUT.radius,
        halfWidth: MINI_WORLD_PATH.halfWidth,
        lift: MINI_WORLD_PATH.lift,
        centerX: MINI_WORLD_PATH.centerX,
        segments: MINI_WORLD_PATH.segments,
        stripSegments: MINI_WORLD_PATH.stripSegments,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!worldRef.current) return;

    // X축 회전 = 지구가 앞으로 굴러가며 길이 캐릭터 발밑을 지나감.
    worldRef.current.rotation.x -= getWorldRotationSpeed(motionState, rotationSpeed) * delta;
  });

  return (
    <group position={[0, MINI_WORLD_LAYOUT.centerOffsetY, 0]}>
      <group ref={worldRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry
            args={[
              MINI_WORLD_LAYOUT.radius,
              64,
              42,
              0,
              Math.PI * 2,
              0,
              MINI_WORLD_LAYOUT.sphereThetaLength,
            ]}
          />
          <meshStandardMaterial color={MINI_WORLD_THEME.grass} />
        </mesh>

        <mesh 
          geometry={pathGeometry}
          renderOrder={0}
        >
          <meshStandardMaterial
            color={MINI_WORLD_THEME.path}
            side={DoubleSide}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 캐릭터 발밑을 앞뒤로 지나는 자오선 길 geometry.
 *
 * x = 길의 좌우 폭
 * y/z = 구를 앞뒤로 감싸는 방향
 */
function buildMeridianPathGeometry({
  radius,
  halfWidth,
  lift,
  centerX,
  segments,
  stripSegments,
}) {
  const geometry = new BufferGeometry();
  const positions = [];
  const indices = [];

  for (let step = 0; step <= segments; step += 1) {
    const angle = (step / segments) * Math.PI * 2;

    for (let band = 0; band <= stripSegments; band += 1) {
      const t = band / stripSegments - 0.5;
      const x = centerX + t * halfWidth * 2;

      const point = projectMeridianBandPoint(radius + lift, x, angle);
      positions.push(point.x, point.y, point.z);

      if (step < segments && band < stripSegments) {
        const row = stripSegments + 1;
        const base = step * row + band;

        indices.push(base, base + 1, base + row);
        indices.push(base + 1, base + row + 1, base + row);
      }
    }
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * 자오선 길의 한 점을 구 표면 위로 투영.
 * 길이 안 보이면 lift를 올리면 된다.
 */
function projectMeridianBandPoint(radius, x, angle) {
  const safeX = Math.max(-radius * 0.85, Math.min(radius * 0.85, x));
  const yzRadius = Math.sqrt(radius * radius - safeX * safeX);

  return new Vector3(
    safeX,
    Math.cos(angle) * yzRadius,
    Math.sin(angle) * yzRadius,
  );
}

function getWorldRotationSpeed(motionState, rotationSpeed = 0) {
  if (rotationSpeed > 0) {
    return rotationSpeed;
  }

  switch (motionState) {
    case "run":
      return 0.26;
    case "walk":
      return 0.14;
    case "tired":
      return 0.004;
    case "idle":
    default:
      return 0.02;
  }
}

function randomBetween(min, max) {
  if (max <= min) return min;
  return min + Math.random() * (max - min);
}

function StageEffect({ effect }) {
  if (effect === "sparkle") {
    return (
      <>
        <View style={[styles.spark, styles.sparkOne]} />
        <View style={[styles.spark, styles.sparkTwo]} />
        <View style={[styles.spark, styles.sparkThree]} />
      </>
    );
  }

  if (effect === "sleepy") {
    return (
      <>
        <View style={[styles.orb, styles.orbOne]} />
        <View style={[styles.orb, styles.orbTwo]} />
      </>
    );
  }

  return (
    <>
      <View style={[styles.dot, styles.dotOne]} />
      <View style={[styles.dot, styles.dotTwo]} />
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: STAGE_LAYOUT.heroHeight,
    position: "relative",
    backgroundColor: "transparent",
  },
  glowBack: {
    position: "absolute",
    top: 32,
    left: "50%",
    marginLeft: -138,
    width: 276,
    height: 276,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  effectWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  gestureHotspot: {
    position: "absolute",
    left: "50%",
    top: 6,
    width: 292,
    height: STAGE_LAYOUT.heroHeight - 16,
    marginLeft: -146,
    backgroundColor: "transparent",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  },
  spark: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#ffd27b",
  },
  sparkOne: {
    top: 42,
    left: 44,
  },
  sparkTwo: {
    top: 88,
    right: 52,
  },
  sparkThree: {
    top: 156,
    left: 66,
  },
  orb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  orbOne: {
    top: 56,
    right: 42,
  },
  orbTwo: {
    top: 96,
    right: 22,
  },
  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  dotOne: {
    top: 76,
    left: 36,
  },
  dotTwo: {
    top: 126,
    right: 34,
  },
});
