import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";

import { ACTION_KEYS, ACTION_TYPES, getActionKindLabel, pickWeightedAction, resolveActionByKey } from "../game/behavior.js";
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

function useBehaviorPlayback(behavior) {
  const [snapshot, setSnapshot] = useState(() => createPlaybackSnapshot(behavior));
  const [clock, setClock] = useState(() => Date.now());
  const timerRef = useRef(null);
  const lastPlayableClipRef = useRef("idle");

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const mainActions = behavior?.mainActions ?? [];
    const transitionActions = behavior?.transitionActions ?? [];
    const forcedAction = resolveActionByKey(behavior?.allActions, behavior?.forcedActionKey);

    if (!mainActions.length) {
      setSnapshot(createPlaybackSnapshot(behavior));
      return undefined;
    }

    let active = true;

    const applyAction = (action, phase, nextActionPreview = null, phaseDurationMs = null) => {
      if (!active || !action) return;

      const playableClipKey = action.playable ? action.clipKey : lastPlayableClipRef.current || "idle";
      if (action.playable && action.clipKey) {
        lastPlayableClipRef.current = action.clipKey;
      }

      setSnapshot((current) => ({
        ...current,
        phase,
        currentAction: action,
        currentActionType: phase === "wait" ? current.currentActionType : action.type,
        clipActionKey: playableClipKey,
        nextActionPreview,
        currentWeight: action.weight,
        currentSpeedMultiplier: action.clipSpeed,
        phaseEndsAt: phaseDurationMs ? Date.now() + phaseDurationMs : null,
      }));
    };

    const scheduleWait = (nextStage, currentAction, nextActionPreview) => {
      if (!active) return;

      const [minWait, maxWait] = behavior?.timing?.waitDurationRange ?? [1, 4];
      const waitMs = randomBetween(minWait, maxWait) * 1000;
      applyAction(currentAction, "wait", nextActionPreview, waitMs);

      timerRef.current = setTimeout(() => {
        if (!active) return;

        if (nextStage === "transition") {
          scheduleTransition(nextActionPreview?.key ?? null);
          return;
        }

        scheduleMain(nextActionPreview?.key ?? null);
      }, waitMs);
    };

    const scheduleMain = (previousMainKey = null) => {
      if (!active) return;

      const nextAction = pickWeightedAction(mainActions, previousMainKey) ?? resolveActionByKey(mainActions, behavior.defaultMainActionKey) ?? mainActions[0];
      const nextPreview = pickWeightedAction(transitionActions, behavior.defaultTransitionActionKey) ?? transitionActions[0] ?? null;
      const [minDuration, maxDuration] = nextAction.durationRange ?? behavior.timing.mainDurationRange;
      const actionMs = randomBetween(minDuration, maxDuration) * 1000;

      applyAction(nextAction, "main", nextPreview, actionMs);

      timerRef.current = setTimeout(() => {
        if (!active) return;
        scheduleWait("transition", nextAction, nextPreview);
      }, actionMs);
    };

    const scheduleTransition = (previousTransitionKey = null) => {
      if (!active) return;

      const nextAction =
        pickWeightedAction(transitionActions, previousTransitionKey) ??
        resolveActionByKey(transitionActions, behavior.defaultTransitionActionKey) ??
        transitionActions[0];
      const nextPreview = pickWeightedAction(mainActions, behavior.defaultMainActionKey) ?? mainActions[0] ?? null;
      const [minDuration, maxDuration] = nextAction.durationRange ?? behavior.timing.transitionDurationRange;
      const actionMs = randomBetween(minDuration, maxDuration) * 1000;

      applyAction(nextAction, "transition", nextPreview, actionMs);

      timerRef.current = setTimeout(() => {
        if (!active) return;
        scheduleWait("main", nextAction, nextPreview);
      }, actionMs);
    };

    if (forcedAction) {
      applyAction(forcedAction, forcedAction.type, null, null);
      return () => {
        active = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    scheduleMain();

    return () => {
      active = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [behavior?.signature]);

  return useMemo(() => {
    const remainingDuration = snapshot.phaseEndsAt ? Math.max(0, (snapshot.phaseEndsAt - clock) / 1000) : null;
    return {
      ...snapshot,
      remainingDuration,
    };
  }, [clock, snapshot]);
}

function createPlaybackSnapshot(behavior) {
  const fallbackAction = behavior?.mainActionMap?.[behavior?.defaultMainActionKey] ?? behavior?.mainActions?.[0] ?? null;

  return {
    phase: "idle",
    currentAction: fallbackAction,
    currentActionType: fallbackAction?.type ?? ACTION_TYPES.MAIN,
    clipActionKey: fallbackAction?.clipKey ?? "idle",
    nextActionPreview: null,
    currentWeight: fallbackAction?.weight ?? 0,
    currentSpeedMultiplier: fallbackAction?.clipSpeed ?? 1,
    remainingDuration: null,
    phaseEndsAt: null,
  };
}

export function CharacterStage({ character, state, onInteractionChange }) {
  const [rotation, setRotation] = useState(STAGE_LAYOUT.defaultRotation);
  const rotationRef = useRef(STAGE_LAYOUT.defaultRotation);
  const dragStartRef = useRef(STAGE_LAYOUT.defaultRotation);
  const playback = useBehaviorPlayback(state.behavior);

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
        <StageEffect effect={state.effect} mood={state.sceneMood} />
      </View>
      <StageCanvas>
        <AnimatedCharacter character={character} rotation={rotation} state={state} playback={playback} />
      </StageCanvas>
      {state.debugVisible ? <BehaviorDebugOverlay state={state} playback={playback} /> : null}
      <View style={styles.gestureHotspot} {...panResponder.panHandlers} />
    </View>
  );
}

function AnimatedCharacter({ character, rotation, state, playback }) {
  const rootRef = useRef(null);
  const actionKey = playback?.currentAction?.key ?? state.animationState ?? ACTION_KEYS.idle;
  const actionClipSpeed = playback?.currentSpeedMultiplier ?? state.animationSpeed ?? 1;
  const worldRotationSpeed = playback?.currentAction?.worldSpeed ?? 0;
  const clipAnimationState = playback?.clipActionKey ?? actionKey;

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
      <MiniWorld motionState={playback?.currentAction?.motionKind ?? actionKey} rotationSpeed={worldRotationSpeed} />

      <group position={[0, 0.16, 0]} scale={MINI_WORLD_LAYOUT.characterScale}>
        <GLBCharacterModel character={character} animationState={clipAnimationState} animationSpeed={actionClipSpeed} />
      </group>
    </group>
  );
}

