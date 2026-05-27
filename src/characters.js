export const STAGE_MODE = "character-only";

export const SKIN_TONE_PRESETS = [
  { id: "fair-ivory", label: "\uD1A4 1", color: "#f5e2d2" },
  { id: "soft-beige", label: "\uD1A4 2", color: "#ecd1bd" },
  { id: "light-beige", label: "\uD1A4 3", color: "#dfbea4" },
  { id: "warm-sand", label: "\uD1A4 4", color: "#d0ab89" },
  { id: "sand", label: "\uD1A4 5", color: "#ba946b" },
  { id: "honey", label: "\uD1A4 6", color: "#9f7a54" },
  { id: "cocoa", label: "\uD1A4 7", color: "#7c5a42" },
  { id: "deep-cocoa", label: "\uD1A4 8", color: "#5a4034" },
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
      skin: "#f5e2d2",
      detail: "#1f232b",
      hat: "#d5d8de",
      trim: "#8d939c",
    },
  },
];
