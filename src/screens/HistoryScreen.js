import { useMemo, useRef, useState } from "react";
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

const HOUR_BUCKETS = ["0-3시", "3-6시", "6-9시", "9-12시", "12-15시", "15-18시", "18-21시", "21-24시"];
const DAY_BUCKETS = ["월", "화", "수", "목", "금", "토", "일"];
const TREND_AXIS_TICKS = [1, 0.75, 0.5, 0.25, 0];
const CHART_AXIS_WIDTH = 40;

export function HistoryScreen() {
  const { history, goal } = useStepData();
  const { width } = useWindowDimensions();
  const [storyTab, setStoryTab] = useState("footprints");
  const [achievementTab, setAchievementTab] = useState("mission");
  const [trendPeriod, setTrendPeriod] = useState("7d");
  const [distributionPeriod, setDistributionPeriod] = useState("7d");
  const [averagePatternMode, setAveragePatternMode] = useState("time");
  const [chartsScrollLocked, setChartsScrollLocked] = useState(false);

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!chartsScrollLocked}
    >
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
                <SummaryStat icon="🏅" label="최고 걸음" value={`${formatNumber(personalOverview.bestSteps)}보`} />
                <SummaryStat icon="🔥" label="최고 연속" value={`${personalOverview.streak}일`} />
              </View>
            </View>

            <SubSection title="걸음 기록">
              <TabRow tabs={TREND_PERIOD_TABS} activeId={trendPeriod} onChange={setTrendPeriod} />
              <TrendLineChart records={trendRecords} width={chartWidth} onGestureLockChange={setChartsScrollLocked} />
            </SubSection>

            <SubSection title="걸음 분포">
              <TabRow tabs={DISTRIBUTION_PERIOD_TABS} activeId={distributionPeriod} onChange={setDistributionPeriod} />
              <StepDistributionChart
                periodId={distributionPeriod}
                records={distributionRecords}
                width={chartWidth}
                onGestureLockChange={setChartsScrollLocked}
              />
            </SubSection>

            <SubSection title="평균 걸음">
              <TabRow tabs={AVERAGE_PATTERN_TABS} activeId={averagePatternMode} onChange={setAveragePatternMode} />
              <AveragePatternChart
                mode={averagePatternMode}
                records={averagePatternRecords}
                width={chartWidth}
                onGestureLockChange={setChartsScrollLocked}
              />
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

function formatAxisStepLabel(value) {
  const numeric = Math.max(0, Math.floor(Number(value ?? 0)));
  if (numeric === 0) {
    return "0";
  }

  if (numeric >= 10000) {
    const tenThousands = Math.floor(numeric / 10000);
    const thousands = Math.floor((numeric % 10000) / 1000);
    return thousands > 0 ? `${tenThousands}만\u00A0${thousands}천` : `${tenThousands}만`;
  }

  const thousands = Math.floor(numeric / 1000);
  return `${thousands}천`;
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
  const values = records.map((record) => Math.max(0, Number(record.steps ?? 0)));
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const bucketSize = 1000;
  const start = Math.floor(minValue / bucketSize) * bucketSize;
  const end = Math.ceil(maxValue / bucketSize) * bucketSize;
  const safeEnd = Math.max(start, end);
  const bucketCount = Math.max(1, Math.floor((safeEnd - start) / bucketSize) + 1);

  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    bucket: index,
    value: start + index * bucketSize,
    label: formatDistributionBucketLabel(start + index * bucketSize),
    count: 0,
  }));

  for (const steps of values) {
    const bucketIndex = Math.min(bucketCount - 1, Math.max(0, Math.floor((steps - start) / bucketSize)));
    buckets[bucketIndex].count += 1;
  }

  return buckets;
}

