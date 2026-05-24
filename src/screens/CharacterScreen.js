import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { AdminPanel } from "../components/AdminPanel.js";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { theme } from "../constants/theme.js";

export function CharacterScreen() {
  const { today, history, goal, admin } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <DailySummaryCard
        title={"\uCE90\uB9AD\uD130 \uB808\uBCA8"}
        primary={`LV ${viewState.level}`}
        secondary={`${viewState.totalXp} XP · \uB2E4\uC74C \uC131\uC7A5\uAE4C\uC9C0 ${viewState.xpToNext} XP`}
        accent
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{"\uD604\uC7AC \uC0C1\uD0DC"}</Text>
        <Text style={styles.status}>{viewState.status}</Text>
        <Text style={styles.description}>{viewState.statusDescription}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{"XP \uC9C4\uD589\uB960"}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(6, viewState.levelProgress * 100)}%` }]} />
        </View>
        <Text style={styles.meta}>{`${viewState.xpIntoLevel} / 100 XP`}</Text>
      </View>

      <AdminPanel admin={admin} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  status: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 24,
    fontWeight: "900",
  },
  description: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
  track: {
    marginTop: 14,
    height: 12,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#ece8e1",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  meta: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
});
