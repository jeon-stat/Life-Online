export const CHARACTER_SCALE = 0.5;

export const STAGE_LAYOUT = {
  mode: "open-stage",
  surface: "full-bleed",
  background: "#ffffff",
  interaction: "drag-rotate",
  heroHeight: 430,
  cameraPosition: [0, 0.48, 6.6],
  fov: 26,
  defaultRotation: {
    x: 0.03,
    y: -0.24,
  },
  rotationLimit: {
    x: 0.5,
    yStep: 0.02,
    xStep: 0.01,
  },
};
