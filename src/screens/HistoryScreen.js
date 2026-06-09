import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { getMemories } from "../game/memories.js";
import { getStreak } from "../game/progression.js";
import { getEnergyLevel } from "../game/stepRules.js";

const STORY_TABS = [
  { id: "footprints", label: "발자국" },
  { id: "achievement", label: "달성" },
];

const ACHIEVEMENT_TABS = [
  { id: "mission", label: "미션" },
  { id: "badge", label: "업적" },
];

const TREND_PERIOD_TABS = [
  { id: "7d", label: "7일" },
  { id: "30d", label: "한 달" },
  { id: "365d", label: "1년" },
];

const AVERAGE_PATTERN_TABS = [
  { id: "time", label: "시간대별" },
  { id: "day", label: "요일별" },
];

const ENERGY_META = {
  0: { label: "완전 휴식", icon: "○", tone: "#787878" },
  1: { label: "졸린 하루", icon: "◔", tone: "#787878" },
  2: { label: "숨 고르기", icon: "◑", tone: "#787878" },
  3: { label: "평온", icon: "◐", tone: "#111111" },
  4: { label: "산책", icon: "•", tone: "#111111" },
  5: { label: "달리기", icon: "▸", tone: "#111111" },
  6: { label: "최고 컨디션", icon: "✦", tone: "#111111" },
};

