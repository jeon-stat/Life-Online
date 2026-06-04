import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { CharacterStage } from "../components/CharacterStage";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";

export function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
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

  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });
  const stageHeight = Math.max(600, Math.min(860, Math.round(windowHeight * 0.94)));
  const progressWidth = `${Math.max(0, Math.min(viewState.progressPercent, 100))}%`;

  return (
    <View style={[styles.screen, { backgroundColor: viewState.sceneBackground }]}>
      <View style={styles.stageWrap}>
        <CharacterStage character={character} state={viewState} height={stageHeight} />
      </View>

      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>오늘</Text>
          <Text style={styles.todayPercent}>{Math.round(viewState.progressPercent)}%</Text>
        </View>

        <View style={styles.todayRow}>
          <Text style={styles.todaySteps}>{formatNumber(viewState.steps)}</Text>
          <Text style={styles.todayGoal}>/ {formatNumber(viewState.goal)}보</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: progressWidth }]} />
        </View>
      </View>
    </View>
  );
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.colors.appBackground,
  },
  stageWrap: {
    flex: 1,
    marginHorizontal: -theme.spacing.sm,
    justifyContent: "flex-start",
  },
  todayCard: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: 14,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    gap: 10,
  },
  todayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
    fontFamily: theme.fonts.body,
  },
  todayPercent: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  todayRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  todaySteps: {
    color: theme.colors.ink,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    fontFamily: theme.fonts.display,
  },
  todayGoal: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
    paddingBottom: 4,
    fontFamily: theme.fonts.body,
  },
  track: {
    height: 10,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#efefed",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ink,
  },
});
