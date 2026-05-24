import { StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function DailySummaryCard({ title, primary, secondary, accent = false }) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={[styles.title, accent && styles.titleAccent]}>{title}</Text>
      <Text style={[styles.primary, accent && styles.primaryAccent]}>{primary}</Text>
      <Text style={[styles.secondary, accent && styles.secondaryAccent]}>{secondary}</Text>
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
  cardAccent: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  title: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  titleAccent: {
    color: "#d6deeb",
  },
  primary: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  primaryAccent: {
    color: "#ffffff",
  },
  secondary: {
    marginTop: 8,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  secondaryAccent: {
    color: "#dbe3ef",
  },
});