function formatDistributionBucketLabel(value) {
  const numeric = Math.max(0, Math.floor(Number(value ?? 0)));
  if (numeric < 10000) {
    return `${Math.floor(numeric / 1000)}천보`;
  }

  const tenThousands = Math.floor(numeric / 10000);
  const thousands = Math.floor((numeric % 10000) / 1000);
  if (thousands === 0) {
    return `${tenThousands}만보`;
  }
  return `${tenThousands}만 ${thousands}천보`;
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

  const labels = HOUR_BUCKETS;
  const totals = labels.map(() => 0);
  const counts = labels.map(() => 0);

  for (const record of records) {
    const steps = Number(record.steps ?? 0);
    const weights = getTimeBucketWeights(steps);
    weights.forEach((weight, index) => {
      totals[index] += steps * weight;
      counts[index] += weight;
    });
  }

  return labels.map((label, index) => ({
    label,
    value: counts[index] ? Math.round(totals[index] / counts[index]) : 0,
  }));
}

function getTimeBucketWeights(steps) {
  if (steps >= 12000) {
    return [0.02, 0.05, 0.1, 0.18, 0.18, 0.16, 0.16, 0.15];
  }
  if (steps >= 10000) {
    return [0.03, 0.06, 0.11, 0.18, 0.17, 0.15, 0.15, 0.15];
  }
  if (steps >= 7000) {
    return [0.04, 0.08, 0.12, 0.17, 0.16, 0.15, 0.14, 0.14];
  }
  if (steps >= 3000) {
    return [0.05, 0.1, 0.13, 0.16, 0.15, 0.14, 0.14, 0.13];
  }
  return [0.07, 0.11, 0.13, 0.15, 0.14, 0.13, 0.14, 0.13];
}

function getTrendAxisMax(maxValue) {
  const floor = 15000;
  const normalized = Math.max(floor, maxValue);
  return Math.ceil(normalized / 1000) * 1000;
}

function getCountAxisMax(periodId, maxCount) {
  const baseTarget = getCountAxisBaseTarget(periodId);
  const normalizedMax = Math.max(baseTarget, Math.max(0, Number(maxCount ?? 0)));
  return Math.ceil(normalizedMax / 4) * 4;
}

function getCountAxisBaseTarget(periodId) {
  const days = periodId === "7d" ? 7 : periodId === "30d" ? 30 : 365;
  return Math.ceil((days / 2) / 4) * 4;
}

function getPatternAxisMax(maxValue) {
  const normalized = Math.max(1000, Math.round(maxValue * 1.2));
  return Math.ceil(normalized / 1000) * 1000;
}

function getAxisTicks(maxValue) {
  return TREND_AXIS_TICKS.map((ratio) => Math.round(maxValue * ratio));
}

function getCenteredTrackLayout(totalWidth, itemCount, fillRatio) {
  const safeCount = Math.max(1, itemCount);
  const contentWidth = Math.max(0, totalWidth * fillRatio);
  const startX = (totalWidth - contentWidth) / 2;
  const step = safeCount > 1 ? contentWidth / (safeCount - 1) : 0;
  const slotWidth = safeCount > 0 ? contentWidth / safeCount : contentWidth;

  return {
    contentWidth,
    startX,
    step,
    slotWidth,
  };
}

