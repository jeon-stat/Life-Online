import { ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { CHARACTER_CLASSES } from "../characters.js";
import { AdminPanel } from "../components/AdminPanel.js";
import { CharacterStage } from "../components/CharacterStage";
import { CharacterStatusBubble } from "../components/CharacterStatusBubble.js";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { StepProgressCard } from "../components/StepProgressCard.js";
import { theme } from "../constants/theme.js";

export function HomeScreen() {
  const { currentUser } = useAuth();
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
        <CharacterStatusBubble
          text={currentUser ? `${currentUser.nickname}, ${viewState.bubbleText}` : viewState.bubbleText}
          bubbleSurface={viewState.bubbleSurface}
        />

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
          title={"\uC624\uB298 \uC0C1\uD0DC"}
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
    backgroundColor: "#ffffff",
  },
  stageWrap: {
    marginTop: theme.spacing.sm,
    marginHorizontal: -theme.spacing.xs,
  },
});
