import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { getMemories } from "../game/memories.js";
import { getStreak } from "../game/progression.js";
import { getEnergyLevel } from "../game/stepRules.js";

const ENERGY_META = {
  0: { label: "완전 휴식", icon: "🛏️", tone: "#8a94a2" },
  1: { label: "졸린 하루", icon: "😴", tone: "#8aa0c5" },
  2: { label: "숨 고르기", icon: "🌬️", tone: "#5f9ea0" },
  3: { label: "평온", icon: "🍃", tone: "#7aa37e" },
  4: { label: "산책", icon: "👣", tone: "#e2a24a" },
  5: { label: "달리기", icon: "🏃", tone: "#db7c52" },
  6: { label: "최고 컨디션", icon: "✨", tone: "#c95f4f" },
};

export function HistoryScreen() {
  const { history, goal } = useStepData();
  const trail = history.slice(0, 7);
  const streak = getStreak(history, goal);
  const weekSummary = buildWeekSummary(trail, goal, streak);
  const logEntries = buildTrailLogs(trail, goal);
  const memories = getMemories(history, goal).slice(0, 2);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>발자국</Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryStat icon="🔥" label="연속" value={`${streak}일`} />
        <SummaryStat icon="👣" label="주간" value={`${formatNumber(weekSummary.totalSteps)}보`} />
        <SummaryStat icon="🏆" label="최고" value={`${formatNumber(weekSummary.bestSteps)}보`} />
        <SummaryStat icon="📊" label="평균" value={`${formatNumber(weekSummary.averageSteps)}보`} />
      </View>

      <View style={styles.summarySentenceCard}>
        <Text style={styles.summarySentence}>{weekSummary.narrative}</Text>
      </View>

      <Section title="최근 7일">
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
                    <Text style={[styles.energyBadgeText, { color: meta.tone }]}>
                      {`${meta.icon} E${energyLevel}`}
                    </Text>
                  </View>
                </View>

                <Text style={styles.trailSteps}>{`${formatNumber(record.steps)}보`}</Text>
                <Text style={styles.trailLabel}>{meta.label}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="기록">
        <View style={styles.logList}>
          {logEntries.map((entry) => (
            <View key={entry.key} style={styles.logItem}>
              <Text style={styles.logIcon}>{entry.icon}</Text>
              <Text style={styles.logText}>{entry.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="추억">
        <View style={styles.memoryList}>
          {memories.length ? (
            memories.map((memory) => (
              <View key={memory.id} style={styles.memoryItem}>
                <Text style={styles.memoryTitle}>{memory.title}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>아직 쌓인 추억이 없어요.</Text>
          )}
        </View>
      </Section>
    </ScrollView>
  );
}

function SummaryStat({ icon, label, value }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatLabel}>
        {icon} {label}
      </Text>
      <Text style={styles.summaryStatValue}>{value}</Text>
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

function buildWeekSummary(history, goal, streak) {
  const totalSteps = history.reduce((sum, record) => sum + (record.steps ?? 0), 0);
  const averageSteps = history.length ? Math.round(totalSteps / history.length) : 0;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record.steps ?? 0) > (best.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);
  const energyCounts = countEnergyLevels(history, goal);
  const walkingDays = (energyCounts[3] ?? 0) + (energyCounts[4] ?? 0);
  const runningDays = (energyCounts[5] ?? 0) + (energyCounts[6] ?? 0);

  return {
    totalSteps,
    averageSteps,
    bestSteps: bestRecord?.steps ?? 0,
    narrative: buildWeeklyNarrative({
      walkingDays,
      runningDays,
      streak,
      bestDayLabel: bestRecord ? formatTrailDateLabel(bestRecord.date, bestRecord.id === history[0]?.id) : "",
    }),
  };
}

function buildWeeklyNarrative({ walkingDays, runningDays, streak, bestDayLabel }) {
  const parts = [];

  if (walkingDays > 0) {
    parts.push(`산책 ${walkingDays}일`);
  }

  if (runningDays > 0) {
    parts.push(`달리기 ${runningDays}일`);
  }

  if (!parts.length) {
    parts.push("조용히 쉬었어요");
  }

  const bestDayText = bestDayLabel ? `, 최고는 ${bestDayLabel}` : "";
  const streakText = streak > 0 ? `, 연속 ${streak}일` : "";

  return `이번 주는 ${parts.join(" · ")}${bestDayText}${streakText}.`;
}

function buildTrailLogs(history, goal) {
  const latest = history[0] ?? null;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }

    return best;
  }, null);
  const todayEnergy = getEnergyLevel(latest?.steps ?? 0, goal);
  const bestEnergy = getEnergyLevel(bestRecord?.steps ?? 0, goal);
  const goalDays = history.reduce((count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0), 0);

  return [
    {
      key: "today",
      icon: ENERGY_META[todayEnergy]?.icon ?? "👣",
      text: latest ? `오늘 · E${todayEnergy} · ${formatNumber(latest.steps)}보` : "오늘 기록이 없어요.",
    },
    {
      key: "best",
      icon: ENERGY_META[bestEnergy]?.icon ?? "🏆",
      text: bestRecord ? `최고 · ${formatTrailDateLabel(bestRecord.date, bestRecord.id === latest?.id)} · E${bestEnergy}` : "최고 기록이 없어요.",
    },
    {
      key: "goal",
      icon: "🎯",
      text: goalDays > 0 ? `목표 · ${goalDays}일 도달` : "목표 도달 기록이 없어요.",
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isToday ? "오늘" : value;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  return isToday ? `오늘 · ${month}.${day}` : `${month}.${day} (${weekday})`;
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
  pageTitleWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  pageTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.6,
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
    gap: 6,
  },
  summaryStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  summaryStatValue: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  summarySentenceCard: {
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: "#fffaf2",
    borderWidth: 1,
    borderColor: "#f0dcc3",
  },
  summarySentence: {
    color: theme.colors.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  trailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trailCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  trailHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  trailDate: {
    flex: 1,
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  energyBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  energyBadgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  trailSteps: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  trailLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  logList: {
    gap: 8,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: theme.radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logIcon: {
    width: 22,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
  },
  logText: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  memoryList: {
    gap: 8,
  },
  memoryItem: {
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  memoryTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
