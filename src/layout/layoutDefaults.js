export const DEFAULT_LAYOUT_CONFIG = {
  stage: {
    x: 0,
    y: 0,
    scale: 1,
    width: 0,
    height: 292,
  },
  glow: {
    x: 0,
    y: 0,
    scale: 1,
    width: 184,
    height: 184,
  },
  bubble: {
    x: 0,
    y: 0,
    scale: 1,
    width: 140,
    height: 56,
  },
  stepsCard: {
    x: 0,
    y: 0,
    scale: 1,
    width: 0,
    height: 0,
  },
  summaryCard: {
    x: 0,
    y: 0,
    scale: 1,
    width: 0,
    height: 0,
  },
};

export function mergeLayoutConfig(baseConfig, nextConfig) {
  const merged = { ...baseConfig };

  for (const [key, value] of Object.entries(nextConfig ?? {})) {
    merged[key] = {
      ...(baseConfig?.[key] ?? {}),
      ...(value ?? {}),
    };
  }

  return merged;
}
