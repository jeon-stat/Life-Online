import { ScrollView, StyleSheet, View } from "react-native";

import { LayoutOverlay } from "../admin/LayoutOverlay.js";
import { EditableFrame } from "../admin/EditableFrame.js";
import { useDragLayoutEditor } from "../admin/useDragLayoutEditor.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { CHARACTER_CLASSES } from "../characters.js";
import { AdminPanel } from "../components/AdminPanel.js";
import { CharacterStage } from "../components/CharacterStage";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { StepProgressCard } from "../components/StepProgressCard.js";
import { theme } from "../constants/theme.js";

export function HomeScreen() {
  const { today, history, goal, admin } = useStepData();
  const editor = useDragLayoutEditor({ enabled: Boolean(admin?.visible) });
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
        <EditableFrame
          id="stage"
          label="캐릭터"
          enabled={editor.enabled}
          selected={editor.selectedId === "stage"}
          layout={editor.layoutConfig.stage}
          onSelect={editor.setSelectedId}
          onChange={editor.updateItem}
        >
          <View style={styles.stageWrap}>
            <CharacterStage
              character={character}
              state={viewState}
              glowLayout={editor.layoutConfig.glow}
              glowEditable={editor.enabled}
              glowSelected={editor.selectedId === "glow"}
              onSelectGlow={editor.setSelectedId}
              onChangeGlow={editor.updateItem}
            />
          </View>
        </EditableFrame>

        <EditableFrame
          id="stepsCard"
          label="오늘 산책"
          enabled={editor.enabled}
          selected={editor.selectedId === "stepsCard"}
          layout={editor.layoutConfig.stepsCard}
          onSelect={editor.setSelectedId}
          onChange={editor.updateItem}
        >
          <StepProgressCard
            steps={viewState.steps}
            goal={viewState.goal}
            progressPercent={viewState.progressPercent}
            statusLabel={viewState.statusLabel}
          />
        </EditableFrame>

        <EditableFrame
          id="summaryCard"
          label="오늘 상태"
          enabled={editor.enabled}
          selected={editor.selectedId === "summaryCard"}
          layout={editor.layoutConfig.summaryCard}
          onSelect={editor.setSelectedId}
          onChange={editor.updateItem}
        >
          <DailySummaryCard
            title="오늘 상태"
            primary={viewState.statusLabel}
            secondary={viewState.statusDescription}
            accent
          />
        </EditableFrame>

        <LayoutOverlay editor={editor} />
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
