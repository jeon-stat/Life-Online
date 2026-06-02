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
  1: "졸림",
  2: "숨 고르기",
  3: "평온",
  4: "산책",
  5: "달리기",
  6: "최고",
};

const BACKGROUND_META = {
  LOW_ENERGY: { label: "조용한 배경", tone: "#f2f0ea" },
  NORMAL_ENERGY: { label: "편안한 배경", tone: "#eef3f7" },
  HIGH_ENERGY: { label: "활발한 배경", tone: "#edf8f0" },
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

  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });
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
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>오늘 상태</Text>
            <Text style={styles.cardPrimary}>{viewState.statusLabel}</Text>
          </View>

          <Text style={styles.cardSecondary}>{viewState.statusDescription}</Text>

          <View style={styles.metaGrid}>
            <MetaChip icon="⚡" value={`E${viewState.energyLevel} · ${ENERGY_STAGE_LABELS[viewState.energyLevel] ?? "?"}`} />
            <MetaChip icon="🎯" value={`${Math.round(viewState.progressPercent)}%`} />
            <MetaChip icon="👣" value={`${formatNumber(viewState.steps)}보`} />
          </View>

          <View style={styles.metaGridBottom}>
            <MetaLine label="배경" value={backgroundLabel} swatch={viewState.sceneBackground} />
            <MetaLine label="모션" value={currentActionLabel} />
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

function MetaChip({ icon, value }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function MetaLine({ label, value, swatch = null }) {
  return (
    <View style={styles.metaLine}>
      <Text style={styles.metaLineLabel}>{label}</Text>
      <View style={styles.metaLineValueRow}>
        {swatch ? <View style={[styles.metaSwatch, { backgroundColor: swatch }]} /> : null}
        <Text style={styles.metaLineValue} numberOfLines={1}>
          {value}
        </Text>
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
    gap: 12,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
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
  },
  metaChip: {
    flex: 1,
    minWidth: "30%",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  metaIcon: {
    fontSize: 14,
    fontWeight: "900",
  },
  metaValue: {
    color: theme.colors.ink,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
  metaGridBottom: {
    flexDirection: "row",
    gap: 10,
  },
  metaLine: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 4,
  },
  metaLineLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
  },
  metaLineValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaLineValue: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    flex: 1,
  },
  metaSwatch: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
});
