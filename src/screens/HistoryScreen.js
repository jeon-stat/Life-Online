import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { formatDisplayDate } from "../game/dateUtils.js";

export function HistoryScreen() {
  const { history, goal, growth, missionRewards } = useStepData();
  const chartRecords = history.slice(0, 14).reverse();
  const maxSteps = Math.max(goal, ...chartRecords.map((record) => record?.steps ?? 0), 1);
  const weeklySummary = growth.weeklySummary ?? {};
  const recentLevelUps = (growth.levelUpEvents ?? []).slice(0, 5);
  const streak = growth.streak ?? 0;
  const personalOverview = useMemo(() => buildPersonalOverview(history), [history]);
  const missionModel = useMemo(() => buildMissionModel({ history, goal, streak }), [goal, history, streak]);
  const resultRows = useMemo(
    () =>
      (growth.recentDailyResults ?? []).map((result) => ({
        ...result,
        percent: Math.round((result.ratio ?? 0) * 100),
        label: buildResultLabel(result),
      })),
    [growth.recentDailyResults],
  );
  const claimMissionReward = missionRewards?.claim ?? null;
  const isMissionRewardClaimed = missionRewards?.isClaimed ?? (() => false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>기록</Text>
      </View>

      <View style={styles.summaryPanel}>
        <SummaryCard title="총 걸음" value={`${formatNumber(personalOverview.totalSteps)}보`} detail="누적 기록" />
        <SummaryCard title="최고 걸음" value={`${formatNumber(personalOverview.bestSteps)}보`} detail="하루 최고치" />
        <SummaryCard title="연속 달성" value={`${streak}일`} detail="완료된 날짜 기준" />
        <SummaryCard
          title="최고 레벨"
          value={`Lv.${growth.highestLevelReached ?? 1}`}
          detail={`현재 Lv.${growth.currentLevel ?? 1}`}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>최근 걸음 그래프</Text>
        <View style={styles.chartFrame}>
          {chartRecords.map((record) => {
            const height = Math.max(14, Math.round(((record?.steps ?? 0) / maxSteps) * 180));
            const reachedGoal = (record?.steps ?? 0) >= goal;
            const ratio = goal > 0 ? Math.round(((record?.steps ?? 0) / goal) * 100) : 0;

            return (
              <View key={record.date} style={styles.chartColumn}>
                <View style={styles.chartBarWrap}>
                  <View style={[styles.chartBar, reachedGoal && styles.chartBarGoal, { height }]} />
                </View>
                <Text style={styles.chartValue}>{ratio}%</Text>
                <Text style={styles.chartDate}>{record.date.slice(5).replace("-", ".")}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>보상 퀘스트</Text>
          <Text style={styles.sectionMeta}>
            {missionModel.completedCount}/{missionModel.totalCount} 완료
          </Text>
        </View>

        <View style={styles.missionSectionList}>
          {missionModel.sections.map((section) => (
            <View key={section.key} style={styles.missionSection}>
              <View style={styles.missionSectionHeader}>
                <Text style={styles.missionSectionTitle}>{section.title}</Text>
                <Text style={styles.missionSectionCount}>{section.items.length}개</Text>
              </View>

              <View style={styles.missionList}>
                {section.items.map((card) => {
                  const claimed = isMissionRewardClaimed(card.key);
                  const canClaim = card.completed && !claimed && Boolean(claimMissionReward);

                  return (
                    <View key={card.key} style={styles.missionCard}>
                      <View style={styles.missionCardTopRow}>
                        <View style={styles.missionPillRow}>
                          <Text style={[styles.missionTypePill, card.typeStyle]}>{card.typeLabel}</Text>
                          <Text style={[styles.missionStatePill, card.completed && styles.missionStatePillComplete]}>
                            {card.statusLabel}
                          </Text>
                        </View>

                        <View style={styles.missionRewardRow}>
                          <Text style={styles.missionRewardText}>{card.rewardLabel}</Text>
                          <Pressable
                            onPress={() => {
                              if (!canClaim) {
                                return;
                              }

                              claimMissionReward({ missionId: card.key, coins: card.rewardCoins });
                            }}
                            disabled={!canClaim}
                            style={({ pressed }) => [
                              styles.missionClaimButton,
                              canClaim && styles.missionClaimButtonActive,
                              pressed && canClaim && styles.missionClaimButtonPressed,
                              !canClaim && styles.missionClaimButtonDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.missionClaimButtonLabel,
                                canClaim && styles.missionClaimButtonLabelActive,
                                !canClaim && styles.missionClaimButtonLabelDisabled,
                              ]}
                            >
                              {claimed ? "받음" : card.completed ? "받기" : "진행중"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      <Text style={styles.missionTitle}>{card.title}</Text>
                      <Text style={styles.missionProgressText}>{card.progressText}</Text>

                      <View style={styles.missionProgressTrack}>
                        <View
                          style={[
                            styles.missionProgressFill,
                            { width: `${Math.max(0, Math.min(100, card.progress * 100))}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.summaryPanel}>
        <SummaryCard title="이번 주 성장" value={`${weeklySummary.growCount ?? 0}일`} detail="GROW 판정" />
        <SummaryCard title="이번 주 유지" value={`${weeklySummary.keepCount ?? 0}일`} detail="KEEP 판정" />
        <SummaryCard
          title="휴식권"
          value={growth.weeklyRestUsed ? "이미 사용" : "사용 가능"}
          detail={`${weeklySummary.restCount ?? 0}회 사용`}
        />
        <SummaryCard
          title="성장 포인트"
          value={`${growth.growthPoints ?? 0}/${growth.pointsRequired ?? 2}`}
          detail="다음 레벨 게이지"
        />
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
            <Text style={styles.emptyText}>완료된 날짜가 쌓이면 여기에 판정 기록이 표시됩니다.</Text>
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
            <Text style={styles.emptyText}>아직 레벨업 기록이 없습니다.</Text>
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

function buildPersonalOverview(history) {
  const totalSteps = history.reduce((sum, record) => sum + (record?.steps ?? 0), 0);
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);

  return {
    totalSteps,
    bestSteps: bestRecord?.steps ?? 0,
  };
}

function buildMissionModel({ history, goal, streak }) {
  const latest = history[0] ?? null;
  const latestSteps = Number(latest?.steps ?? 0);
  const goalValue = Math.max(1, Number(goal ?? 1));
  const weeklyRecords = history.slice(0, 7);
  const monthlyRecords = history.slice(0, 30);
  const weeklySteps = weeklyRecords.reduce((sum, record) => sum + Number(record?.steps ?? 0), 0);
  const monthlySteps = monthlyRecords.reduce((sum, record) => sum + Number(record?.steps ?? 0), 0);
  const goalDays = weeklyRecords.reduce((count, record) => count + ((record?.steps ?? 0) >= goalValue ? 1 : 0), 0);
  const bestRecord = history.reduce((best, record) => {
    if (!best || (record?.steps ?? 0) > (best?.steps ?? 0)) {
      return record;
    }
    return best;
  }, null);
  const bestSteps = Number(bestRecord?.steps ?? 0);

  const sections = [
    {
      key: "daily",
      title: "일일 미션",
      items: [
        createMissionCard({
          key: "daily-3000",
          typeKey: "daily",
          typeLabel: "일일",
          title: "오늘 3,000보 걷기",
          currentValue: latestSteps,
          targetValue: 3000,
          rewardCoins: 30,
          rewardLabel: "+30 코인",
          progressText: `${formatNumber(Math.min(latestSteps, 3000))} / 3,000보`,
        }),
        createMissionCard({
          key: "daily-goal",
          typeKey: "daily",
          typeLabel: "일일",
          title: "오늘 목표 달성하기",
          currentValue: latestSteps,
          targetValue: goalValue,
          rewardCoins: 50,
          rewardLabel: "+50 코인",
          progressText: `${formatNumber(Math.min(latestSteps, goalValue))} / ${formatNumber(goalValue)}보`,
        }),
        createMissionCard({
          key: "daily-8000",
          typeKey: "daily",
          typeLabel: "일일",
          title: "오늘 8,000보 걷기",
          currentValue: latestSteps,
          targetValue: 8000,
          rewardCoins: 70,
          rewardLabel: "+70 코인",
          progressText: `${formatNumber(Math.min(latestSteps, 8000))} / 8,000보`,
        }),
      ],
    },
    {
      key: "weekly",
      title: "주간 미션",
      items: [
        createMissionCard({
          key: "weekly-3days",
          typeKey: "weekly",
          typeLabel: "주간",
          title: "이번 주 3일 목표 달성",
          currentValue: goalDays,
          targetValue: 3,
          rewardCoins: 100,
          rewardLabel: "+100 코인",
          progressText: `${Math.min(goalDays, 3)} / 3일`,
        }),
        createMissionCard({
          key: "weekly-steps",
          typeKey: "weekly",
          typeLabel: "주간",
          title: "최근 7일 누적 40,000보",
          currentValue: weeklySteps,
          targetValue: 40000,
          rewardCoins: 150,
          rewardLabel: "+150 코인",
          progressText: `${formatNumber(Math.min(weeklySteps, 40000))} / 40,000보`,
        }),
        createMissionCard({
          key: "weekly-streak",
          typeKey: "weekly",
          typeLabel: "주간",
          title: "3일 연속 걷기",
          currentValue: streak,
          targetValue: 3,
          rewardCoins: 80,
          rewardLabel: "+80 코인",
          progressText: `${Math.min(streak, 3)} / 3일`,
        }),
      ],
    },
    {
      key: "special",
      title: "장기 미션",
      items: [
        createMissionCard({
          key: "special-best",
          typeKey: "special",
          typeLabel: "장기",
          title: "최고 기록 10,000보 달성",
          currentValue: bestSteps,
          targetValue: 10000,
          rewardCoins: 200,
          rewardLabel: "+200 코인",
          progressText: `${formatNumber(Math.min(bestSteps, 10000))} / 10,000보`,
        }),
        createMissionCard({
          key: "special-month",
          typeKey: "special",
          typeLabel: "장기",
          title: "최근 30일 누적 150,000보",
          currentValue: monthlySteps,
          targetValue: 150000,
          rewardCoins: 300,
          rewardLabel: "+300 코인",
          progressText: `${formatNumber(Math.min(monthlySteps, 150000))} / 150,000보`,
        }),
      ],
    },
  ];

  const allItems = sections.flatMap((section) => section.items);
  return {
    sections,
    totalCount: allItems.length,
    completedCount: allItems.filter((item) => item.completed).length,
  };
}

function createMissionCard({
  key,
  typeKey,
  typeLabel,
  title,
  currentValue,
  targetValue,
  rewardCoins,
  rewardLabel,
  progressText,
}) {
  const safeTarget = Math.max(1, Number(targetValue ?? 1));
  const safeCurrent = Math.max(0, Number(currentValue ?? 0));
  const progress = Math.min(1, safeCurrent / safeTarget);
  const completed = progress >= 1;

  return {
    key,
    typeKey,
    typeStyle: getMissionTypeStyle(typeKey),
    typeLabel,
    title,
    rewardCoins: Math.max(0, Math.floor(Number(rewardCoins ?? 0))),
    rewardLabel,
    progress,
    progressText: progressText ?? `${formatNumber(Math.min(safeCurrent, safeTarget))} / ${formatNumber(safeTarget)}`,
    statusLabel: completed ? "완료" : "진행중",
    completed,
  };
}

function getMissionTypeStyle(typeKey) {
  switch (typeKey) {
    case "weekly":
      return styles.missionTypePillWeekly;
    case "special":
      return styles.missionTypePillSpecial;
    default:
      return styles.missionTypePillDaily;
  }
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  sectionMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
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
  summaryPanel: {
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
  missionSectionList: {
    gap: 14,
  },
  missionSection: {
    gap: 10,
  },
  missionSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  missionSectionTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  missionSectionCount: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  missionList: {
    gap: 10,
  },
  missionCard: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  missionCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  missionPillRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  missionTypePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    color: "#ffffff",
    backgroundColor: "#111111",
  },
  missionTypePillDaily: {
    backgroundColor: "#2f6bff",
  },
  missionTypePillWeekly: {
    backgroundColor: "#12a76b",
  },
  missionTypePillSpecial: {
    backgroundColor: "#ba6b00",
  },
  missionStatePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
    color: theme.colors.inkSoft,
    backgroundColor: "#f1f2f5",
  },
  missionStatePillComplete: {
    color: "#155724",
    backgroundColor: "#dff3e7",
  },
  missionRewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  missionRewardText: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  missionClaimButton: {
    minWidth: 60,
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#ffffff",
  },
  missionClaimButtonActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  missionClaimButtonPressed: {
    opacity: 0.84,
  },
  missionClaimButtonDisabled: {
    backgroundColor: "#f1f2f5",
  },
  missionClaimButtonLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  missionClaimButtonLabelActive: {
    color: "#ffffff",
  },
  missionClaimButtonLabelDisabled: {
    color: "#8d8d8d",
  },
  missionTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  missionProgressText: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  missionProgressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#eceff3",
  },
  missionProgressFill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: "#111111",
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
