import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { getEnergyLevel } from "../game/stepRules.js";

const ENERGY_META = {
  0: { label: "완전 휴식", tone: "#8a94a2" },
  1: { label: "졸린 하루", tone: "#8aa0c5" },
  2: { label: "숨 고르기", tone: "#5f9ea0" },
  3: { label: "평온", tone: "#7aa37e" },
  4: { label: "산책", tone: "#e2a24a" },
  5: { label: "달리기", tone: "#db7c52" },
  6: { label: "최고 컨디션", tone: "#c95f4f" },
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function HistoryScreen() {
  const { today, history, goal } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal });
  const trail = history.slice(0, 7);
  const weekSummary = buildWeekSummary(trail, goal);
  const logEntries = buildTrailLogs(trail, goal);
  const topRecords = buildTopRecords(trail, goal);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>발자국</Text>
        <Text style={styles.heroTitle}>캐릭터와 함께 쌓인 이번 주</Text>
        <Text style={styles.heroText}>
          그래프 대신, 하루하루의 발자국이 차곡차곡 쌓이는 기록장처럼 보이도록 정리했어요.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryStat label="이번 주 총 걸음 수" value={`${formatNumber(weekSummary.totalSteps)}보`} />
        <SummaryStat label="하루 평균 걸음 수" value={`${formatNumber(weekSummary.averageSteps)}보`} />
        <SummaryStat label="가장 많이 걸은 날" value={weekSummary.bestDayLabel} />
        <SummaryStat label="최고 에너지 단계" value={`${weekSummary.maxEnergyLevel} / ${ENERGY_META[weekSummary.maxEnergyLevel]?.label ?? "알 수 없음"}`} />
        <SummaryStat label="연속 달성일" value={`${viewState.streak}일`} />
      </View>

      <Section title="이번 주 문장 요약">
        <View style={styles.summarySentenceCard}>
          <Text style={styles.summarySentence}>{weekSummary.narrative}</Text>
        </View>
      </Section>

      <Section title="최근 7일 발자국">
        <View style={styles.trailGrid}>
          {trail.map((record, index) => {
            const energyLevel = getEnergyLevel(record.steps, goal);
            const meta = ENERGY_META[energyLevel] ?? ENERGY_META[3];
            const dateLabel = formatTrailDateLabel(record.date, index === 0);

            return (
              <View key={record.id} style={styles.trailCard}>
                <View style={styles.trailHead}>
                  <Text style={styles.trailDate}>{dateLabel}</Text>
                  <View style={[styles.energyBadge, { backgroundColor: `${meta.tone}1A`, borderColor: `${meta.tone}33` }]}>
                    <View style={[styles.energyDot, { backgroundColor: meta.tone }]} />
                    <Text style={[styles.energyBadgeText, { color: meta.tone }]}>{`E${energyLevel}`}</Text>
                  </View>
                </View>

                <Text style={styles.trailSteps}>{`${formatNumber(record.steps)}보`}</Text>
                <Text style={styles.trailLabel}>{meta.label}</Text>
                <Text style={styles.trailSubText}>{buildTrailSentence(record.date, energyLevel, index === 0)}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="최근 산책 로그">
        <View style={styles.logList}>
          {logEntries.map((entry) => (
            <View key={entry.key} style={styles.logItem}>
              <View style={[styles.logPill, { backgroundColor: `${entry.tone}18` }]}>
                <Text style={[styles.logPillText, { color: entry.tone }]}>{entry.shortDate}</Text>
              </View>
              <Text style={styles.logText}>{entry.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="최고 기록">
        <View style={styles.bestGrid}>
          <BestRecord label="최고 걸음 수" value={`${formatNumber(topRecords.maxSteps)}보`} />
          <BestRecord label="최고 에너지 6 달성 횟수" value={`${topRecords.energy6Count}회`} />
          <BestRecord label="최장 연속 달성일" value={`${topRecords.longestStreak}일`} />
        </View>
      </Section>
    </ScrollView>
  );
}

function SummaryStat({ label, value }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={styles.summaryStatValue}>{value}</Text>
    </View>
  );
}

function BestRecord({ label, value }) {
  return (
    <View style={styles.bestRecord}>
      <Text style={styles.bestRecordLabel}>{label}</Text>
      <Text style={styles.bestRecordValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function buildWeekSummary(history, goal) {
  const totalSteps = history.reduce((sum, record) => sum + (record.steps ?? 0), 0);
  const averageSteps = history.length ? Math.round(totalSteps / history.length) : 0;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record.steps ?? 0) > (best.steps ?? 0)) return record;
    return best;
  }, null);
  const counts = countEnergyLevels(history, goal);
  const maxEnergyLevel = findMaxEnergyLevel(history, goal);
  const strongestFragments = buildEnergyFragments(counts);

  return {
    totalSteps,
    averageSteps,
    bestDayLabel: bestRecord ? formatTrailDateLabel(bestRecord.date, bestRecord.id === history[0]?.id) : "기록 없음",
    maxEnergyLevel,
    narrative: strongestFragments.length
      ? `이번 주 캐릭터는 ${strongestFragments.join(", ")}을 기록했어요.`
      : "이번 주 캐릭터의 발자국이 아직 쌓이지 않았어요.",
  };
}

function buildTrailLogs(history, goal) {
  return history.slice(0, 4).map((record, index) => {
    const energyLevel = getEnergyLevel(record.steps, goal);
    const meta = ENERGY_META[energyLevel] ?? ENERGY_META[3];

    return {
      key: record.id,
      shortDate: formatWeekdayLabel(record.date, index === 0),
      tone: meta.tone,
      text: buildTrailSentence(record.date, energyLevel, index === 0),
    };
  });
}

function buildTopRecords(history, goal) {
  const maxSteps = history.reduce((max, record) => Math.max(max, record.steps ?? 0), 0);
  const energy6Count = history.reduce((count, record) => count + (getEnergyLevel(record.steps, goal) === 6 ? 1 : 0), 0);
  const longestStreak = getLongestGoalStreak(history, goal);

  return {
    maxSteps,
    energy6Count,
    longestStreak,
  };
}

function buildEnergyFragments(counts) {
  const entries = Object.entries(counts)
    .map(([level, count]) => ({ level: Number(level), count }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || b.level - a.level)
    .slice(0, 3);

  return entries.map(({ level, count }) => `${ENERGY_META[level]?.label ?? `${level}단계`} ${count}일`);
}

function countEnergyLevels(history, goal) {
  return history.reduce((acc, record) => {
    const level = getEnergyLevel(record.steps, goal);
    acc[level] = (acc[level] ?? 0) + 1;
    return acc;
  }, {});
}

function findMaxEnergyLevel(history, goal) {
  return history.reduce((maxLevel, record) => Math.max(maxLevel, getEnergyLevel(record.steps, goal)), 0);
}

function getLongestGoalStreak(history, goal) {
  let best = 0;
  let current = 0;

  for (const record of history) {
    if ((record.steps ?? 0) >= goal) {
      current += 1;
      best = Math.max(best, current);
      continue;
    }

    current = 0;
  }

  return best;
}

function buildTrailSentence(date, energyLevel, isToday) {
  const dayWord = isToday ? "오늘" : `${formatWeekdayLabel(date, false)}에는`;
  const meta = ENERGY_META[energyLevel] ?? ENERGY_META[3];

  switch (energyLevel) {
    case 0:
      return `${dayWord} 완전 휴식 상태였어요.`;
    case 1:
      return `${dayWord} 졸린 하루를 보냈어요.`;
    case 2:
      return `${dayWord} 숨을 고르며 천천히 움직였어요.`;
    case 3:
      return `${dayWord} 평온하게 발자국을 남겼어요.`;
    case 4:
      return `${dayWord} 산책 상태까지 도달했어요.`;
    case 5:
      return `${dayWord} 달리기 상태까지 올라갔어요.`;
    case 6:
      return `${dayWord} 최고 컨디션에 도달했어요.`;
    default:
      return `${dayWord} ${meta.label} 상태였어요.`;
  }
}

function formatTrailDateLabel(value, isToday) {
  const { month, day, weekday } = parseDateParts(value);
  return isToday ? `오늘 · ${month}.${day}` : `${month}.${day} (${weekday})`;
}

function formatWeekdayLabel(value, isToday) {
  if (isToday) return "오늘";

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
  heroCard: {
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
  },
  kicker: {
    color: "#c57c3a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "900",
  },
  heroText: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryStat: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  summaryStatValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    paddingHorizontal: 2,
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
  trailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  trailCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  trailHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  trailDate: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  energyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  energyDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  energyBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  trailSteps: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  trailLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  trailSubText: {
    color: theme.colors.muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
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
  bestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  bestRecord: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#ecdac5",
  },
  bestRecordLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  bestRecordValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
});
