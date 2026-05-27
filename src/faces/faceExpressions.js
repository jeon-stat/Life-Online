export const FACE_EXPRESSIONS = {
  normal: {
    id: "normal",
    anchorBone: "mixamorigHead",
    offset: [0, -0.03, 0.105],
    size: [0.185, 0.11],
  },
};

export function resolveFaceExpression() {
  return FACE_EXPRESSIONS.normal;
}
