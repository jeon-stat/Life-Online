export const STAGE_MODE = "character-only";

export const SKIN_TONE_PRESETS = [
  { id: "porcelain", label: "밝음 1", color: "#f4d4c2" },
  { id: "ivory", label: "밝음 2", color: "#eac2aa" },
  { id: "beige", label: "중간 1", color: "#d7a98e" },
  { id: "tan", label: "중간 2", color: "#b77f63" },
  { id: "deep", label: "깊음", color: "#8a5a45" },
];

export const CHARACTER_CLASSES = [
  {
    id: "custom-chibi",
    label: "\uB0B4 \uCE90\uB9AD\uD130",
    blurb: "\uC0B0\uCC45\uC5D0 \uB530\uB77C \uC870\uAE08\uC529 \uC560\uCC29\uC774 \uC313\uC774\uB294 \uB0B4 SD \uCE90\uB9AD\uD130",
    modelSignature: ["custom-glb", "blender-import"],
    modelUrl: "models/chibi_animated.glb",
    modelScale: [2.72, 2.72, 2.72],
    modelOffset: [0, 1.74, 0],
    modelPivotY: 0.62,
    modelRotation: [0, 0, 0],
    animationMap: {
      idle: "idle",
      walk: "walk",
      run: "run",
      tired: "tired",
    },
    defaultAnimation: "idle",
    palette: {
      primary: "#f3f4f6",
      secondary: "#ffffff",
      accent: "#585d66",
      hair: "#6b4a37",
      skin: "#f4d4c2",
      detail: "#1f232b",
      hat: "#d5d8de",
      trim: "#8d939c",
    },
  },
];
