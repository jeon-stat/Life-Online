import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { AdminPanel } from "../components/AdminPanel.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { getEnergyLevel } from "../game/stepRules.js";
import { theme } from "../constants/theme.js";

const LONG_TERM_META = {
  WEAK: {
    label: "허약",
    description: "아직은 자주 쉬고 싶어해요.",
    color: "#b06d57",
    softBg: "#fff3ee",
    border: "#f0d1c5",
  },
  HEALTHY: {
    label: "건강",
    description: "안정적으로 산책할 수 있어요.",
    color: "#4f7a57",
    softBg: "#eef8ee",
    border: "#cfe8cf",
  },
  ACTIVE: {
    label: "활발",
    description: "움직임이 가볍고 에너지가 넘쳐요.",
    color: "#c06b3e",
    softBg: "#fff2e4",
    border: "#f3d0b0",
  },
};

const ENERGY_STAGE_LABELS = {
  0: "완전 휴식",
  1: "졸린 하루",
  2: "숨 고르기",
  3: "평온",
  4: "산책",
  5: "달리기",
  6: "최고 컨디션",
};

const CUSTOMIZATION_SLOTS = [
  { key: "hair", label: "헤어", blurb: "준비 중" },
  { key: "clothes", label: "의상", blurb: "준비 중" },
  { key: "expression", label: "표정", blurb: "준비 중" },
  { key: "background", label: "배경", blurb: "준비 중" },
];

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function CharacterScreen() {
  const { currentUser, signOut } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });
  const recentMemories = viewState.memories.slice(0, 2);
  const weeklyHistory = history.slice(0, 7);
  const weeklySummary = buildWeeklySummary(weeklyHistory, goal, viewState.growth.streak);
  const recentLogs = buildRecentLogs(weeklyHistory, goal, weeklySummary);
  const profileName = currentUser?.nickname?.trim() || "내 산책 파트너";
  const profileHandle = currentUser?.handle ? `@${currentUser.handle}` : "@walk";
  const longTermMeta = LONG_TERM_META[viewState.longTermState] ?? LONG_TERM_META.HEALTHY;
  const energy6Count = weeklySummary.energy6Count;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileCopy}>
            <Text style={styles.profileKicker}>내 산책 파트너</Text>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileHandle}>{profileHandle}</Text>
          </View>

          <View style={[styles.stateBadge, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
            <Text style={styles.stateBadgeLabel}>장기 상태</Text>
            <Text style={[styles.stateBadgeValue, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
          </View>
        </View>

        <View style={styles.profileGrid}>
          <InfoTile label="누적 걸음 수" value={`${formatNumber(viewState.growth.lifetimeSteps)}보`} />
          <InfoTile label="목표 달성일" value={`${viewState.growth.achievedDays}일`} />
          <InfoTile label="연속 산책일" value={`${viewState.growth.streak}일`} />
          <InfoTile label="최고 에너지 6" value={`${energy6Count}회`} />
        </View>

        <View style={styles.profileFooter}>
          <Text style={styles.profileFooterText}>RPG 성장표 대신, 캐릭터의 생활 기록을 차곡차곡 보여줘요.</Text>
          <Pressable onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutLabel}>로그아웃</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="장기 상태"
          subtitle="누적 걸음 기반으로 허약, 건강, 활발의 느낌을 보여줘요."
        />

        <View style={[styles.longTermBanner, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
          <Text style={[styles.longTermBannerLabel, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
          <Text style={styles.longTermBannerDescription}>{longTermMeta.description}</Text>
        </View>

        <View style={styles.stateLegendRow}>
          {Object.entries(LONG_TERM_META).map(([key, meta]) => {
            const active = key === viewState.longTermState;
            return (
              <View key={key} style={[styles.stateLegendChip, active && styles.stateLegendChipActive]}>
                <Text style={[styles.stateLegendChipLabel, active && styles.stateLegendChipLabelActive]}>{meta.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="생활 기록"
          subtitle="최근 일주일의 산책 흐름을 한눈에 보여주는 요약이에요."
        />

        <View style={styles.metricGrid}>
          <MetricCard label="이번 주 총 걸음 수" value={`${formatNumber(weeklySummary.totalSteps)}보`} />
          <MetricCard label="하루 평균 걸음 수" value={`${formatNumber(weeklySummary.averageSteps)}보`} />
          <MetricCard label="가장 많이 걸은 날" value={weeklySummary.bestDayLabel} />
          <MetricCard label="최고 에너지 단계" value={`${weeklySummary.maxEnergyLevel}단계`} />
        </View>

        <View style={styles.summarySentenceCard}>
          <Text style={styles.summarySentence}>{weeklySummary.narrative}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="최근 산책 로그"
          subtitle="이번 주에 어떤 흐름이었는지 짧게 읽을 수 있게 정리했어요."
        />

        <View style={styles.logList}>
          {recentLogs.map((entry) => (
            <View key={entry.key} style={styles.logItem}>
              <View style={[styles.logPill, { backgroundColor: `${entry.tone}18` }]}>
                <Text style={[styles.logPillText, { color: entry.tone }]}>{entry.shortDate}</Text>
              </View>
              <Text style={styles.logText}>{entry.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="피부색"
          subtitle="현재는 관리자 상태를 재사용해서 캐릭터 바디 전체에 반영해요."
        />

        <View style={styles.skinToneGrid}>
          {(admin.skinTones ?? []).map((tone) => {
            const selected = admin.skinToneId === tone.id;

            return (
              <Pressable
                key={tone.id}
                onPress={() => admin.setSkinTone?.(tone.id)}
                style={[styles.skinToneChip, selected && styles.skinToneChipSelected]}
              >
                <View style={[styles.skinToneSwatch, { backgroundColor: tone.color }]} />
                <View style={styles.skinToneTextBlock}>
                  <Text style={styles.skinToneLabel}>{tone.label}</Text>
                  <Text style={styles.skinToneNote}>{selected ? "선택됨" : "적용"}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="커스터마이징"
          subtitle="헤어, 의상, 표정, 배경은 나중에 파츠형으로 확장할 수 있게 자리만 마련해뒀어요."
        />

        <View style={styles.customizationGrid}>
          {CUSTOMIZATION_SLOTS.map((slot) => (
            <View key={slot.key} style={styles.placeholderCard}>
              <Text style={styles.placeholderLabel}>{slot.label}</Text>
              <Text style={styles.placeholderTitle}>{slot.blurb}</Text>
              <Text style={styles.placeholderText}>추후 해금/컬렉션/유료화 구조로 이어질 수 있는 자리예요.</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="최근 추억" subtitle="최근 2개만 간단히 보여줘서 너무 길지 않게 유지했어요." />

        {recentMemories.length ? (
          recentMemories.map((memory) => (
            <View key={memory.id} style={styles.memoryItem}>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.memoryText}>{memory.summary}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>아직 특별한 추억이 없어요. 오늘의 산책이 첫 추억이 될 수 있어요.</Text>
        )}
      </View>

      {admin?.visible && admin?.canOverride ? (
        <View style={styles.devSection}>
          <Text style={styles.devSectionTitle}>개발자 패널</Text>
          <Text style={styles.devSectionText}>유저용 화면과 분리해서 아래쪽에만 보여줘요.</Text>
          <AdminPanel admin={admin} behavior={viewState.behavior} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function InfoTile({ label, value }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTileLabel}>{label}</Text>
      <Text style={styles.infoTileValue}>{value}</Text>
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function buildWeeklySummary(history, goal, streak) {
  const totalSteps = history.reduce((sum, record) => sum + (record?.steps ?? 0), 0);
  const averageSteps = history.length ? Math.round(totalSteps / history.length) : 0;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }

    return best;
  }, null);
  const energyCounts = countEnergyLevels(history, goal);
  const maxEnergyLevel = history.length ? Math.max(...history.map((record) => getEnergyLevel(record?.steps ?? 0, goal))) : 0;
  const energy6Count = energyCounts[6] ?? 0;
  const walkingDays = (energyCounts[3] ?? 0) + (energyCounts[4] ?? 0);
  const runningDays = (energyCounts[5] ?? 0) + (energyCounts[6] ?? 0);
  const calmDays = (energyCounts[0] ?? 0) + (energyCounts[1] ?? 0) + (energyCounts[2] ?? 0);

  return {
    totalSteps,
    averageSteps,
    maxEnergyLevel,
    energy6Count,
    bestDayLabel: bestRecord ? formatTrailDateLabel(bestRecord.date, bestRecord.id === history[0]?.id) : "기록 없음",
    narrative: buildWeeklyNarrative({ walkingDays, runningDays, calmDays, streak, historyLength: history.length }),
  };
}

function buildWeeklyNarrative({ walkingDays, runningDays, calmDays, streak, historyLength }) {
  if (!historyLength) {
    return "아직 이번 주 기록이 없어요. 오늘의 산책이 첫 기록이 될 수 있어요.";
  }

  const parts = [];

  if (walkingDays > 0) {
    parts.push(`${walkingDays}일은 산책했고`);
  }

  if (runningDays > 0) {
    parts.push(`${runningDays}일은 힘차게 뛰었어요`);
  }

  if (!parts.length && calmDays > 0) {
    parts.push(`${calmDays}일은 차분히 쉬었어요`);
  }

  if (!parts.length) {
    parts.push("이번 주는 조용히 움직였어요");
  }

  const streakText = streak > 0 ? ` 연속 산책일은 ${streak}일이에요.` : "";
  return `이번 주 캐릭터는 ${parts.join(", ")}.${streakText}`;
}

function buildRecentLogs(history, goal, weeklySummary) {
  const latest = history[0] ?? null;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }

    return best;
  }, null);
  const todayEnergy = getEnergyLevel(latest?.steps ?? 0, goal);
  const bestEnergy = getEnergyLevel(bestRecord?.steps ?? 0, goal);
  const todayTone = ENERGY_TONES[todayEnergy] ?? ENERGY_TONES[3];
  const bestTone = ENERGY_TONES[bestEnergy] ?? ENERGY_TONES[3];
  const goalDays = history.reduce((count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0), 0);

  return [
    {
      key: "today",
      shortDate: "오늘",
      tone: todayTone,
      text: `오늘은 ${ENERGY_STAGE_LABELS[todayEnergy] ?? "평온"} 상태까지 도달했어요.`,
    },
    {
      key: "best",
      shortDate: bestRecord ? formatWeekdayLabel(bestRecord.date, bestRecord.id === latest?.id) : "기록",
      tone: bestTone,
      text: bestRecord ? `이번 주 가장 활발했던 날은 ${formatTrailDateLabel(bestRecord.date, bestRecord.id === latest?.id)}이에요.` : "아직 가장 활발했던 날이 없어요.",
    },
    {
      key: "goal",
      shortDate: "목표",
      tone: "#c06b3e",
      text: goalDays > 0 ? `이번 주 목표를 ${goalDays}일 달성했어요. 최고 에너지 6은 ${weeklySummary.energy6Count}번 나왔어요.` : "이번 주 목표 달성 기록이 아직 없어요.",
    },
  ];
}

function countEnergyLevels(history, goal) {
  return history.reduce((acc, record) => {
    const level = getEnergyLevel(record?.steps ?? 0, goal);
    acc[level] = (acc[level] ?? 0) + 1;
    return acc;
  }, {});
}

function formatTrailDateLabel(value, isToday) {
  const { month, day, weekday } = parseDateParts(value);
  return isToday ? `오늘 · ${month}.${day}` : `${month}.${day} (${weekday})`;
}

function formatWeekdayLabel(value, isToday) {
  if (isToday) {
    return "오늘";
  }

  const { weekday } = parseDateParts(value);
  return weekday;
}

function parseDateParts(value) {
  const [year, month, day] = String(value).split("-").map((part) => Number(part));
  const safeDate = new Date(year, (month ?? 1) - 1, day ?? 1);

  return {
    month: safeDate.getMonth() + 1,
    day: safeDate.getDate(),
    weekday: WEEKDAY_LABELS[safeDate.getDay()] ?? "",
  };
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

const ENERGY_TONES = {
  0: "#8a94a2",
  1: "#8aa0c5",
  2: "#5f9ea0",
  3: "#7aa37e",
  4: "#e2a24a",
  5: "#db7c52",
  6: "#c95f4f",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileCard: {
    borderRadius: theme.radius.xl,
    padding: 20,
    backgroundColor: "#fffaf2",
    borderWidth: 1,
    borderColor: "#f0dcc3",
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 16,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileKicker: {
    color: "#c57c3a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  profileName: {
    color: theme.colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  profileHandle: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  stateBadge: {
    minWidth: 102,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 2,
    alignItems: "flex-start",
  },
  stateBadgeLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  stateBadgeValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoTile: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTileLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  infoTileValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  profileFooter: {
    gap: 10,
  },
  profileFooterText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  signOutButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff2e8",
    borderWidth: 1,
    borderColor: "#f1d6bf",
  },
  signOutLabel: {
    color: "#9f4e33",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionHeader: {
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  longTermBanner: {
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  longTermBannerLabel: {
    fontSize: 24,
    fontWeight: "900",
  },
  longTermBannerDescription: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  stateLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stateLegendChip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateLegendChipActive: {
    backgroundColor: "#fff2e8",
    borderColor: "#e2b79e",
  },
  stateLegendChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  stateLegendChipLabelActive: {
    color: theme.colors.ink,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#ecdac5",
  },
  metricLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  metricValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  summarySentenceCard: {
    borderRadius: theme.radius.lg,
    padding: 16,
    backgroundColor: "#fffefc",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summarySentence: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800",
  },
  logList: {
    gap: 10,
  },
  logItem: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  logPill: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logPillText: {
    fontSize: 11,
    fontWeight: "900",
  },
  logText: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skinToneChip: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skinToneChipSelected: {
    backgroundColor: "#fff2e8",
    borderColor: "#d99d78",
  },
  skinToneSwatch: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  skinToneTextBlock: {
    flex: 1,
    gap: 2,
  },
  skinToneLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  skinToneNote: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  customizationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  placeholderCard: {
    width: "48.5%",
    minHeight: 118,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  placeholderLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  placeholderTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  placeholderText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  memoryItem: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 6,
  },
  memoryTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  memoryText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  emptyText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  devSection: {
    gap: 10,
    paddingTop: 4,
  },
  devSectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  devSectionText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
