export function resolveAnimationState(status, override = null) {
  if (override) {
    return override;
  }

  if (status === "active") return "walk";
  if (status === "happy") return "happy";
  if (status === "tired") return "tired";
  return "idle";
}
