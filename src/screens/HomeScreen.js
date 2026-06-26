import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { CharacterStage } from "../components/CharacterStage";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";

export function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const { today, history, goal, admin, device } = useStepData();

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
  const cameraPosition = [0, 1.56, 10.6];
  const progressWidth = `${Math.max(0, Math.min(viewState.progressPercent, 100))}%`;

  return (
    <View style={[styles.screen, { backgroundColor: viewState.sceneBackground }]} >
      <View style={styles.stageWrap}>
        <CharacterStage
          character={character}
          state={viewState}
          height={stageHeight}
          cameraPosition={cameraPosition}
        />
      </View>

      <View style={styles.todayInline} pointerEvents="none">
        <View style={styles.todayTextRow}>
          <Text style={styles.todaySteps}>{formatNumber(viewState.steps)}보</Text>
          <Text style={styles.todaySlash}>/</Text>
          <Text style={styles.todayGoal}>{formatNumber(viewState.goal)}보</Text>
          <Text style={styles.todayPercent}>{Math.round(viewState.progressPercent)}%</Text>
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: progressWidth }]} />
        </View>

        <View style={styles.deviceStatusCard}>
          <View style={styles.deviceStatusRow}>
            <Text style={styles.deviceStatusLabel}>걸음 연동</Text>
            <Text style={styles.deviceStatusValue}>{getDeviceStatusLabel(device)}</Text>
          </View>

          <View style={styles.deviceStatusRow}>
            <Text style={styles.deviceStatusLabel}>마지막 동기화</Text>
            <Text style={styles.deviceStatusValue}>{formatSyncLabel(device?.lastSyncAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function getDeviceStatusLabel(device) {
  if (device?.available === false) {
    return "사용 불가";
  }

  if (device?.permissionStatus === "granted") {
    return "연결됨";
  }

  if (device?.permissionStatus === "denied") {
    return "권한 필요";
  }

  if (device?.permissionStatus === "unavailable") {
    return "기기 미지원";
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

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${hours}:${minutes}`;
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
  todayInline: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: 84,
    gap: 10,
    alignItems: "center",
  },
  todayTextRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  todaySteps: {
    color: theme.colors.ink,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
    fontFamily: theme.fonts.display,
  },
  todaySlash: {
    color: theme.colors.muted,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  todayGoal: {
    color: theme.colors.inkSoft,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  todayPercent: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    paddingLeft: 6,
    fontFamily: theme.fonts.body,
  },
  track: {
    width: "72%",
    height: 10,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#efefed",
    alignSelf: "center",
  },
  deviceStatusCard: {
    width: "72%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  deviceStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  deviceStatusLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  deviceStatusValue: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ink,
  },
});
