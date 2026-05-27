import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AdminPanel } from "../components/AdminPanel.js";
import { CharacterStage } from "../components/CharacterStage";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { StepProgressCard } from "../components/StepProgressCard.js";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { LAST_UPDATED_LABEL } from "../generated/buildInfo.js";
import { buildCharacterViewModel } from "../game/characterState.js";

export function HomeScreen() {
  const { today, history, goal, admin } = useStepData();
  const character = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    const selectedSkinTone = admin?.skinTones?.find((tone) => tone.id === admin?.skinToneId);

    if (!selectedSkinTone) {
      return baseCharacter;
    }

    return {
      ...baseCharacter,
      palette: {
        ...baseCharacter.palette,
        skin: selectedSkinTone.color,
      },
      skinTone: selectedSkinTone.color,
    };
  }, [admin?.skinToneId, admin?.skinTones]);
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
          title="\uC624\uB298 \uC0C1\uD0DC"
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
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.lg,
    gap: 12,
    backgroundColor: "#ffffff",
  },
  updatedAt: {
    alignSelf: "flex-end",
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  stageWrap: {
    marginTop: 0,
    marginHorizontal: -theme.spacing.sm,
  },
});
