import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CharacterStage } from "../components/CharacterStage";
import { StepProgressCard } from "../components/StepProgressCard.js";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { LAST_UPDATED_LABEL } from "../generated/buildInfo.js";
import { buildCharacterViewModel } from "../game/characterState.js";

const ENERGY_STAGE_LABELS = {
  0: "완전 휴식",
  1: "졸린 하루",
  2: "숨 고르기",
  3: "평온",
  4: "산책",
  5: "달리기",
  6: "최고 컨디션",
};

const BACKGROUND_META = {
  LOW_ENERGY: { label: "차분한 배경", tone: "#f2f0ea" },
  NORMAL_ENERGY: { label: "평온한 배경", tone: "#eef3f7" },
  HIGH_ENERGY: { label: "활기찬 배경", tone: "#edf8f0" },
};

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
    admin,
  });
  const currentActionLabel = viewState.currentAction?.label ?? viewState.animationClip ?? "Unknown";
  const backgroundLabel = BACKGROUND_META[viewState.backgroundState]?.label ?? "현재 배경";

  return (
    <View style={[styles.screen, { backgroundColor: viewState.sceneBackground }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: viewState.sceneBackground }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updatedAt}>{LAST_UPDATED_LABEL}</Text>

        <View style={styles.stageWrap}>
          <CharacterStage character={character} state={viewState} />
        </View>

        <View style={styles.todayCard}>
          <Text style={styles.cardKicker}>오늘</Text>
          <Text style={styles.cardTitle}>캐릭터 상태</Text>
          <Text style={styles.cardPrimary}>{viewState.statusLabel}</Text>
          <Text style={styles.cardSecondary}>{viewState.statusDescription}</Text>

          <View style={styles.metaGrid}>
            <MetaChip
              label="에너지 단계"
              value={`E${viewState.energyLevel} · ${ENERGY_STAGE_LABELS[viewState.energyLevel] ?? "알 수 없음"}`}
            />
            <MetaChip
              label="현재 배경"
              value={backgroundLabel}
              swatch={viewState.sceneBackground}
            />
            <MetaChip
              label="현재 애니메이션"
              value={currentActionLabel}
            />
          </View>
        </View>

        <StepProgressCard
          steps={viewState.steps}
          goal={viewState.goal}
          progressPercent={viewState.progressPercent}
          statusLabel={viewState.statusLabel}
        />
      </ScrollView>
    </View>
  );
}

function MetaChip({ label, value, swatch = null }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaLabel}>{label}</Text>
      <View style={styles.metaValueRow}>
        {swatch ? <View style={[styles.metaSwatch, { backgroundColor: swatch }]} /> : null}
        <Text style={styles.metaValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
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
  todayCard: {
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(215, 198, 176, 0.9)",
    gap: 8,
  },
  cardKicker: {
    color: "#c57c3a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  cardPrimary: {
    color: theme.colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  cardSecondary: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    width: "31.8%",
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  metaLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValueRow: {
    gap: 6,
  },
  metaSwatch: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  metaValue: {
    color: theme.colors.ink,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
});
