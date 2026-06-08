export const STAGE_MODE = "character-only";

export const SKIN_TONE_PRESETS = [
  { id: "fair-1", label: "톤 1", color: "#f7d9cf" },
  { id: "fair-2", label: "톤 2", color: "#f4cbbb" },
  { id: "fair-3", label: "톤 3", color: "#efbda8" },
  { id: "fair-4", label: "톤 4", color: "#efb08f" },
  { id: "deep-1", label: "톤 5", color: "#f29d6d" },
  { id: "deep-2", label: "톤 6", color: "#d77c54" },
  { id: "deep-3", label: "톤 7", color: "#af6547" },
  { id: "deep-4", label: "톤 8", color: "#8d5543" },
];

export const CHARACTER_CLASSES = [
  {
    id: "custom-chibi",
    label: "내 캐릭터",
    blurb: "산책에 따라 조금씩 애착이 쌓이는 내 SD 캐릭터",
    modelSignature: ["custom-glb", "blender-import"],
    modelUrl: "models/chibi_animated.glb",
    modelScale: [2.72, 2.72, 2.72],
    modelOffset: [0, 1.74, 0],
    modelPivotY: 0.62,
    modelRotation: [0, 0, 0],
    animationMap: {
      energy0: "sitting-idle",
      energy1: "yawn",
      energy2: "breathing-idle",
      energy3: "neutral-idle",
      energy4: "walking",
      energy5: "running",
      energy6: "hip-hop-dancing",
      hipHopDancing: "hip-hop-dancing",
      moonwalk: "moonwalk",
    },
    defaultAnimation: "energy3",
    palette: {
      primary: "#f3f4f6",
      secondary: "#ffffff",
      accent: "#585d66",
      hair: "#6b4a37",
      skin: "#f7d9cf",
      detail: "#1f232b",
      hat: "#d5d8de",
      trim: "#8d939c",
    },
  },
];

