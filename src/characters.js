export const STAGE_MODE = "character-only";

export const SKIN_TONE_PRESETS = [
  { id: "fair-rose", label: "\uD1A4 1", color: "#f7d8cd" },
  { id: "fair-peach", label: "\uD1A4 2", color: "#efc5b3" },
  { id: "light-beige", label: "\uD1A4 3", color: "#e4b19b" },
  { id: "warm-beige", label: "\uD1A4 4", color: "#d79a82" },
  { id: "soft-tan", label: "\uD1A4 5", color: "#c68268" },
  { id: "golden-tan", label: "\uD1A4 6", color: "#a86a54" },
  { id: "rich-brown", label: "\uD1A4 7", color: "#7f4c3c" },
  { id: "deep-umber", label: "\uD1A4 8", color: "#4f312a" },
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
      skin: "#f7d8cd",
      detail: "#1f232b",
      hat: "#d5d8de",
      trim: "#8d939c",
    },
  },
];
