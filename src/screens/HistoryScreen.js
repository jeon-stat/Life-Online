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
];

const DISTRIBUTION_PERIOD_TABS = [
  { id: "7d", label: "7일" },
  { id: "30d", label: "한 달" },
  { id: "365d", label: "1년" },
];

const AVERAGE_PATTERN_TABS = [
  { id: "time", label: "시간대별" },
  { id: "day", label: "요일별" },
];

const HOUR_BUCKETS = ["새벽", "아침", "점심", "오후", "저녁", "밤"];
const DAY_BUCKETS = ["월", "화", "수", "목", "금", "토", "일"];
const TREND_AXIS_TICKS = [1, 0.75, 0.5, 0.25, 0];

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
  const personalOverview = useMemo(() => buildPersonalOverview(history, goal, streak), [history, goal, streak]);
  const trendPeriodConfig = useMemo(() => getPeriodConfig(trendPeriod), [trendPeriod]);
  const distributionPeriodConfig = useMemo(() => getPeriodConfig(distributionPeriod), [distributionPeriod]);
  const trendRecords = useMemo(() => buildPeriodRecords(history, trendPeriodConfig.days), [history, trendPeriodConfig.days]);
  const distributionRecords = useMemo(
    () => buildPeriodRecords(history, distributionPeriodConfig.days),
    [distributionPeriodConfig.days, history],
  );
  const averagePatternRecords = trendRecords;
  const chartWidth = Math.max(260, Math.floor(width - theme.spacing.md * 2));

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
          <Section title="개인 발자국">
            <View style={styles.summaryPanel}>
              <View style={styles.summaryGrid}>
                <SummaryStat icon="👣" label="총 걸음" value={`${formatNumber(personalOverview.totalSteps)}보`} />
                <SummaryStat icon="📈" label="평균" value={`${formatNumber(personalOverview.averageSteps)}보`} />
                <SummaryStat icon="🏅" label="최고" value={`${formatNumber(personalOverview.bestSteps)}보`} />
                <SummaryStat icon="🔥" label="연속" value={`${personalOverview.streak}일`} />
              </View>
            </View>

            <SubSection title="걸음 추이">
              <TabRow tabs={TREND_PERIOD_TABS} activeId={trendPeriod} onChange={setTrendPeriod} />
              <TrendLineChart records={trendRecords} width={chartWidth} />
            </SubSection>

            <SubSection title="걸음 분포">
              <TabRow tabs={DISTRIBUTION_PERIOD_TABS} activeId={distributionPeriod} onChange={setDistributionPeriod} />
              <StepDistributionChart periodId={distributionPeriod} records={distributionRecords} width={chartWidth} />
            </SubSection>

            <SubSection title="평균 패턴">
              <TabRow tabs={AVERAGE_PATTERN_TABS} activeId={averagePatternMode} onChange={setAveragePatternMode} />
              <AveragePatternChart mode={averagePatternMode} records={averagePatternRecords} width={chartWidth} />
            </SubSection>
          </Section>

          <Section title="그룹 발자국">
            <View style={styles.groupPanel}>
              <Text style={styles.groupPanelTitle}>함께 걷는 기록</Text>
              <View style={styles.groupSummaryGrid}>
                <MiniStat label="그룹 걸음" value="-" />
                <MiniStat label="그룹 평균" value="-" />
                <MiniStat label="그룹 최고" value="-" />
                <MiniStat label="내 위치" value="-" />
              </View>
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

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SubSection({ title, children }) {
  return (
    <View style={styles.subSection}>
      <Text style={styles.subSectionTitle}>{title}</Text>
      {children}
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

function MiniStat({ label, value }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

function buildPersonalOverview(history, goal, streak) {
  const totalSteps = history.reduce((sum, record) => sum + (record.steps ?? 0), 0);
  const averageSteps = history.length ? Math.round(totalSteps / history.length) : 0;
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record.steps ?? 0) > (best.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);

  return {
    totalSteps,
    averageSteps,
    bestSteps: bestRecord?.steps ?? 0,
    streak,
  };
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
      icon: "👣",
      title: "오늘",
      value: latest ? `${formatNumber(latestSteps)}보` : "0보",
      note: latestSteps >= goal ? `E${latestEnergy} 달성` : `${Math.max(goal - latestSteps, 0)}보 남음`,
    },
    {
      key: "week",
      icon: "🎯",
      title: "이번 주",
      value: `${goalDays}/7`,
      note: "목표 달성 일수",
    },
    {
      key: "streak",
      icon: "🔥",
      title: "연속",
      value: `${streak}일`,
      note: "이어가는 중",
    },
    {
      key: "best",
      icon: "🏅",
      title: "최고",
      value: `${formatNumber(bestRecord?.steps ?? 0)}보`,
      note: bestRecord ? formatTrailDateLabel(bestRecord.date, bestRecord.id === latest?.id) : "기록 없음",
    },
  ];
}

