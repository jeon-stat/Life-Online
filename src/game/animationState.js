export function resolveAnimationState(status, override = null) {
  if (override) {
    return override;
  }

  if (status === "active") return "walk";
  if (status === "happy") return "run";
  if (status === "tired") return "tired";
  return "idle";
}
