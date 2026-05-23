export function getRotationFromDrag(startRotation, gesture, rotationLimit) {
  return {
    x: clamp(
      startRotation.x + gesture.dy * rotationLimit.xStep,
      -rotationLimit.x,
      rotationLimit.x,
    ),
    y: startRotation.y + gesture.dx * rotationLimit.yStep,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
