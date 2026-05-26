import normalEyesImage from "../../assets/faces/normal-eyes.png";

export const FACE_EXPRESSIONS = {
  normal: {
    id: "normal",
    image: normalEyesImage,
    top: 74,
    leftOffset: 0,
    width: 126,
    height: 84,
  },
};

export function resolveFaceExpression() {
  return FACE_EXPRESSIONS.normal;
}
