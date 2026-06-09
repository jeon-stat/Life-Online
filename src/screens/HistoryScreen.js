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

const TOP_TICK_RATIOS = [1, 0.75, 0.5, 0.25, 0];
const TIME_BUCKETS = ["새벽", "아침", "점심", "오후", "저녁", "밤"];
const DAY_BUCKETS = ["월", "화", "수", "목", "금", "토", "일"];

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
  const trendRecords = useMemo(
    () => buildPeriodRecords(history, trendPeriodConfig.days),
    [history, trendPeriodConfig.days],
  );
  const distributionRecords = useMemo(
    () => buildPeriodRecords(history, distributionPeriodConfig.days),
    [distributionPeriodConfig.days, history],
  );
  const averagePatternRecords = trendRecords;
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
          <Section title="개인 발자국">
            <View style={styles.sectionIntroCard}>
              <Text style={styles.sectionIntroTitle}>나만의 걸음 흐름</Text>
              <Text style={styles.sectionIntroText}>
                기간별로 걸음 변화와 분포를 살펴보고, 시간대와 요일별 패턴도 볼 수 있어요.
              </Text>

              <View style={styles.summaryGrid}>
                <SummaryStat icon="👣" label="총 걸음" value={`${formatNumber(personalOverview.totalSteps)}보`} />
                <SummaryStat icon="📈" label="평균" value={`${formatNumber(personalOverview.averageSteps)}보`} />
                <SummaryStat icon="🏅" label="최고" value={`${formatNumber(personalOverview.bestSteps)}보`} />
                <SummaryStat icon="🔥" label="연속" value={`${personalOverview.streak}일`} />
              </View>

              {personalOverview.narrative ? <Text style={styles.sectionNarrative}>{personalOverview.narrative}</Text> : null}
            </View>

            <SubSection title="걸음 추이">
              <TabRow tabs={TREND_PERIOD_TABS} activeId={trendPeriod} onChange={setTrendPeriod} />
              <View style={styles.chartCard}>
                <TrendLineChart records={trendRecords} width={chartViewportWidth} />
              </View>
            </SubSection>

            <SubSection title="걸음 분포">
              <TabRow tabs={TREND_PERIOD_TABS} activeId={distributionPeriod} onChange={setDistributionPeriod} />
              <View style={styles.chartCard}>
                <StepDistributionChart periodId={distributionPeriod} records={distributionRecords} width={chartViewportWidth} />
              </View>
            </SubSection>

            <SubSection title="평균 패턴">
              <TabRow tabs={AVERAGE_PATTERN_TABS} activeId={averagePatternMode} onChange={setAveragePatternMode} />
              <View style={styles.chartCard}>
                <AveragePatternChart mode={averagePatternMode} records={averagePatternRecords} width={chartViewportWidth} />
              </View>
            </SubSection>
          </Section>

          <Section title="그룹 발자국">
            <View style={styles.groupFootprintCard}>
              <Text style={styles.groupFootprintTitle}>함께 걷는 기록</Text>
              <Text style={styles.groupFootprintText}>
                그룹에 들어가면 개인 발자국과 따로, 함께 걷는 흐름이 여기에 쌓여요.
              </Text>

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
      <Text style={styles.miniStatValue} numberOfLines={1}>
        {value}
      </Text>
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
    narrative: buildPersonalNarrative(history, goal, streak, bestRecord),
  };
}

