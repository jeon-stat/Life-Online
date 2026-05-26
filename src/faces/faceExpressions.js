import normalEyesImage from "../../assets/faces/normal-eyes.png";

export const FACE_EXPRESSIONS = {
  normal: {
    id: "normal",
    image: normalEyesImage,
    position: [0, 0.43, 0.214],
    size: [0.28, 0.17],
  },
};

export function resolveFaceExpression() {
  return FACE_EXPRESSIONS.normal;
}
