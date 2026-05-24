import { StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function StepProgressCard({ steps, goal, progressPercent, statusLabel }) {
  const progressWidth = `${Math.max(0, Math.min(progressPercent, 100))}%`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{"\uC624\uB298 \uC0B0\uCC45"}</Text>
        <Text style={styles.status}>{statusLabel}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.steps}>{steps.toLocaleString()}</Text>
        <Text style={styles.goal}>/ {goal.toLocaleString()}\uBCF4</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: progressWidth }]} />
      </View>

      <Text style={styles.caption}>{`\uBAA9\uD45C \uB2EC\uC131\uB960 ${progressPercent}%`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  status: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
  },
  steps: {
    color: theme.colors.ink,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  goal: {
    marginLeft: 6,
    marginBottom: 5,
    color: theme.colors.muted,
    fontSize: 15,
    fontWeight: "800",
  },
  track: {
    marginTop: 18,
    height: 12,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#ebe6de",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  caption: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
  },
});
