import normalEyesImage from "../../assets/faces/normal-eyes.png";

export const FACE_EXPRESSIONS = {
  normal: {
    id: "normal",
    image: normalEyesImage,
    anchorBone: "mixamorigHead",
    anchorPosition: [0, 0.12, 0.14],
    position: [0, 0.92, 0.74],
    size: [0.44, 0.27],
  },
};

export function resolveFaceExpression() {
  return FACE_EXPRESSIONS.normal;
}
