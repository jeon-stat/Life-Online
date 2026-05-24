export const STAGE_MODE = "character-only";

export const CHARACTER_CLASSES = [
  {
    id: "custom-chibi",
    label: "My Chibi Character",
    blurb:
      "Your Blender-made character imported into the Life Online stage for direct app testing.",
    modelSignature: ["custom-glb", "blender-import"],
    modelUrl: "/models/character.glb",
    modelTargetHeight: 4.3,
    modelOffset: [0, -0.1, 0],
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