function formatTrailDateLabel(value, isToday) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isToday ? "오늘" : String(value ?? "");
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  return isToday ? `오늘 · ${month}.${day}` : `${month}.${day} (${weekday})`;
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

function buildAveragePatternData(records, mode) {
  if (mode === "day") {
    const totals = DAY_BUCKETS.map(() => 0);
    const counts = DAY_BUCKETS.map(() => 0);

    for (const record of records) {
      const date = new Date(record.date);
      const weekday = Number.isNaN(date.getTime()) ? 1 : date.getDay();
      const targetIndex = weekday === 0 ? 6 : weekday - 1;
      totals[targetIndex] += Number(record.steps ?? 0);
      counts[targetIndex] += 1;
    }

    return DAY_BUCKETS.map((label, index) => ({
      label,
      value: counts[index] ? Math.round(totals[index] / counts[index]) : 0,
    }));
  }

  const totals = HOUR_BUCKETS.map(() => 0);
  const weights = HOUR_BUCKETS.map(() => 0);

  for (const record of records) {
    const steps = Number(record.steps ?? 0);
    const recordWeights = getTimeBucketWeights(steps);
    recordWeights.forEach((weight, index) => {
      totals[index] += steps * weight;
      weights[index] += weight;
    });
  }

  return HOUR_BUCKETS.map((label, index) => ({
    label,
    value: weights[index] ? Math.round(totals[index] / weights[index]) : 0,
  }));
}

function getTimeBucketWeights(steps) {
  if (steps >= 12000) {
    return [0.03, 0.08, 0.16, 0.28, 0.25, 0.2];
  }
  if (steps >= 10000) {
    return [0.04, 0.1, 0.18, 0.26, 0.22, 0.2];
  }
  if (steps >= 7000) {
    return [0.05, 0.12, 0.2, 0.25, 0.2, 0.18];
  }
  if (steps >= 3000) {
    return [0.08, 0.16, 0.2, 0.22, 0.18, 0.16];
  }
  return [0.1, 0.18, 0.2, 0.18, 0.18, 0.16];
}

function getTrendAxisMax(maxValue) {
  const floor = 15000;
  const normalized = Math.max(floor, maxValue);
  return Math.ceil(normalized / 1000) * 1000;
}

function getCountAxisMax(periodId, maxCount) {
  const floor = periodId === "7d" ? 5 : periodId === "30d" ? 20 : 40;
  if (maxCount <= floor) {
    return floor;
  }
  return Math.max(floor, Math.ceil(maxCount / 5) * 5);
}

function getPatternAxisMax(maxValue) {
  const normalized = Math.max(1000, Math.round(maxValue * 1.2));
  return Math.ceil(normalized / 1000) * 1000;
}

function getAxisTicks(maxValue) {
  return TREND_AXIS_TICKS.map((ratio) => Math.round(maxValue * ratio));
}