export function HistoryScreen() {
  const { history, goal } = useStepData();
  const { width } = useWindowDimensions();
  const [storyTab, setStoryTab] = useState("footprints");
  const [achievementTab, setAchievementTab] = useState("mission");
  const [trendPeriod, setTrendPeriod] = useState("7d");
  const [distributionPeriod, setDistributionPeriod] = useState("7d");
  const [averagePatternMode, setAveragePatternMode] = useState("time");

  const streak = useMemo(() => getStreak(history, goal), [history, goal]);
  const achievementCards = useMemo(() => getMemories(history, goal, 3), [goal, history]);
  const missionCards = useMemo(() => buildMissionCards({ history, goal, streak }), [goal, history, streak]);
  const trendPeriodConfig = useMemo(() => getPeriodConfig(trendPeriod), [trendPeriod]);
  const distributionPeriodConfig = useMemo(() => getPeriodConfig(distributionPeriod), [distributionPeriod]);
  const trendRecords = useMemo(
    () => buildPeriodRecords(history, trendPeriodConfig.days),
    [history, trendPeriodConfig.days],
  );
  const trendSummary = useMemo(() => buildPeriodSummary(trendRecords), [trendRecords]);
  const distributionRecords = useMemo(
    () => buildPeriodRecords(history, distributionPeriodConfig.days),
    [distributionPeriodConfig.days, history],
  );
  const patternSourceRecords = trendRecords;
  const chartViewportWidth = Math.max(280, Math.floor(width - theme.spacing.md * 2 - 32));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>추억</Text>
      </View>

      <View style={styles.modeCard}>
        <TabRow tabs={STORY_TABS} activeId={storyTab} onChange={setStoryTab} />
      </View>

      {storyTab === "footprints" ? (
        <>
          <View style={styles.personalFootprintCard}>
            <Text style={styles.personalFootprintTitle}>개인 발자국</Text>
            <Text style={styles.personalFootprintSub}>선택한 기간과 패턴을 한 번에 봐요.</Text>
            <View style={styles.personalFootprintRow}>
              <MiniStat label="기간" value={getPeriodLabel(trendPeriod)} />
              <MiniStat label="총 걸음" value={`${formatNumber(trendSummary.totalSteps)}보`} />
              <MiniStat label="평균" value={`${formatNumber(trendSummary.averageSteps)}보`} />
            </View>
          </View>

          <Section title="걸음 추이">
            <TabRow tabs={TREND_PERIOD_TABS} activeId={trendPeriod} onChange={setTrendPeriod} />
            <View style={styles.chartCard}>
              <HorizontalChartScroll>
                <TrendLineChart records={trendRecords} goal={goal} width={chartViewportWidth} />
              </HorizontalChartScroll>
            </View>
          </Section>

          <Section title="걸음 분포">
            <TabRow tabs={TREND_PERIOD_TABS} activeId={distributionPeriod} onChange={setDistributionPeriod} />
            <View style={styles.chartCard}>
              <HorizontalChartScroll>
                <BarDistributionChart records={distributionRecords} width={chartViewportWidth} />
              </HorizontalChartScroll>
            </View>
          </Section>

          <Section title="평균 패턴">
            <TabRow tabs={AVERAGE_PATTERN_TABS} activeId={averagePatternMode} onChange={setAveragePatternMode} />
            <View style={styles.chartCard}>
              <PatternAverageChart
                mode={averagePatternMode}
                records={patternSourceRecords}
                goal={goal}
                width={chartViewportWidth}
              />
            </View>
          </Section>
        </>
      ) : (
        <>
          <View style={styles.modeCard}>
            <TabRow tabs={ACHIEVEMENT_TABS} activeId={achievementTab} onChange={setAchievementTab} />
          </View>

          {achievementTab === "mission" ? (
            <View style={styles.missionGrid}>
              {missionCards.map((card) => (
                <View key={card.key} style={styles.missionCard}>
                  <Text style={styles.missionIcon}>{card.icon}</Text>
                  <Text style={styles.missionTitle}>{card.title}</Text>
                  <Text style={styles.missionValue}>{card.value}</Text>
                  <Text style={styles.missionNote}>{card.note}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Section title="업적">
              <View style={styles.badgeList}>
                {achievementCards.length ? (
                  achievementCards.map((card) => (
                    <View key={card.id} style={styles.badgeCard}>
                      <Text style={styles.badgeTitle}>{card.title}</Text>
                      <Text style={styles.badgeSummary}>{card.summary}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>아직 쌓인 업적이 없어요.</Text>
                )}
              </View>
            </Section>
          )}
        </>
      )}
    </ScrollView>
  );
}

function TabRow({ tabs, activeId, onChange }) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => {
        const active = tab.id === activeId;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.tabButton, active && styles.tabButtonActive]}
          >
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
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
    narrative: buildWeeklyNarrative({ walkingDays, runningDays, streak }),
  };
}

function buildWeeklyNarrative({ walkingDays, runningDays, streak }) {
  if (!walkingDays && !runningDays) {
    return streak > 0 ? `이번 주는 쉬면서 연속 ${streak}일을 지켰어요.` : "이번 주는 조용했어요.";
  }

  const parts = [];

  if (walkingDays > 0) {
    parts.push(`산책 ${walkingDays}일`);
  }

  if (runningDays > 0) {
    parts.push(`달리기 ${runningDays}일`);
  }

  return `이번 주는 ${parts.join(" · ")}이에요.${streak > 0 ? ` 연속 ${streak}일.` : ""}`;
}

function buildTrailLogs(history, goal) {
  const latest = history[0] ?? null;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);
  const latestEnergy = getEnergyLevel(latest?.steps ?? 0, goal);
  const bestEnergy = getEnergyLevel(bestRecord?.steps ?? 0, goal);
  const goalDays = history.reduce((count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0), 0);

  return [
    {
      key: "today",
      icon: ENERGY_META[latestEnergy]?.icon ?? "•",
      text: latest ? `오늘 ${formatNumber(latest.steps)}보 · E${latestEnergy}` : "오늘 기록이 없어요.",
    },
    {
      key: "best",
      icon: ENERGY_META[bestEnergy]?.icon ?? "✦",
      text: bestRecord ? `최고 ${formatNumber(bestRecord.steps)}보 · ${formatTrailDateLabel(bestRecord.date, bestRecord.id === latest?.id)}` : "최고 기록이 없어요.",
    },
    {
      key: "goal",
      icon: "◌",
      text: goalDays > 0 ? `목표 ${goalDays}일` : "목표 달성이 아직 없어요.",
    },
  ];
}

