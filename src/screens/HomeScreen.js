import { ScrollView, StyleSheet, View } from "react-native";

import { EditableLayoutItem } from "../dev/EditableLayoutItem.js";
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
        <EditableLayoutItem
          id="home-stage"
          enabled={admin?.visible}
          label="캐릭터"
          defaultLayout={{ x: 0, y: 0, scale: 1 }}
        >
          <View style={styles.stageWrap}>
            <CharacterStatusBubble
              text={viewState.bubbleText}
              bubbleSurface={viewState.bubbleSurface}
            />
            <CharacterStage character={character} state={viewState} />
          </View>
        </EditableLayoutItem>

        <EditableLayoutItem
          id="home-steps"
          enabled={admin?.visible}
          label="오늘 산책"
          defaultLayout={{ x: 0, y: 0, scale: 1 }}
        >
          <StepProgressCard
            steps={viewState.steps}
            goal={viewState.goal}
            progressPercent={viewState.progressPercent}
            statusLabel={viewState.statusLabel}
          />
        </EditableLayoutItem>

        <EditableLayoutItem
          id="home-summary"
          enabled={admin?.visible}
          label="오늘 상태"
          defaultLayout={{ x: 0, y: 0, scale: 1 }}
        >
          <DailySummaryCard
            title={"\uC624\uB298 \uC0C1\uD0DC"}
            primary={viewState.statusLabel}
            secondary={viewState.statusDescription}
            accent
          />
        </EditableLayoutItem>

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