function TrendLineChart({ records, width: chartWidth = 280 }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const axisWidth = 44;
  const height = 176;
  const plotWidth = Math.max(180, chartWidth - axisWidth - 4);
  const paddingTop = 12;
  const paddingBottom = 32;
  const plotHeight = Math.max(1, height - paddingTop - paddingBottom);
  const maxValue = getTrendAxisMax(Math.max(0, ...records.map((record) => Number(record.steps ?? 0))));
  const gap = records.length > 1 ? plotWidth / (records.length - 1) : 0;
  const points = records.map((record, index) => {
    const value = Number(record.steps ?? 0);
    const x = records.length > 1 ? index * gap : plotWidth / 2;
    const y = paddingTop + (1 - value / maxValue) * plotHeight;
    return {
      x,
      y,
      value,
      label: record.date,
      isToday: index === records.length - 1,
      displayLabel: formatTrendShortLabel(record.date, index === records.length - 1),
    };
  });
  const ticks = getAxisTicks(maxValue);

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.axisColumn, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`trend-axis-${tickValue}-${index}`} style={[styles.axisLabel, { top }]}>
              {formatNumber(tickValue)}
            </Text>
          );
        })}
      </View>

      <View style={[styles.trendPlot, { width: plotWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index;
          return <View key={`trend-grid-${tickValue}-${index}`} style={[styles.gridLine, { top }]} />;
        })}

        {points.map((point, index) => {
          const prev = points[index - 1];
          return (
            <View key={`trend-point-${point.label}-${index}`} style={styles.pointLayer}>
              {prev ? <View style={[styles.lineSegment, buildLineSegmentStyle(prev.x, prev.y, point.x, point.y)]} /> : null}

              <Pressable
                onPress={() => setActiveIndex(index)}
                style={[styles.pointHitArea, { left: point.x - 14, top: point.y - 14 }]}
              >
                <View style={[styles.pointDot, point.isToday && styles.pointDotToday, activeIndex === index && styles.pointDotActive]} />
              </Pressable>

              {activeIndex === index ? (
                <View style={[styles.tooltip, tooltipPosition(point.x, point.y, plotWidth)]}>
                  <Text style={styles.tooltipValue}>{formatNumber(point.value)}보</Text>
                  <Text style={styles.tooltipLabel}>{point.displayLabel}</Text>
                </View>
              ) : null}

              {shouldShowTrendLabel(index, points.length) ? (
                <Text style={[styles.trendDateLabel, { left: point.x - 10, bottom: 8 }]}>
                  {point.isToday ? "오늘" : point.displayLabel}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StepDistributionChart({ records, periodId, width: chartWidth = 280 }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const axisWidth = 44;
  const height = 176;
  const plotWidth = Math.max(180, chartWidth - axisWidth - 4);
  const paddingTop = 12;
  const paddingBottom = 26;
  const plotHeight = Math.max(1, height - paddingTop - paddingBottom);
  const buckets = buildDistributionData(records);
  const maxCount = getCountAxisMax(periodId, Math.max(1, ...buckets.map((bucket) => bucket.count)));
  const ticks = getAxisTicks(maxCount);

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.axisColumn, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`distribution-axis-${tickValue}-${index}`} style={[styles.axisLabel, { top }]}>
              {formatNumber(tickValue)}
            </Text>
          );
        })}
      </View>

      <View style={[styles.barPlot, { width: plotWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index;
          return <View key={`distribution-grid-${tickValue}-${index}`} style={[styles.gridLine, { top }]} />;
        })}

        {buckets.map((bucket, index) => {
          const barHeight = (bucket.count / maxCount) * plotHeight;
          const isActive = activeIndex === index;
          return (
            <Pressable
              key={bucket.label}
              onPress={() => setActiveIndex(index)}
              style={[styles.histColumn, index > 0 && styles.histColumnOverlap]}
            >
              <View style={styles.histBarArea}>
                {isActive ? (
                  <View style={[styles.tooltip, styles.histTooltip, tooltipPosition((index / Math.max(1, buckets.length - 1)) * plotWidth, paddingTop + plotHeight - barHeight, plotWidth)]}>
                    <Text style={styles.tooltipValue}>{bucket.count}개</Text>
                    <Text style={styles.tooltipLabel}>{bucket.label}</Text>
                  </View>
                ) : null}
                <View style={[styles.histBar, { height: Math.max(6, barHeight) }]} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AveragePatternChart({ records, mode, width: chartWidth = 280 }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const axisWidth = 44;
  const height = 176;
  const plotWidth = Math.max(180, chartWidth - axisWidth - 4);
  const paddingTop = 12;
  const paddingBottom = 26;
  const plotHeight = Math.max(1, height - paddingTop - paddingBottom);
  const data = buildAveragePatternData(records, mode);
  const maxValue = getPatternAxisMax(Math.max(0, ...data.map((item) => item.value)));
  const ticks = getAxisTicks(maxValue);

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.axisColumn, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`average-axis-${tickValue}-${index}`} style={[styles.axisLabel, { top }]}>
              {formatNumber(tickValue)}
            </Text>
          );
        })}
      </View>

      <View style={[styles.barPlot, { width: plotWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index;
          return <View key={`average-grid-${tickValue}-${index}`} style={[styles.gridLine, { top }]} />;
        })}

        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * plotHeight;
          const isActive = activeIndex === index;
          return (
            <Pressable
              key={item.label}
              onPress={() => setActiveIndex(index)}
              style={[styles.histColumn, index > 0 && styles.histColumnOverlap]}
            >
              <View style={styles.histBarArea}>
                {isActive ? (
                  <View style={[styles.tooltip, styles.histTooltip, tooltipPosition((index / Math.max(1, data.length - 1)) * plotWidth, paddingTop + plotHeight - barHeight, plotWidth)]}>
                    <Text style={styles.tooltipValue}>{formatNumber(item.value)}보</Text>
                    <Text style={styles.tooltipLabel}>{item.label}</Text>
                  </View>
                ) : null}
                <View style={[styles.histBar, { height: Math.max(6, barHeight) }]} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function buildLineSegmentStyle(x1, y1, x2, y2) {
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

function tooltipPosition(x, y, width) {
  const bubbleWidth = 72;
  const bubbleHeight = 40;
  const left = Math.max(2, Math.min(x - bubbleWidth / 2, width - bubbleWidth - 2));
  const top = Math.max(2, y - bubbleHeight - 10);

  return {
    left,
    top,
    width: bubbleWidth,
    height: bubbleHeight,
  };
}

function shouldShowTrendLabel(index, total) {
  if (total <= 7) {
    return true;
  }

  const interval = Math.max(1, Math.ceil(total / 6));
  return index === total - 1 || index % interval === 0;
}

function formatTrendShortLabel(value, isToday) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isToday ? "오늘" : String(value ?? "");
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return isToday ? "오늘" : `${month}/${day}`;
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
    fontFamily: theme.fonts.body,
  },
  tabLabelActive: {
    color: "#ffffff",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  subSection: {
    gap: 8,
  },
  subSectionTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  summaryPanel: {
    gap: 8,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryStat: {
    width: "48.5%",
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  summaryStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  summaryStatValue: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  groupPanel: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  groupPanelTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  groupSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniStat: {
    flexBasis: "48.5%",
    minHeight: 54,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 2,
  },
  miniStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  miniStatValue: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  chartFrame: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 2,
  },
  axisColumn: {
    position: "relative",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 12,
    paddingBottom: 26,
  },
  axisLabel: {
    position: "absolute",
    right: 0,
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  trendPlot: {
    position: "relative",
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ececea",
  },
  pointLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: "absolute",
    height: 2,
    backgroundColor: "#111111",
    borderRadius: 999,
    opacity: 0.75,
  },
  pointHitArea: {
    position: "absolute",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#111111",
  },
  pointDotToday: {
    backgroundColor: "#111111",
  },
  pointDotActive: {
    width: 11,
    height: 11,
  },
  trendDateLabel: {
    position: "absolute",
    color: theme.colors.inkSoft,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  tooltip: {
    position: "absolute",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    zIndex: 20,
    elevation: 3,
  },
  tooltipValue: {
    color: theme.colors.ink,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  tooltipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  barPlot: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  histColumn: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
  },
  histColumnOverlap: {
    marginLeft: -1,
  },
  histBarArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  histBar: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#111111",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  histTooltip: {
    zIndex: 30,
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
    fontFamily: theme.fonts.body,
  },
});