function BehaviorDebugOverlay({ state, playback }) {
  const currentAction = playback?.currentAction;
  const nextPreview = playback?.nextActionPreview;

  return (
    <View style={styles.debugOverlay} pointerEvents="none">
      <DebugLine label="Current Short Term State" value={state.energyState ?? "n/a"} />
      <DebugLine label="Current Long Term State" value={state.longTermState ?? "n/a"} />
      <DebugLine label="Current Action" value={currentAction?.label ?? "idle"} />
      <DebugLine label="Current Action Type" value={playback?.phase === "wait" ? "Waiting" : getActionKindLabel(playback?.currentActionType)} />
      <DebugLine label="Current Weight" value={formatDebugNumber(playback?.currentWeight)} />
      <DebugLine label="Current Speed Multiplier" value={formatDebugNumber(playback?.currentSpeedMultiplier)} />
      <DebugLine label="Remaining Duration" value={formatDebugNumber(playback?.remainingDuration)} />
      <DebugLine label="Next Action Preview" value={nextPreview?.label ?? "none"} />
    </View>
  );
}

function DebugLine({ label, value }) {
  return (
    <View style={styles.debugLine}>
      <Text style={styles.debugLabel}>{label}</Text>
      <Text style={styles.debugValue}>{String(value)}</Text>
    </View>
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

function formatDebugNumber(value) {
  if (value == null || Number.isNaN(value)) return "n/a";
  if (typeof value === "number") return value.toFixed(2).replace(/\.00$/, "");
  return String(value);
}

function StageEffect({ effect, mood }) {
  if (effect === "cloudy") {
    return <CloudLayer speed={mood?.cloudSpeed ?? 0.28} />;
  }

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

function CloudLayer({ speed = 0.28 }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalMs = Math.max(160, 560 / Math.max(0.2, speed));
    const interval = setInterval(() => {
      setTick((value) => (value + 1) % 1000);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [speed]);

  const cloudShift = Math.sin(tick * 0.06) * Math.max(3, 7 * speed);
  const cloudDrift = Math.cos(tick * 0.03) * Math.max(2, 4 * speed);

  return (
    <>
      <View style={[styles.cloud, styles.cloudOne, { transform: [{ translateX: cloudShift }] }]} />
      <View style={[styles.cloud, styles.cloudTwo, { transform: [{ translateX: -cloudShift * 0.8 }] }]} />
      <View style={[styles.cloud, styles.cloudThree, { transform: [{ translateX: cloudDrift }] }]} />
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
  debugOverlay: {
    position: "absolute",
    left: 10,
    bottom: 10,
    zIndex: 20,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 240,
    backgroundColor: "rgba(20, 28, 40, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 4,
  },
  debugLine: {
    gap: 1,
  },
  debugLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 9,
    fontWeight: "700",
  },
  debugValue: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
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
  cloud: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.68)",
    opacity: 0.72,
  },
  cloudOne: {
    top: 34,
    left: 28,
    width: 68,
    height: 30,
  },
  cloudTwo: {
    top: 70,
    right: 26,
    width: 84,
    height: 34,
  },
  cloudThree: {
    top: 128,
    left: 48,
    width: 58,
    height: 24,
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
