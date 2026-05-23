export function getRotationFromDrag(startRotation, gesture, rotationLimit) {
  return {
    x: startRotation.x,
    y: startRotation.y + gesture.dx * rotationLimit.yStep,
  };
}
