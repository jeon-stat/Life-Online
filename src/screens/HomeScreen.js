import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { CharacterStage } from "../components/CharacterStage";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";

export function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const { today, goal, growth, rewards, device, shop, characterViewState } = useStepData();

  const character = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    const selectedSkinTone =
      shop.items.skinTone.find((tone) => tone.id === shop.skinToneId) ??
      shop.items.skinTone[0] ??
      null;

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
  }, [shop.items.skinTone, shop.skinToneId]);

  const stageHeight = Math.max(420, Math.min(680, Math.round(windowHeight * 0.56)));
  const nextRewards = characterViewState.nextRewards ?? [];
  const nextRewardNames = nextRewards.length ? nextRewards.map((reward) => reward.name).join(", ") : "최종 레벨 보상";
  const gaugeWidth = `${Math.max(0, Math.min(100, Math.round(characterViewState.levelProgress * 100)))}%`;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: characterViewState.sceneBackground }]} contentContainerStyle={styles.content}>
      <View style={styles.stageWrap}>
        <CharacterStage character={character} state={characterViewState} height={stageHeight} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroEyebrow}>작은 세계 성장도</Text>
            <Text style={styles.heroLevel}>Lv.{growth.currentLevel}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>최고 Lv.{growth.highestLevelReached}</Text>
          </View>
        </View>

        <Text style={styles.heroDescription}>{characterViewState.growthDescription}</Text>

        <View style={styles.gaugeTrack}>
          <View style={[styles.gaugeFill, { width: gaugeWidth }]} />
        </View>

        <View style={styles.heroBottomRow}>
          <Text style={styles.heroPoints}>
            성장 포인트 {growth.growthPoints} / {growth.pointsRequired}
          </Text>
          <Text style={styles.heroNextReward}>다음 보상: {nextRewardNames}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <InfoCard
          title="오늘 걸음"
          value={`${formatNumber(today.steps)} / ${formatNumber(goal)}보`}
          detail={`${Math.round(characterViewState.todayProjection.ratio * 100)}% 달성`}
        />
        <InfoCard
          title="오늘 예상 결과"
          value={characterViewState.statusLabel}
          detail={characterViewState.bubbleText}
          accent={characterViewState.todayProjection.finalResult === "GROW"}
        />
        <InfoCard
          title="이번 주 휴식권"
          value={growth.weeklyRestUsed ? "이미 사용함" : "사용 가능"}
          detail={`성장 ${growth.weeklySummary?.growCount ?? 0}일 · 유지 ${growth.weeklySummary?.keepCount ?? 0}일`}
        />
        <InfoCard
          title="현재 선택"
          value={characterViewState.currentAction?.label ?? "기본 자세"}
          detail={characterViewState.selectedPet?.label ?? characterViewState.selectedExpression?.label ?? "콘텐츠 선택 가능"}
        />
      </View>

      {characterViewState.todayProjection.finalResult === "GROW" ? (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationTitle}>목표 달성 중</Text>
          <Text style={styles.celebrationText}>오늘이 이대로 끝나면 성장 포인트가 1 올라가고 세계가 더 풍성해져요.</Text>
        </View>
      ) : null}

      <View style={styles.nextLevelCard}>
        <Text style={styles.sectionTitle}>다음 레벨 보상</Text>
        {nextRewards.length ? (
          nextRewards.map((reward) => (
            <View key={reward.id} style={styles.rewardRow}>
              <View>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
              </View>
              <Text style={styles.rewardPreview}>{reward.preview}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.rewardDescription}>Lv.20에 도달했어요. 이제 지금의 세계를 계속 지켜 주세요.</Text>
        )}
      </View>

      <View style={styles.deviceRow}>
        <Text style={styles.deviceText}>걸음 연동: {getDeviceStatusLabel(device)}</Text>
        <Text style={styles.deviceText}>마지막 동기화: {formatSyncLabel(device.lastSyncAt)}</Text>
      </View>
    </ScrollView>
  );
}

function InfoCard({ title, value, detail, accent = false }) {
  return (
    <View style={[styles.infoCard, accent && styles.infoCardAccent]}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoDetail}>{detail}</Text>
    </View>
  );
}

function getDeviceStatusLabel(device) {
  if (device?.available === false) {
    return "기기 미지원";
  }

  if (device?.permissionStatus === "granted") {
    return "연결됨";
  }

  if (device?.permissionStatus === "denied") {
    return "권한 필요";
  }

  if (device?.permissionStatus === "unavailable") {
    return "사용 불가";
  }

  return "확인 중";
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

function formatSyncLabel(value) {
  if (!value) {
    return "아직 없음";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "아직 없음";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}.${day} ${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 104,
  },
  stageWrap: {
    minHeight: 400,
    justifyContent: "center",
  },
  heroCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: -12,
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroEyebrow: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  heroLevel: {
    color: theme.colors.ink,
    fontSize: 30,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  heroBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#111111",
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  heroDescription: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  gaugeTrack: {
    height: 12,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#ebe8de",
  },
  gaugeFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: "#7ba85f",
  },
  heroBottomRow: {
    gap: 6,
  },
  heroPoints: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  heroNextReward: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  statsGrid: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: 10,
  },
  infoCard: {
    borderRadius: theme.radius.lg,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  infoCardAccent: {
    borderColor: "#8fbe70",
    backgroundColor: "#f6fbf2",
  },
  infoTitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  infoValue: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  infoDetail: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  celebrationCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: "#111111",
    gap: 6,
  },
  celebrationTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  celebrationText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  nextLevelCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
  },
  rewardName: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  rewardDescription: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  rewardPreview: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  deviceRow: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: 4,
  },
  deviceText: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