function TrendLineChart({ records, width: chartWidth = 280, onGestureLockChange = () => {} }) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, records.length - 1));
  const [cursorX, setCursorX] = useState(null);
  const gestureState = useRef({
    startX: 0,
    startY: 0,
    active: false,
  });
  const axisWidth = CHART_AXIS_WIDTH;
  const height = 176;
  const plotWidth = Math.max(180, chartWidth - axisWidth);
  const paddingTop = 12;
  const paddingBottom = 32;
  const plotHeight = Math.max(1, height - paddingTop - paddingBottom);
  const maxValue = getTrendAxisMax(Math.max(0, ...records.map((record) => Number(record.steps ?? 0))));
  const track = getCenteredTrackLayout(plotWidth, records.length, 0.8);
  const points = records.map((record, index) => {
    const value = Number(record.steps ?? 0);
    const x = records.length > 1 ? track.startX + index * track.step : plotWidth / 2;
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
  const activePoint = points[Math.min(Math.max(activeIndex, 0), Math.max(points.length - 1, 0))] ?? null;
  const activeLineX = cursorX ?? activePoint?.x ?? plotWidth / 2;
  const bubblePosition = activePoint
    ? {
        left: Math.max(0, Math.min(activeLineX - 28, plotWidth - 56)),
        top: Math.max(0, paddingTop + 2),
      }
    : null;

  const updateCursor = (locationX) => {
    if (!points.length) {
      return;
    }

    const x = Math.max(0, Math.min(plotWidth, locationX));
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    points.forEach((point, index) => {
      const distance = Math.abs(point.x - x);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
    setCursorX(x);
  };

  const beginGesture = (event) => {
    onGestureLockChange(true);
    gestureState.current.startX = event.nativeEvent.locationX;
    gestureState.current.startY = event.nativeEvent.locationY;
    gestureState.current.active = true;
    updateCursor(event.nativeEvent.locationX);
  };

  const resetGesture = () => {
    gestureState.current.active = false;
    onGestureLockChange(false);
  };

  const shouldCaptureGesture = (event) => {
    const { active, startX, startY } = gestureState.current;
    if (!active) {
      gestureState.current.startX = event.nativeEvent.locationX;
      gestureState.current.startY = event.nativeEvent.locationY;
      gestureState.current.active = true;
      return false;
    }

    const dx = Math.abs(event.nativeEvent.locationX - startX);
    const dy = Math.abs(event.nativeEvent.locationY - startY);

    if (dx < 8 && dy < 8) {
      return false;
    }

    const shouldLock = dx > dy * 1.15;
    if (shouldLock) {
      onGestureLockChange(true);
    }
    return shouldLock;
  };

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.axisColumn, styles.tightAxisColumn, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`trend-axis-${tickValue}-${index}`} style={[styles.axisLabel, { top }]} numberOfLines={1}>
              {formatAxisStepLabel(tickValue)}
            </Text>
          );
        })}
      </View>

      <View
        style={[styles.trendPlot, { width: plotWidth, height }]}
        onStartShouldSetResponder={() => false}
        onMoveShouldSetResponderCapture={shouldCaptureGesture}
        onResponderGrant={beginGesture}
        onResponderMove={(event) => updateCursor(event.nativeEvent.locationX)}
        onResponderRelease={resetGesture}
        onResponderTerminate={resetGesture}
        onResponderTerminationRequest={() => false}
      >
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index;
          return <View key={`trend-grid-${tickValue}-${index}`} style={[styles.gridLine, { top }]} />;
        })}

        {activePoint ? (
          <View
            pointerEvents="none"
            style={[
              styles.trendCursorLine,
              {
                left: activeLineX,
                top: paddingTop,
                height: plotHeight,
              },
            ]}
          />
        ) : null}

        <View pointerEvents="none" style={styles.trendSegmentsLayer}>
          {points.slice(1).map((point, index) => {
            const prev = points[index];
            return (
              <View
                key={`trend-segment-${point.label}-${index}`}
                style={[styles.lineSegment, buildLineSegmentStyle(prev.x, prev.y, point.x, point.y)]}
              />
            );
          })}
        </View>

        <View pointerEvents="none" style={styles.trendOverlayLayer}>
          {points.map((point, index) => {
            const isActive = index === activeIndex;
            return (
              <View key={`trend-point-${point.label}-${index}`} style={styles.pointLayer}>
                <View style={[styles.pointHitArea, { left: point.x - 16, top: point.y - 16 }]}>
                  <View style={[styles.pointDot, point.isToday && styles.pointDotToday, isActive && styles.pointDotActive]} />
                </View>

                {isActive && bubblePosition ? (
                  <View style={[styles.tooltip, styles.trendTooltip, bubblePosition]}>
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
    </View>
  );
}

function MetricLineChart({
  items,
  width: chartWidth = 280,
  yMax,
  yTicks,
  formatYAxisLabel,
  formatTooltipValue,
  formatTooltipLabel,
  xLabelClassName = "compact",
  xLabelEvery = 1,
  onGestureLockChange = () => {},
}) {
  const [activeIndex, setActiveIndex] = useState(Math.max(0, items.length - 1));
  const [cursorX, setCursorX] = useState(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 56, height: 32 });
  const gestureState = useRef({
    startX: 0,
    startY: 0,
    active: false,
  });
  const axisWidth = CHART_AXIS_WIDTH;
  const height = 186;
  const plotWidth = Math.max(190, chartWidth - axisWidth);
  const paddingTop = 12;
  const paddingBottom = 28;
  const plotHeight = Math.max(1, height - paddingTop - paddingBottom);
  const track = getCenteredTrackLayout(plotWidth, items.length, 0.8);
  const bars = items.map((item, index) => {
    const value = Number(item.value ?? 0);
    const x = items.length > 1 ? track.startX + index * track.slotWidth : plotWidth / 2 - track.slotWidth / 2;
    const barHeight = (value / yMax) * plotHeight;
    const centerX = x + track.slotWidth / 2;
    return {
      ...item,
      value,
      x,
      centerX,
      barHeight,
    };
  });
  const ticks = yTicks;
  const activeBar = bars[Math.min(Math.max(activeIndex, 0), Math.max(bars.length - 1, 0))] ?? null;
  const activeLineX = cursorX ?? activeBar?.centerX ?? plotWidth / 2;
  const tooltipPositionForBar = activeBar
    ? {
        left: Math.max(0, Math.min(activeLineX - tooltipSize.width / 2, plotWidth - tooltipSize.width)),
        top: Math.max(0, paddingTop + 2),
      }
    : null;

  const updateCursor = (locationX) => {
    if (!bars.length) {
      return;
    }

    const x = Math.max(0, Math.min(plotWidth, locationX));
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    bars.forEach((bar, index) => {
      const distance = Math.abs(bar.centerX - x);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
    setCursorX(x);
  };

  const beginGesture = (event) => {
    onGestureLockChange(true);
    gestureState.current.startX = event.nativeEvent.locationX;
    gestureState.current.startY = event.nativeEvent.locationY;
    gestureState.current.active = true;
    updateCursor(event.nativeEvent.locationX);
  };

  const resetGesture = () => {
    gestureState.current.active = false;
    onGestureLockChange(false);
  };

  const shouldCaptureGesture = (event) => {
    const { active, startX, startY } = gestureState.current;
    if (!active) {
      gestureState.current.startX = event.nativeEvent.locationX;
      gestureState.current.startY = event.nativeEvent.locationY;
      gestureState.current.active = true;
      return false;
    }

    const dx = Math.abs(event.nativeEvent.locationX - startX);
    const dy = Math.abs(event.nativeEvent.locationY - startY);

    if (dx < 8 && dy < 8) {
      return false;
    }

    const shouldLock = dx > dy * 1.15;
    if (shouldLock) {
      onGestureLockChange(true);
    }
    return shouldLock;
  };

  return (
    <View style={styles.chartFrame}>
      <View style={[styles.axisColumn, styles.tightAxisColumn, { width: axisWidth, height }]}>
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index - 8;
          return (
            <Text key={`metric-axis-${tickValue}-${index}`} style={[styles.axisLabel, { top }]} numberOfLines={1}>
              {formatYAxisLabel(tickValue)}
            </Text>
          );
        })}
      </View>

      <View
        style={[styles.barPlot, { width: plotWidth, height }]}
        onStartShouldSetResponder={() => false}
        onMoveShouldSetResponderCapture={shouldCaptureGesture}
        onResponderGrant={beginGesture}
        onResponderMove={(event) => updateCursor(event.nativeEvent.locationX)}
        onResponderRelease={resetGesture}
        onResponderTerminate={resetGesture}
        onResponderTerminationRequest={() => false}
      >
        {ticks.map((tickValue, index) => {
          const top = paddingTop + (plotHeight / (ticks.length - 1 || 1)) * index;
          return <View key={`metric-grid-${tickValue}-${index}`} style={[styles.gridLine, { top }]} />;
        })}

        {cursorX != null ? (
          <View
            pointerEvents="none"
            style={[
              styles.chartCursorLine,
              {
                left: activeLineX,
                top: paddingTop,
                height: plotHeight,
              },
            ]}
          />
        ) : null}

        <View
          style={[
            styles.histTrack,
            {
              left: track.startX,
              width: track.contentWidth,
              top: paddingTop,
              height: plotHeight,
            },
          ]}
        >
          {bars.map((bar, index) => {
            const isActive = index === activeIndex;
            return (
              <Pressable
                key={bar.label}
                onPress={() => {
                  setActiveIndex(index);
                  setCursorX(bar.centerX);
                }}
                style={[styles.histColumn, { width: track.slotWidth }]}
              >
                <View style={styles.histBarArea}>
                  <View
                    style={[
                      styles.histBar,
                      isActive && styles.histBarActive,
                      { height: Math.max(6, bar.barHeight) },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {isTooltipVisible(tooltipPositionForBar) ? (
          <View
            pointerEvents="none"
            style={[styles.tooltip, styles.histTooltip, tooltipPositionForBar]}
            onLayout={(event) => {
              const { width, height: measuredHeight } = event.nativeEvent.layout;
              setTooltipSize((current) =>
                current.width === width && current.height === measuredHeight
                  ? current
                  : { width, height: measuredHeight },
              );
            }}
          >
            <Text style={styles.tooltipValue}>{formatTooltipValue(activeBar.value)}</Text>
            <Text style={styles.tooltipLabel}>{formatTooltipLabel(activeBar.label)}</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.histXAxisRow,
            {
              marginLeft: track.startX,
              width: track.contentWidth,
              marginTop: 6,
            },
          ]}
        >
          {bars.map((bar, index) =>
            index % xLabelEvery === 0 ? (
              <View key={`metric-axis-label-${bar.label}-${index}`} style={[styles.histColumn, { width: track.slotWidth }]}>
                <Text
                  style={[
                    styles.histXAxisLabel,
                    xLabelClassName === "wide" ? styles.histXAxisLabelWide : styles.histXAxisLabelCompact,
                  ]}
                >
                  {bar.label}
                </Text>
              </View>
            ) : (
              <View key={`metric-axis-gap-${bar.label}-${index}`} style={[styles.histColumn, { width: track.slotWidth }]} />
            ),
          )}
        </View>
      </View>
    </View>
  );
}

function isTooltipVisible(position) {
  return Boolean(position);
}

function StepDistributionChart({ records, periodId, width: chartWidth = 280, onGestureLockChange = () => {} }) {
  const buckets = buildDistributionData(records);
  const maxCount = getCountAxisMax(periodId, Math.max(1, ...buckets.map((bucket) => bucket.count)));

  return (
    <MetricLineChart
      items={buckets.map((bucket) => ({
        label: bucket.label,
        value: bucket.count,
      }))}
      width={chartWidth}
      yMax={maxCount}
      yTicks={getAxisTicks(maxCount)}
      formatYAxisLabel={formatCountAxisLabel}
      formatTooltipValue={(value) => `${value}번`}
      formatTooltipLabel={(label) => label}
      xLabelClassName="compact"
      xLabelEvery={2}
      onGestureLockChange={onGestureLockChange}
    />
  );
}

function AveragePatternChart({ records, mode, width: chartWidth = 280, onGestureLockChange = () => {} }) {
  const data = buildAveragePatternData(records, mode);
  const maxValue = getPatternAxisMax(Math.max(0, ...data.map((item) => item.value)));

  return (
    <MetricLineChart
      items={data}
      width={chartWidth}
      yMax={maxValue}
      yTicks={getAxisTicks(maxValue)}
      formatYAxisLabel={formatAxisStepLabel}
      formatTooltipValue={(value) => `${formatNumber(value)}보`}
      formatTooltipLabel={(label) => label}
      xLabelClassName="wide"
      xLabelEvery={1}
      onGestureLockChange={onGestureLockChange}
    />
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
  const bubbleWidth = 56;
  const bubbleHeight = 32;
  const left = Math.max(0, Math.min(x - bubbleWidth / 2, width - bubbleWidth));
  const top = Math.max(0, y - bubbleHeight - 10);

  return {
    left,
    top,
    width: bubbleWidth,
    height: bubbleHeight,
  };
}

function tooltipPositionOnLine(x, y, width) {
  const bubbleWidth = 56;
  const bubbleHeight = 32;
  const left = Math.max(0, Math.min(x - bubbleWidth / 2, width - bubbleWidth));
  const top = Math.max(0, y - bubbleHeight - 10);

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

function formatCountAxisLabel(value) {
  const numeric = Math.max(0, Math.floor(Number(value ?? 0)));
  return `${numeric}개`;
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
    flexWrap: "nowrap",
    gap: 8,
  },
  summaryStat: {
    flex: 1,
    minWidth: 0,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 2,
  },
  summaryStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  summaryStatValue: {
    color: theme.colors.ink,
    fontSize: 13,
    lineHeight: 15,
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
    gap: 0,
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
    lineHeight: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  trendPlot: {
    position: "relative",
    overflow: "visible",
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
  trendSegmentsLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    elevation: 1,
  },
  trendOverlayLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
  },
  lineSegment: {
    position: "absolute",
    height: 2,
    backgroundColor: "#111111",
    borderRadius: 999,
    opacity: 0.75,
    zIndex: 1,
  },
  pointHitArea: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
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
  trendCursorLine: {
    position: "absolute",
    width: 1,
    backgroundColor: "#d6d6d6",
    opacity: 1,
    zIndex: 10,
  },
  chartCursorLine: {
    position: "absolute",
    width: 1,
    backgroundColor: "#d6d6d6",
    opacity: 1,
    zIndex: 10,
  },
  trendDateLabel: {
    position: "absolute",
    color: theme.colors.inkSoft,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
    zIndex: 5,
  },
  trendDateLabelCompact: {
    fontSize: 9,
    lineHeight: 11,
  },
  trendDateLabelWide: {
    fontSize: 9,
    lineHeight: 11,
  },
  trendTooltip: {
    zIndex: 30,
    elevation: 30,
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
    zIndex: 30,
    elevation: 30,
  },
  tooltipValue: {
    color: theme.colors.ink,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  tooltipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  barPlot: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    overflow: "visible",
  },
  histTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    overflow: "visible",
  },
  histXAxisRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    overflow: "visible",
    marginTop: 4,
  },
  histColumn: {
    minWidth: 0,
    alignSelf: "stretch",
    alignItems: "center",
  },
  histBarArea: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  histBar: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#111111",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  histBarActive: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#fbfbf8",
  },
  histXAxisLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    textAlign: "center",
    includeFontPadding: false,
  },
  histXAxisLabelCompact: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    textAlign: "center",
    includeFontPadding: false,
  },
  histXAxisLabelWide: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    textAlign: "center",
    includeFontPadding: false,
  },
  histTooltip: {
    zIndex: 100,
    elevation: 10,
  },
  tightAxisColumn: {
    paddingRight: 2,
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
    fontSize: 10,
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
