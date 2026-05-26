import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AdminPanel } from "../components/AdminPanel.js";
import { CharacterStage } from "../components/CharacterStage";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { StepProgressCard } from "../components/StepProgressCard.js";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";

const LAST_UPDATED_LABEL = "수정 2026-05-26 18:12";

export function HomeScreen() {
  const { today, history, goal, admin } = useStepData();
  const character = CHARACTER_CLASSES[0];
  const viewState = buildCharacterViewModel({
    todayRecord: today,
    history,
    goal,
    motionOverride: admin?.motionOverride ?? null,
  });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updatedAt}>{LAST_UPDATED_LABEL}</Text>

        <View style={styles.stageWrap}>
          <CharacterStage character={character} state={viewState} />
        </View>

        <StepProgressCard
          steps={viewState.steps}
          goal={viewState.goal}
          progressPercent={viewState.progressPercent}
          statusLabel={viewState.statusLabel}
        />

        <DailySummaryCard
          title="오늘 상태"
          primary={viewState.statusLabel}
          secondary={viewState.statusDescription}
          accent
        />

        <AdminPanel admin={admin} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
    backgroundColor: "#ffffff",
  },
  updatedAt: {
    alignSelf: "flex-end",
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  stageWrap: {
    marginTop: theme.spacing.xs,
    marginHorizontal: -theme.spacing.xs,
  },
});