function buildMissionCards({ history, goal, streak }) {
  const latest = history[0] ?? null;
  const goalDays = history.reduce((count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0), 0);
  const latestSteps = latest?.steps ?? 0;
  const latestEnergy = getEnergyLevel(latestSteps, goal);
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);

  return [
    {
      key: "today",
      icon: "◌",
      title: "오늘",
      value: latest ? `${formatNumber(latestSteps)}보` : "0보",
      note: latestSteps >= goal ? `E${latestEnergy} 달성` : `${Math.max(goal - latestSteps, 0)}보 남음`,
    },
    {
      key: "week",
      icon: "•",
      title: "주간",
      value: `${goalDays}/7`,
      note: "목표일",
    },
    {
      key: "streak",
      icon: "✦",
      title: "연속",
      value: `${streak}일`,
      note: "이어가기",
    },
    {
      key: "best",
      icon: "◌",
      title: "최고",
      value: `${formatNumber(bestRecord?.steps ?? 0)}보`,
      note: bestRecord ? formatTrailDateLabel(bestRecord.date, bestRecord.id === latest?.id) : "기록 없음",
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

function formatTrailDayLabel(value, isToday) {
  if (isToday) {
    return "오늘";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value ?? "");
  }

  return String(date.getDate()).padStart(2, "0");
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
}

function getPeriodConfig(periodId) {
  switch (periodId) {
    case "30d":
      return { id: "30d", label: "한 달", days: 30 };
    case "365d":
      return { id: "365d", label: "1년", days: 365 };
    default:
      return { id: "7d", label: "7일", days: 7 };
  }
}

function getPeriodLabel(periodId) {
  return getPeriodConfig(periodId).label;
}

function buildPeriodRecords(history, days) {
  const today = new Date();
  const source = history.length
    ? history
    : [
        {
          id: "today",
          date: today.toISOString().slice(0, 10),
          steps: 0,
        },
      ];

  return Array.from({ length: days }, (_, index) => {
    const age = days - 1 - index;
    const sourceRecord = source[age % source.length] ?? source[0];
    const date = new Date(today);
    date.setDate(today.getDate() - age);

    return {
      ...sourceRecord,
      id: `${date.toISOString().slice(0, 10)}-${age}`,
      date: date.toISOString().slice(0, 10),
      steps: Number(sourceRecord.steps ?? 0),
    };
  });
}

function buildPeriodSummary(records) {
  const totalSteps = records.reduce((sum, record) => sum + (record.steps ?? 0), 0);
  const averageSteps = records.length ? Math.round(totalSteps / records.length) : 0;
  const bestRecord = records.reduce((best, record) => {
    if (!best || (record.steps ?? 0) > (best.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);

  return {
    totalSteps,
    averageSteps,
    bestSteps: bestRecord?.steps ?? 0,
    bestDate: bestRecord?.date ?? null,
  };
}

function buildDistributionData(records) {
  const maxSteps = records.reduce((max, record) => Math.max(max, Number(record.steps ?? 0)), 0);
  const maxBucket = Math.max(0, Math.floor(maxSteps / 1000));
  const buckets = Array.from({ length: maxBucket + 1 }, (_, bucket) => ({
    bucket,
    label: `${bucket}천대`,
    count: 0,
  }));

  for (const record of records) {
    const bucketIndex = Math.max(0, Math.floor(Number(record.steps ?? 0) / 1000));
    if (!buckets[bucketIndex]) {
      buckets[bucketIndex] = { bucket: bucketIndex, label: `${bucketIndex}천대`, count: 0 };
    }
    buckets[bucketIndex].count += 1;
  }

  return buckets;
}

function buildAveragePatternData(records, mode, goal) {
  if (mode === "day") {
    const labels = ["월", "화", "수", "목", "금", "토", "일"];
    const order = [1, 2, 3, 4, 5, 6, 0];
    const totals = labels.map(() => 0);
    const counts = labels.map(() => 0);

    for (const record of records) {
      const date = new Date(record.date);
      const dayIndex = Number.isNaN(date.getTime()) ? 1 : date.getDay();
      const mappedIndex = order.indexOf(dayIndex);
      const targetIndex = mappedIndex >= 0 ? mappedIndex : 0;
      totals[targetIndex] += Number(record.steps ?? 0);
      counts[targetIndex] += 1;
    }

    return labels.map((label, index) => ({
      label,
      value: counts[index] ? Math.round(totals[index] / counts[index]) : 0,
    }));
  }

  const labels = ["새벽", "아침", "점심", "오후", "저녁", "밤"];
  const totals = labels.map(() => 0);
  const counts = labels.map(() => 0);

  for (const record of records) {
    const steps = Number(record.steps ?? 0);
    const weights = getTimeBucketWeights(steps, goal);
    weights.forEach((weight, index) => {
      totals[index] += steps * weight;
      counts[index] += 1;
    });
  }

  return labels.map((label, index) => ({
    label,
    value: counts[index] ? Math.round(totals[index] / counts[index]) : 0,
  }));
}

function getTimeBucketWeights(steps, goal) {
  if (steps >= goal * 1.2) {
    return [0.03, 0.08, 0.16, 0.28, 0.25, 0.2];
  }

  if (steps >= goal) {
    return [0.04, 0.1, 0.18, 0.26, 0.22, 0.2];
  }

  if (steps >= goal * 0.7) {
    return [0.05, 0.12, 0.2, 0.25, 0.2, 0.18];
  }

  if (steps >= goal * 0.3) {
    return [0.08, 0.16, 0.2, 0.22, 0.18, 0.16];
  }

  return [0.1, 0.18, 0.2, 0.18, 0.18, 0.16];
}

function HorizontalChartScroll({ children }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScrollContent}>
      {children}
    </ScrollView>
  );
}

function TrendLineChart({ records, width: chartWidth = 320 }) {
  const height = 180;
  const paddingX = 18;
  const paddingTop = 18;
  const paddingBottom = 28;
  const plotHeight = Math.max(1, height - paddingTop - paddingBottom);
  const valueMax = Math.max(1, ...records.map((record) => Number(record.steps ?? 0)));
  const widthForChart = Math.max(chartWidth, Math.max(320, records.length * 18 + paddingX * 2));
  const gap = records.length > 1 ? (widthForChart - paddingX * 2) / (records.length - 1) : 0;
  const points = records.map((record, index) => {
    const x = records.length > 1 ? paddingX + index * gap : widthForChart / 2;
    const value = Number(record.steps ?? 0);
    const y = paddingTop + (1 - value / valueMax) * plotHeight;
    return { x, y, value, label: record.date, isToday: index === records.length - 1 };
  });

  return (
    <View style={[styles.trendChart, { width: widthForChart, height }]}>
      {Array.from({ length: 4 }, (_, index) => {
        const top = paddingTop + (plotHeight / 3) * index;
        return <View key={`grid-${index}`} style={[styles.trendGridLine, { top }]} />;
      })}

      {points.map((point, index) => {
        const prev = points[index - 1];
        const line =
          prev != null
            ? buildSegmentStyle(prev.x, prev.y, point.x, point.y)
            : null;
        return (
          <View key={`${point.label}-${index}`} style={styles.trendPointLayer}>
            {line ? <View style={[styles.trendSegment, line]} /> : null}
            <View style={[styles.trendPoint, point.isToday && styles.trendPointToday, { left: point.x - 4, top: point.y - 4 }]} />
          </View>
        );
      })}

      <View style={styles.trendAxisRow}>
        <Text style={styles.chartHint}>왼쪽은 과거, 오른쪽은 오늘이에요.</Text>
        <Text style={styles.chartHint}>최고 {formatNumber(valueMax)}보</Text>
      </View>
    </View>
  );
}

function buildSegmentStyle(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    left: x1 + dx / 2 - length / 2,
    top: y1 + dy / 2 - 1,
    width: length,
    transform: [{ rotate: `${angle}deg` }],
  };
}

function BarDistributionChart({ records, width: chartWidth = 320 }) {
  const buckets = buildDistributionData(records);
  const maxCount = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const widthForChart = Math.max(chartWidth, Math.max(320, buckets.length * 44 + 16));

  return (
    <View style={[styles.distributionChart, { width: widthForChart }]}>
      {buckets.map((bucket) => {
        const barHeight = (bucket.count / maxCount) * 120;
        return (
          <View key={bucket.label} style={styles.barColumn}>
            <Text style={styles.barValue}>{bucket.count}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: Math.max(8, barHeight) }]} />
            </View>
            <Text style={styles.barLabel}>{bucket.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function PatternAverageChart({ records, mode, goal, width: chartWidth = 320 }) {
  const data = buildAveragePatternData(records, mode, goal);
  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const widthForChart = Math.max(chartWidth, 320);

  return (
    <View style={[styles.patternChart, { width: widthForChart }]}>
      {data.map((item) => {
        const barHeight = (item.value / maxValue) * 124;
        return (
          <View key={item.label} style={styles.patternColumn}>
            <Text style={styles.barValue}>{formatNumber(item.value)}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.patternFill, { height: Math.max(10, barHeight) }]} />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MiniStat({ label, value }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
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
  personalFootprintCard: {
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  personalFootprintTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  personalFootprintSub: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    fontFamily: theme.fonts.body,
  },
  personalFootprintRow: {
    flexDirection: "row",
    gap: 8,
  },
  miniStat: {
    flex: 1,
    minHeight: 60,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  miniStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  miniStatValue: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.display,
  },
  modeCard: {
    borderRadius: theme.radius.xl,
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.appBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  tabLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  tabLabelActive: {
    color: "#ffffff",
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
    fontFamily: theme.fonts.body,
  },
  summaryStatValue: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.body,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  chartCard: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  chartScrollContent: {
    paddingRight: 8,
  },
  trendChart: {
    position: "relative",
    borderRadius: 18,
    backgroundColor: "#fbfbfa",
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  trendGridLine: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ededea",
  },
  trendPointLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  trendSegment: {
    position: "absolute",
    height: 2,
    backgroundColor: "#111111",
    borderRadius: 999,
    opacity: 0.72,
  },
  trendPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#111111",
  },
  trendPointToday: {
    backgroundColor: "#111111",
  },
  trendAxisRow: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartHint: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  distributionChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  barColumn: {
    flex: 1,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  barValue: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  barTrack: {
    width: "100%",
    height: 124,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 4,
    overflow: "hidden",
  },
  barFill: {
    width: "68%",
    borderRadius: 999,
    backgroundColor: "#111111",
    minHeight: 8,
  },
  barLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  patternChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  patternColumn: {
    flex: 1,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  patternFill: {
    width: "68%",
    borderRadius: 999,
    backgroundColor: "#111111",
    minHeight: 10,
  },
  trailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trailDateRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  trailDateItem: {
    flex: 1,
    alignItems: "center",
  },
  trailDateCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  trailDateCircleActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  trailDateCircleText: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  trailDateCircleTextActive: {
    color: "#ffffff",
  },
  trailDetailCard: {
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  trailDetailTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  trailDetailDateBlock: {
    flex: 1,
    gap: 4,
  },
  trailDetailDate: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  trailDetailHint: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  trailDetailEnergyBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.appBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  trailDetailEnergyText: {
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  trailDetailBody: {
    gap: 4,
  },
  trailDetailSteps: {
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  trailDetailGoal: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.body,
  },
  missionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  missionCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  missionIcon: {
    fontSize: 16,
    fontWeight: "900",
  },
  missionTitle: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  missionValue: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  missionNote: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  badgeList: {
    gap: 8,
  },
  badgeCard: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  badgeTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  badgeSummary: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  emptyText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
