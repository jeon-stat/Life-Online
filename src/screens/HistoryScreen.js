import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { StepProgressCard } from "../components/StepProgressCard.js";

export function HistoryScreen() {
  const { today, history, goal } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <DailySummaryCard
        title={"\uC5F0\uC18D \uB2EC\uC131"}
        primary={`${viewState.streak}\uC77C`}
        secondary={"\uBCF5\uC7A1\uD55C \uCC28\uD2B8 \uB300\uC2E0 \uCD5C\uADFC 7\uC77C \uD750\uB984\uB9CC \uBCF4\uC5EC\uC90D\uB2C8\uB2E4."}
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{"\uCD5C\uADFC 7\uC77C \uAE30\uB85D"}</Text>
        {history
          .slice()
          .reverse()
          .map((record) => {
            const width = `${Math.max(8, Math.min((record.steps / goal) * 100, 100))}%`;

            return (
              <View key={record.id} style={styles.row}>
                <View style={styles.rowHead}>
                  <Text style={styles.day}>{formatShortDate(record.date)}</Text>
                  <Text style={styles.steps}>{`${record.steps.toLocaleString()}\uBCF4`}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width }]} />
                </View>
              </View>
            );
          })}
      </View>

      <StepProgressCard
        steps={viewState.steps}
        goal={goal}
        progressPercent={viewState.progressPercent}
        statusLabel={viewState.statusLabel}
      />
    </ScrollView>
  );
}

function formatShortDate(value) {
  const date = new Date(value);
  return `${date.getMonth() + 1}.${date.getDate()}`;
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
    marginBottom: theme.spacing.md,
  },
  row: {
    marginBottom: theme.spacing.md,
  },
  rowHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  day: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  steps: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  track: {
    height: 10,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#ece8e1",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ink,
  },
});
