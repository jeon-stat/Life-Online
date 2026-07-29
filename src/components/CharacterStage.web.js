import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Vector3 } from "three";

import { GLBCharacterModel } from "../models/GLBCharacterModel.js";
import { StageCanvas } from "../scene/StageCanvas.web.js";
import { getRotationFromDrag } from "../scene/rotationMath.js";
import { STAGE_LAYOUT } from "../scene/stageConfig.js";

const MINI_WORLD_THEME = {
  grass: "#8fbe70",
  path: "#d89a4a",
};

const MINI_WORLD_LAYOUT = {
  radius: 8.8,
  centerOffsetY: -8.65,
  characterScale: 0.5,
  sphereThetaLength: Math.PI,
};

const MINI_WORLD_PATH = {
  halfWidth: 0.7,
  lift: 0.007,
  centerX: 0,
  segments: 128,
  stripSegments: 8,
};

const PRESENTATION_PRESETS = {
  full: {
    stageHeight: STAGE_LAYOUT.heroHeight,
    glowBackTop: 32,
    glowBackSize: 276,
    gestureTop: 128,
    gestureWidth: 292,
    gestureBottomInset: 128,
    cameraPosition: STAGE_LAYOUT.cameraPosition,
    fov: STAGE_LAYOUT.fov,
    modelBaseY: STAGE_LAYOUT.modelBaseY,
    miniWorld: MINI_WORLD_LAYOUT,
    characterScale: MINI_WORLD_LAYOUT.characterScale,
    interactionEnabled: true,
  },
  thumbnail: {
    stageHeight: 160,
    glowBackTop: 20,
    glowBackSize: 196,
    gestureTop: 0,
    gestureWidth: 0,
    gestureBottomInset: 0,
    cameraPosition: [0, 1.42, 7.9],
    fov: 25,
    modelBaseY: -0.9,
    miniWorld: {
      ...MINI_WORLD_LAYOUT,
      radius: 6.2,
      centerOffsetY: -6.1,
      characterScale: 0.57,
    },
    characterScale: 0.62,
    interactionEnabled: false,
  },
};

export function CharacterStage({
  character,
  state,
  onInteractionChange,
  scale = 1,
  presentation = "full",
  height: heightOverride = null,
  cameraPosition: cameraPositionOverride = null,
  fov: fovOverride = null,
  miniWorld: miniWorldOverride = null,
  interactionEnabled: interactionEnabledOverride = null,
  showGlowBack = true,
}) {
  const preset = PRESENTATION_PRESETS[presentation] ?? PRESENTATION_PRESETS.full;
  const stageHeight = heightOverride ?? Math.round(preset.stageHeight * scale);
  const appliedScale = heightOverride ? 1 : scale;
  const cameraPosition = cameraPositionOverride ?? preset.cameraPosition;
  const fov = fovOverride ?? preset.fov;
  const glowBackTop = Math.round(preset.glowBackTop * appliedScale);
  const glowBackSize = Math.round(preset.glowBackSize * appliedScale);
  const glowBackHalf = Math.round(glowBackSize / 2);
  const gestureTop = Math.round(preset.gestureTop * appliedScale);
  const gestureWidth = Math.round(preset.gestureWidth * appliedScale);
  const gestureLeft = Math.round(-gestureWidth / 2);
  const gestureBottomInset = Math.round((preset.gestureBottomInset ?? 0) * appliedScale);
  const gestureHeight = Math.max(0, stageHeight - gestureTop - gestureBottomInset);
  const [rotation, setRotation] = useState(STAGE_LAYOUT.defaultRotation);
  const rotationRef = useRef(STAGE_LAYOUT.defaultRotation);
  const dragStartRef = useRef(STAGE_LAYOUT.defaultRotation);
  const actionKey = state?.animationState ?? state?.currentAction?.animationKey ?? character.defaultAnimation ?? "energy3";
  const actionMotionKind = state?.currentAction?.motionKind ?? "neutral";

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
          const nextRotation = getRotationFromDrag(dragStartRef.current, gestureState, STAGE_LAYOUT.rotationLimit);
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
  const interactionEnabled = interactionEnabledOverride ?? preset.interactionEnabled;

  return (
    <View style={[styles.shell, { height: stageHeight }]}>
      {showGlowBack ? (
        <View
          style={[
            styles.glowBack,
            {
              top: glowBackTop,
              width: glowBackSize,
              height: glowBackSize,
              marginLeft: -glowBackHalf,
              backgroundColor: state?.background?.[0] ?? "rgba(255,255,255,0.48)",
            },
          ]}
        />
      ) : null}

      <View style={styles.effectWrap} pointerEvents="none">
        <StageEffect effect={state?.effect} mood={state?.sceneMood} />
      </View>

      <StageCanvas cameraPosition={cameraPosition} fov={fov}>
        <AnimatedCharacter
          character={character}
          rotation={rotation}
          state={state}
          actionKey={actionKey}
          actionMotionKind={actionMotionKind}
          modelBaseY={preset.modelBaseY}
          miniWorld={miniWorldOverride ?? preset.miniWorld}
          characterScale={preset.characterScale}
        />
      </StageCanvas>

      {state?.debugVisible ? <BehaviorDebugOverlay state={state} actionKey={actionKey} /> : null}

      {interactionEnabled ? (
        <View
          style={[
            styles.gestureHotspot,
            {
              top: gestureTop,
              width: gestureWidth,
              height: gestureHeight,
              marginLeft: gestureLeft,
            },
          ]}
          {...panResponder.panHandlers}
        />
      ) : null}
    </View>
  );
}