function buildPersonalNarrative(history, goal, streak, bestRecord) {
  if (!history.length) {
    return "아직 기록이 없어요. 오늘부터 개인 발자국이 쌓여요.";
  }

  const totalSteps = history.reduce((sum, record) => sum + (record.steps ?? 0), 0);
  const bestSteps = bestRecord?.steps ?? 0;
  const latestSteps = history[0]?.steps ?? 0;
  const goalDays = history.reduce((count, record) => count + ((record?.steps ?? 0) >= goal ? 1 : 0), 0);

  return `이번 기간에는 총 ${formatNumber(totalSteps)}보를 걸었고, 최고 ${formatNumber(bestSteps)}보를 기록했어요. 오늘은 ${formatNumber(latestSteps)}보, 목표 달성은 ${goalDays}일이에요.`;
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

  const totals = TIME_BUCKETS.map(() => 0);
  const weights = TIME_BUCKETS.map(() => 0);

  for (const record of records) {
    const steps = Number(record.steps ?? 0);
    const recordWeights = getTimeBucketWeights(steps);
    recordWeights.forEach((weight, index) => {
      totals[index] += steps * weight;
      weights[index] += weight;
    });
  }

  return TIME_BUCKETS.map((label, index) => ({
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

function formatPeriodValue(periodId, value) {
  if (periodId === "7d") {
    return Math.max(5, value);
  }

  if (periodId === "30d") {
    return Math.max(20, value);
  }

  return Math.max(40, value);
}

function buildTickValues(maxValue, count = 5) {
  return TOP_TICK_RATIOS.slice(0, count).map((ratio) => Math.round(maxValue * ratio));
}

function getSteppedAxisMax(maxValue, floor = 15000, step = 1000) {
  const normalized = Math.max(floor, maxValue);
  return Math.max(step, Math.ceil(normalized / step) * step);
}

function getCountAxisMax(periodId, maxCount) {
  const floor = periodId === "7d" ? 5 : periodId === "30d" ? 20 : 40;
  if (maxCount <= floor) {
    return floor;
  }
  if (maxCount <= 10) {
    return 10;
  }
  if (maxCount <= 20) {
    return 20;
  }
  if (maxCount <= 30) {
    return 30;
  }
  return Math.ceil(maxCount / 10) * 10;
}

function HorizontalChartScroll({ children }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScrollContent}>
      {children}
    </ScrollView>
  );
}

function TrendLineChart({ records, width: chartWidth = 320 }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const height = 240;
  const axisWidth = 56;
  const plotPadding = { top: 22, right: 18, bottom: 42, left: 10 };
  const maxValue = getSteppedAxisMax(Math.max(0, ...records.map((record) => Number(record.steps ?? 0))));
  const plotHeight = Math.max(1, height - plotPadding.top - plotPadding.bottom);
  const plotWidth = Math.max(chartWidth, Math.max(320, records.length * 42 + plotPadding.left + plotPadding.right));
  const gap = records.length > 1 ? (plotWidth - plotPadding.left - plotPadding.right) / (records.length - 1) : 0;
  const points = records.map((record, index) => {
    const x = records.length > 1 ? plotPadding.left + index * gap : plotWidth / 2;
    const value = Number(record.steps ?? 0);
    const y = plotPadding.top + (1 - value / maxValue) * plotHeight;
    return {
      x,
      y,
      value,
      date: record.date,
      isToday: index === records.length - 1,
      label: formatTrendDateLabel(record.date, index === records.length - 1, records.length),
    };
  });
  const ticks = buildTickValues(maxValue, 5);

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.chartAxis, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = plotPadding.top + (plotHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`${tickValue}-${index}`} style={[styles.chartAxisLabel, { top }]}>
              {formatNumber(tickValue)}
            </Text>
          );
        })}
      </View>

      <HorizontalChartScroll>
        <View style={[styles.trendPlot, { width: plotWidth, height }]}>
          {ticks.map((tickValue, index) => {
            const top = plotPadding.top + (plotHeight / (ticks.length - 1 || 1)) * index;
            return <View key={`grid-${tickValue}-${index}`} style={[styles.trendGridLine, { top }]} />;
          })}

          {points.map((point, index) => {
            const prev = points[index - 1];
            return (
              <View key={`${point.date}-${index}`} style={styles.trendPointLayer}>
                {prev ? <View style={[styles.trendSegment, buildSegmentStyle(prev.x, prev.y, point.x, point.y)]} /> : null}

                <Pressable
                  onPress={() => setActiveIndex(index)}
                  style={[styles.trendPointHitArea, { left: point.x - 12, top: point.y - 12 }]}
                >
                  <View style={[styles.trendPoint, point.isToday && styles.trendPointToday, activeIndex === index && styles.trendPointActive]} />
                </Pressable>

                {activeIndex === index ? (
                  <View style={[styles.trendTooltip, tooltipPosition(point.x, point.y, plotWidth)]}>
                    <Text style={styles.trendTooltipValue}>{formatNumber(point.value)}보</Text>
                    <Text style={styles.trendTooltipLabel}>{point.label}</Text>
                  </View>
                ) : null}

                {shouldShowTrendLabel(index, points.length) ? (
                  <Text style={[styles.trendDateLabel, { left: point.x - 14, bottom: 10 }]}>{point.isToday ? "오늘" : formatTrendShortLabel(point.date)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </HorizontalChartScroll>
    </View>
  );
}

function StepDistributionChart({ records, periodId, width: chartWidth = 320 }) {
  const buckets = buildDistributionData(records);
  const maxCount = getCountAxisMax(periodId, Math.max(1, ...buckets.map((bucket) => bucket.count)));
  const height = 220;
  const axisWidth = 56;
  const barAreaWidth = Math.max(chartWidth, Math.max(320, buckets.length * 46 + 12));
  const barTrackHeight = 118;
  const ticks = buildTickValues(maxCount, 5);

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.chartAxis, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = 18 + (barTrackHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`${tickValue}-${index}`} style={[styles.chartAxisLabel, { top }]}>
              {formatNumber(tickValue)}
            </Text>
          );
        })}
      </View>

      <HorizontalChartScroll>
        <View style={[styles.barPlot, { width: barAreaWidth, height }]}>
          {ticks.map((tickValue, index) => {
            const top = 18 + (barTrackHeight / (ticks.length - 1 || 1)) * index;
            return <View key={`bar-grid-${tickValue}-${index}`} style={[styles.barGridLine, { top }]} />;
          })}

          {buckets.map((bucket, index) => {
            const barHeight = (bucket.count / maxCount) * barTrackHeight;
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
      </HorizontalChartScroll>
    </View>
  );
}

function AveragePatternChart({ records, mode, width: chartWidth = 320 }) {
  const data = buildAveragePatternData(records, mode);
  const maxValue = getSteppedAxisMax(Math.max(0, ...data.map((item) => item.value)));
  const height = 220;
  const axisWidth = 56;
  const barAreaWidth = Math.max(chartWidth, Math.max(320, data.length * 52 + 12));
  const barTrackHeight = 118;
  const ticks = buildTickValues(maxValue, 5);

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.chartAxis, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = 18 + (barTrackHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`${tickValue}-${index}`} style={[styles.chartAxisLabel, { top }]}>
              {formatNumber(tickValue)}
            </Text>
          );
        })}
      </View>

      <HorizontalChartScroll>
        <View style={[styles.barPlot, { width: barAreaWidth, height }]}>
          {ticks.map((tickValue, index) => {
            const top = 18 + (barTrackHeight / (ticks.length - 1 || 1)) * index;
            return <View key={`avg-grid-${tickValue}-${index}`} style={[styles.barGridLine, { top }]} />;
          })}

          {data.map((item) => {
            const barHeight = (item.value / maxValue) * barTrackHeight;
            return (
              <View key={item.label} style={styles.barColumn}>
                <Text style={styles.barValue}>{formatNumber(item.value)}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.patternFill, { height: Math.max(10, barHeight) }]} />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </HorizontalChartScroll>
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

function tooltipPosition(x, y, width) {
  const bubbleWidth = 80;
  const bubbleHeight = 44;
  const left = Math.max(6, Math.min(x - bubbleWidth / 2, width - bubbleWidth - 6));
  const top = Math.max(8, y - bubbleHeight - 10);
  return {
    left,
    top,
    width: bubbleWidth,
    height: bubbleHeight,
  };
}

function shouldShowTrendLabel(index, total) {
  if (total <= 10) {
    return true;
  }

  const interval = Math.ceil(total / 8);
  return index === total - 1 || index % interval === 0;
}

function formatTrendDateLabel(value, isToday, total) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isToday ? "오늘" : String(value ?? "");
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (total <= 10) {
    return isToday ? "오늘" : `${month}/${day}`;
  }
  return isToday ? "오늘" : `${month}/${day}`;
}

function formatTrendShortLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value ?? "");
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
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
    gap: 10,
  },
  subSectionTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  sectionIntroCard: {
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  sectionIntroTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  sectionIntroText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  sectionNarrative: {
    color: theme.colors.ink,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
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
    backgroundColor: theme.colors.surfaceMuted,
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
  chartCard: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  chartFrame: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    minHeight: 220,
  },
  chartAxis: {
    position: "relative",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 18,
    paddingBottom: 22,
  },
  chartAxisLabel: {
    position: "absolute",
    right: 0,
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  trendPlot: {
    position: "relative",
    borderRadius: 18,
    backgroundColor: "#fbfbfa",
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  trendGridLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ececea",
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
  trendPointHitArea: {
    position: "absolute",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  trendPoint: {
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
  trendPointActive: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: "#111111",
  },
  trendTooltip: {
    position: "absolute",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    zIndex: 20,
  },
  trendTooltipValue: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  trendTooltipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  trendDateLabel: {
    position: "absolute",
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  barPlot: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 18,
    paddingBottom: 12,
    gap: 0,
    borderRadius: 18,
    backgroundColor: "#fbfbfa",
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  barGridLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ececea",
  },
  barColumn: {
    flex: 1,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingHorizontal: 0,
  },
  barValue: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  barTrack: {
    width: "100%",
    height: 118,
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 0,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: "#111111",
    minHeight: 8,
  },
  patternFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: "#111111",
    minHeight: 10,
  },
  barLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  chartScrollContent: {
    paddingRight: 8,
  },
  groupFootprintCard: {
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  groupFootprintTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  groupFootprintText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  groupSummaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  miniStat: {
    flex: 1,
    minWidth: "47%",
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
