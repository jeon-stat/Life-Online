export function resolveAnimationState(defaultAction = "idle", override = null) {
  if (override) {
    return override;
  }

  return defaultAction ?? "idle";
}