function AnimatedCharacter({ character, rotation, state, actionKey, actionMotionKind, modelBaseY, miniWorld, characterScale }) {
  const rootRef = useRef(null);
  const actionClipSpeed = state?.animationSpeed ?? 1;

  useFrame((frameState) => {
    if (!rootRef.current) return;

    const t = frameState.clock.getElapsedTime() * actionClipSpeed;
    const bobAmount = actionMotionKind === "run" ? (state?.bobAmount ?? 0.04) * 0.14 : actionMotionKind === "walk" ? (state?.bobAmount ?? 0.04) * 0.1 : (state?.bobAmount ?? 0.04) * 0.08;

    rootRef.current.rotation.x = rotation.x;
    rootRef.current.rotation.y = rotation.y;
    rootRef.current.position.y = modelBaseY + Math.sin(t * 1.2) * bobAmount;

    const scalePulse = 1 + Math.sin(t * 0.7) * 0.015;
    rootRef.current.scale.set(scalePulse, scalePulse, scalePulse);
  });

  return (
    <group ref={rootRef} position={[0, modelBaseY, 0]}>
      <MiniWorld motionState={actionMotionKind} layout={miniWorld} />
      <PetCompanion pet={state?.selectedPet} specialUnlocked={state?.behavior?.petSpecialUnlocked} celebratory={state?.todayProjection?.finalResult === "GROW"} />
      <group position={[0, 0.16, 0]} scale={characterScale}>
        <GLBCharacterModel
          character={character}
          animationState={actionKey}
          animationSpeed={actionClipSpeed}
          loopMode="repeat"
        />
      </group>
    </group>
  );
}

function PetCompanion({ pet, specialUnlocked = false, celebratory = false }) {
  const petRef = useRef(null);

  useFrame((frameState) => {
    if (!petRef.current || !pet) return;

    const t = frameState.clock.getElapsedTime();
    const hover = celebratory ? 0.28 : 0.18;
    const speed = specialUnlocked ? 1.8 : 1.2;
    petRef.current.position.x = Math.cos(t * speed) * 1.2;
    petRef.current.position.y = 2.1 + Math.sin(t * speed * 1.4) * hover;
    petRef.current.position.z = Math.sin(t * speed) * 0.5;
  });

  if (!pet) {
    return null;
  }

  return (
    <group ref={petRef} position={[1.2, 2.1, 0]}>
      <mesh>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color={pet.color} emissive={pet.accent} emissiveIntensity={0.12} />
      </mesh>
      {pet.shape === "cloud" ? (
        <mesh position={[0.18, 0.02, 0]}>
          <sphereGeometry args={[0.12, 18, 18]} />
          <meshStandardMaterial color={pet.accent} />
        </mesh>
      ) : null}
      {pet.shape === "lantern" ? (
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.05, 0.14, 0.05]} />
          <meshStandardMaterial color="#5b3a1a" />
        </mesh>
      ) : null}
    </group>
  );
}

function BehaviorDebugOverlay({ state, actionKey }) {
  return (
    <View style={styles.debugOverlay} pointerEvents="none">
      <DebugLine label="Level" value={state?.level ?? "n/a"} />
      <DebugLine label="Action" value={actionKey ?? "n/a"} />
      <DebugLine label="Projection" value={state?.todayProjection?.finalResult ?? "n/a"} />
      <DebugLine label="Background" value={state?.backgroundState ?? "n/a"} />
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

function MiniWorld({ motionState, rotationSpeed = 0, layout = MINI_WORLD_LAYOUT }) {
  const worldRef = useRef(null);

  const pathGeometry = useMemo(
    () =>
      buildMeridianPathGeometry({
        radius: layout.radius,
        halfWidth: MINI_WORLD_PATH.halfWidth,
        lift: MINI_WORLD_PATH.lift,
        centerX: MINI_WORLD_PATH.centerX,
        segments: MINI_WORLD_PATH.segments,
        stripSegments: MINI_WORLD_PATH.stripSegments,
      }),
    [layout.radius],
  );

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    worldRef.current.rotation.x -= getWorldRotationSpeed(motionState, rotationSpeed) * delta;
  });

  return (
    <group position={[0, layout.centerOffsetY, 0]}>
      <group ref={worldRef}>
        <mesh>
          <sphereGeometry
            args={[
              layout.radius,
              64,
              42,
              0,
              Math.PI * 2,
              0,
              layout.sphereThetaLength,
            ]}
          />
          <meshStandardMaterial color={MINI_WORLD_THEME.grass} />
        </mesh>

        <mesh geometry={pathGeometry} renderOrder={0}>
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

function buildMeridianPathGeometry({ radius, halfWidth, lift, centerX, segments, stripSegments }) {
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

function projectMeridianBandPoint(radius, x, angle) {
  const safeX = Math.max(-radius * 0.85, Math.min(radius * 0.85, x));
  const yzRadius = Math.sqrt(radius * radius - safeX * safeX);

  return new Vector3(safeX, Math.cos(angle) * yzRadius, Math.sin(angle) * yzRadius);
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
    default:
      return 0.02;
  }
}

function StageEffect({ effect, mood }) {
  if (effect === "sparkle") {
    return (
      <>
        <View style={[styles.spark, styles.sparkOne]} />
        <View style={[styles.spark, styles.sparkTwo]} />
        <View style={[styles.spark, styles.sparkThree]} />
      </>
    );
  }

  if (effect === "cloudy") {
    return (
      <>
        <View style={[styles.cloud, styles.cloudOne, { opacity: mood?.cloudSpeed ?? 0.7 }]} />
        <View style={[styles.cloud, styles.cloudTwo, { opacity: mood?.cloudSpeed ?? 0.7 }]} />
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
  cloud: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
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
});
