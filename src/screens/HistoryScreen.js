import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { formatDisplayDate } from "../game/dateUtils.js";

export function HistoryScreen() {
  const { history, goal, growth } = useStepData();
  const chartRecords = history.slice(0, 14).reverse();
  const maxSteps = Math.max(goal, ...chartRecords.map((record) => record?.steps ?? 0), 1);
  const currentWeekKey = growth.currentWeekKey;
  const weeklySummary = growth.weeklySummary;
  const recentLevelUps = (growth.levelUpEvents ?? []).slice(0, 5);

  const weeklyGoalDays = weeklySummary?.growCount ?? 0;
  const weeklyKeepDays = weeklySummary?.keepCount ?? 0;
  const weeklyDropDays = weeklySummary?.dropCount ?? 0;
  const weeklyRestCount = weeklySummary?.restCount ?? 0;

  const resultRows = useMemo(
    () =>
      (growth.recentDailyResults ?? []).map((result) => ({
        ...result,
        percent: Math.round((result.ratio ?? 0) * 100),
        label: buildResultLabel(result),
      })),
    [growth.recentDailyResults],
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>기록</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>최근 걸음 그래프</Text>
        <View style={styles.chartFrame}>
          {chartRecords.map((record) => {
            const height = Math.max(14, Math.round(((record?.steps ?? 0) / maxSteps) * 180));
            const reachedGoal = (record?.steps ?? 0) >= goal;

            return (
              <View key={record.date} style={styles.chartColumn}>
                <View style={styles.chartBarWrap}>
                  <View style={[styles.chartBar, reachedGoal && styles.chartBarGoal, { height }]} />
                </View>
                <Text style={styles.chartValue}>{Math.round((record.steps / goal) * 100)}%</Text>
                <Text style={styles.chartDate}>{record.date.slice(5).replace("-", ".")}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard title="이번 주 성장" value={`${weeklyGoalDays}일`} detail={`${currentWeekKey} 주차 기준`} />
        <SummaryCard title="이번 주 유지" value={`${weeklyKeepDays}일`} detail={`하락 ${weeklyDropDays}일`} />
        <SummaryCard title="휴식권" value={growth.weeklyRestUsed ? "사용함" : "남아있음"} detail={`${weeklyRestCount}회 사용`} />
        <SummaryCard title="연속 달성" value={`${growth.streak}일`} detail="완료된 날짜 기준" />
        <SummaryCard title="최고 레벨" value={`Lv.${growth.highestLevelReached}`} detail={`현재 Lv.${growth.currentLevel}`} />
        <SummaryCard title="성장 포인트" value={`${growth.growthPoints}/${growth.pointsRequired}`} detail="다음 레벨 게이지" />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>최근 일일 판정</Text>
        <View style={styles.resultList}>
          {resultRows.length ? (
            resultRows.map((result) => (
              <View key={result.date} style={styles.resultRow}>
                <View style={styles.resultDateWrap}>
                  <Text style={styles.resultDate}>{formatDisplayDate(result.date)}</Text>
                  <Text style={styles.resultMeta}>목표 {result.percent}%</Text>
                </View>
                <Text style={styles.resultLabel}>{result.label}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>완료된 날짜가 생기면 이곳에 판정 기록이 쌓여요.</Text>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>최근 레벨업</Text>
        <View style={styles.resultList}>
          {recentLevelUps.length ? (
            recentLevelUps.map((event) => (
              <View key={event.id} style={styles.resultRow}>
                <View style={styles.resultDateWrap}>
                  <Text style={styles.resultDate}>{event.date ? formatDisplayDate(event.date) : "기록 없음"}</Text>
                  <Text style={styles.resultMeta}>성장 로그</Text>
                </View>
                <Text style={styles.resultLabel}>Lv.{event.level} 달성</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>아직 레벨업 기록이 없어요.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function SummaryCard({ title, value, detail }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryDetail}>{detail}</Text>
    </View>
  );
}

function buildResultLabel(result) {
  if (result.finalResult === "GROW") {
    return "성장 +1";
  }

  if (result.finalResult === "KEEP") {
    return "유지";
  }

  if (result.finalResult === "REST") {
    return "휴식권 사용";
  }

  if (result.finalResult === "DROP") {
    return "성장 -1";
  }

  return "판정 제외";
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
    paddingBottom: 112,
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
  sectionCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
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
  chartFrame: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 240,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  chartBarWrap: {
    width: "100%",
    height: 190,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  chartBar: {
    width: "82%",
    borderRadius: theme.radius.md,
    backgroundColor: "#d8d5cd",
  },
  chartBarGoal: {
    backgroundColor: "#8fbe70",
  },
  chartValue: {
    color: theme.colors.ink,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  chartDate: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  summaryTitle: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  summaryValue: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  summaryDetail: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  resultList: {
    gap: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
  },
  resultDateWrap: {
    flex: 1,
    gap: 3,
  },
  resultDate: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  resultMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  resultLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  emptyText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
