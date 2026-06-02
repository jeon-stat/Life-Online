import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { getStreak } from "../game/progression.js";
import { buildFriendRankingData, getFriendSortLabel, sortFriendCards } from "../data/mockFriendData.js";
import { theme } from "../constants/theme.js";

const RANK_TABS = [
  { id: "daily", label: "일간" },
  { id: "weekly", label: "주간" },
  { id: "streak", label: "연속" },
];

const ENERGY_META = {
  0: { label: "완전 휴식", tone: "#8a94a2" },
  1: { label: "졸린 하루", tone: "#8aa0c5" },
  2: { label: "숨 고르기", tone: "#5f9ea0" },
  3: { label: "평온", tone: "#7aa37e" },
  4: { label: "산책", tone: "#e2a24a" },
  5: { label: "달리기", tone: "#db7c52" },
  6: { label: "최고 컨디션", tone: "#c95f4f" },
};

const LONG_TERM_META = {
  WEAK: { label: "허약", tone: "#b06d57" },
  HEALTHY: { label: "건강", tone: "#4f7a57" },
  ACTIVE: { label: "활발", tone: "#c06b3e" },
};

const RANK_BADGE_COLORS = {
  1: { backgroundColor: "#f6d86a", color: "#8d5b00", borderColor: "#e7b93c" },
  2: { backgroundColor: "#e7edf3", color: "#66707a", borderColor: "#c7d0da" },
  3: { backgroundColor: "#e8c29e", color: "#8a4f1f", borderColor: "#d59d6f" },
};

export function FriendsScreen() {
  const { currentUser } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const { width } = useWindowDimensions();
  const [rankMode, setRankMode] = useState("daily");
  const characterViewState = useMemo(() => buildCharacterViewModel({ todayRecord: today, history, goal, admin }), [admin, goal, history, today]);

  const cardWidth = useMemo(() => {
    const horizontalPadding = theme.spacing.md * 2;
    const usableWidth = Math.max(0, width - horizontalPadding);
    const gapSpace = 20;
    const baseWidth = Math.floor((usableWidth - gapSpace) / 3);
    return Math.max(104, Math.min(210, baseWidth));
  }, [width]);
  const previewSize = useMemo(() => Math.max(58, Math.min(118, Math.round(cardWidth * 0.58))), [cardWidth]);

  const weeklySteps = useMemo(() => history.slice(0, 7).reduce((sum, record) => sum + (record?.steps ?? 0), 0), [history]);
  const friends = useMemo(
    () =>
      buildFriendRankingData({
        currentUser,
        todayRecord: today,
        weeklySteps,
        streak: getStreak(history, goal),
        energyLevel: characterViewState.energyLevel,
        longTermState: characterViewState.longTermState,
        skinTone: admin?.skinTones?.find((tone) => tone.id === admin?.skinToneId)?.color ?? null,
      }),
    [admin?.skinToneId, admin?.skinTones, characterViewState.energyLevel, characterViewState.longTermState, currentUser, goal, history, today, weeklySteps],
  );

  const rankedFriends = useMemo(() => sortFriendCards(friends, rankMode), [friends, rankMode]);
  const myDailyRank = useMemo(() => sortFriendCards(friends, "daily").findIndex((friend) => friend.isMe) + 1, [friends]);
  const topToday = useMemo(() => sortFriendCards(friends, "daily")[0] ?? null, [friends]);
  const topStreak = useMemo(() => sortFriendCards(friends, "streak")[0] ?? null, [friends]);
  const rankingLabel = getFriendSortLabel(rankMode);
  const rankingDetails = getRankingDetails(rankMode);
  const friendCount = Math.max(0, friends.filter((friend) => !friend.isMe).length);

  if (!rankedFriends.length) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EmptyState />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>친구</Text>
        <Text style={styles.heroTitle}>친구들의 캐릭터를 카드로 구경해요</Text>
        <Text style={styles.heroText}>
          오늘, 이번 주, 연속 산책 기준으로 친구들의 발자국을 수집형 카드처럼 비교할 수 있어요.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard label="내 오늘 순위" value={myDailyRank > 0 ? `${myDailyRank}위` : "기록 없음"} />
        <SummaryCard label="친구 수" value={`${friendCount}명`} />
        <SummaryCard label="오늘 가장 많이 걸은 친구" value={formatTopFriend(topToday)} />
        <SummaryCard label="이번 주 가장 꾸준한 친구" value={formatTopFriend(topStreak)} />
      </View>

      <View style={styles.tabCard}>
        <View style={styles.rankTabRow}>
          {RANK_TABS.map((tab) => {
            const active = tab.id === rankMode;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setRankMode(tab.id)}
                style={[styles.rankTab, active && styles.rankTabActive]}
              >
                <Text style={[styles.rankTabLabel, active && styles.rankTabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{rankingLabel}</Text>
        <Text style={styles.listSubtitle}>{rankingDetails.subtitle}</Text>
      </View>

      <View style={styles.gridWrap}>
        {rankedFriends.map((friend, index) => (
          <FriendRankCard
            key={friend.id}
            friend={friend}
            rank={index + 1}
            isMe={Boolean(friend.isMe)}
            rankMode={rankMode}
            cardWidth={cardWidth}
            previewSize={previewSize}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SummaryCard({ label, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function FriendRankCard({ friend, rank, isMe, rankMode, cardWidth, previewSize }) {
  const rankBadge = getRankBadgeStyle(rank);
  const energyMeta = ENERGY_META[friend.energyLevel] ?? ENERGY_META[3];
  const longTermMeta = LONG_TERM_META[friend.longTermState] ?? LONG_TERM_META.HEALTHY;
  const info = getModeInfo(friend, rankMode);

  return (
    <View style={[styles.friendCard, isMe && styles.friendCardMe, { width: cardWidth, maxWidth: 210 }]}>
      <View style={styles.friendHeader}>
        <View style={styles.rankNameRow}>
          <View style={[styles.rankBadge, rankBadge.badgeStyle]}>
            <Text style={[styles.rankBadgeLabel, { color: rankBadge.textColor }]}>{rank}</Text>
          </View>
          <Text style={styles.friendName} numberOfLines={1}>
            {friend.nickname}
          </Text>
        </View>
        {isMe ? <Text style={styles.meBadge}>나</Text> : null}
      </View>

      <View style={styles.previewWrap}>
        <FriendPreview friend={friend} size={previewSize} />
      </View>

      <View style={styles.focusBlock}>
        <Text style={styles.focusLabel}>{info.primaryLabel}</Text>
        <Text style={styles.focusValue} numberOfLines={1}>
          {info.primaryValue}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <DetailPill label={info.secondaryLeftLabel} value={info.secondaryLeftValue} />
        <DetailPill label={info.secondaryRightLabel} value={info.secondaryRightValue} />
      </View>

      <View style={styles.bottomMetaRow}>
        <MiniMeta tone={energyMeta.tone} label={`E${friend.energyLevel} ${energyMeta.label}`} />
        <MiniMeta tone={longTermMeta.tone} label={longTermMeta.label} />
      </View>
    </View>
  );
}

function FriendPreview({ friend, size }) {
  const shellColor = softenColor(friend.skinTone ?? "#f4cbbb");

  return (
    <View style={[styles.previewShell, { width: size, height: Math.round(size * 1.08), backgroundColor: shellColor }]}>
      <View style={[styles.previewHead, { backgroundColor: friend.skinTone ?? "#f4cbbb" }]} />
      <View style={[styles.previewBody, { backgroundColor: friend.skinTone ?? "#f4cbbb" }]} />
      <View style={styles.previewShadow} />
      <Text style={styles.previewText}>미니 프리뷰</Text>
      <View style={styles.previewTag}>
        <Text style={styles.previewTagText}>{friend.avatarCharacterId?.includes("custom") ? "내 캐릭터" : "프리뷰"}</Text>
      </View>
    </View>
  );
}

function DetailPill({ label, value }) {
  return (
    <View style={styles.detailPill}>
      <Text style={styles.detailPillLabel}>{label}</Text>
      <Text style={styles.detailPillValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MiniMeta({ label, tone }) {
  return (
    <View style={[styles.miniMeta, { backgroundColor: `${tone}18`, borderColor: `${tone}35` }]}>
      <Text style={[styles.miniMetaText, { color: tone }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>아직 함께 걷는 친구가 없어요.</Text>
      <Text style={styles.emptyText}>친구를 추가하면 서로의 캐릭터 상태를 볼 수 있어요.</Text>
    </View>
  );
}

function getModeInfo(friend, rankMode) {
  switch (rankMode) {
    case "weekly":
      return {
        primaryLabel: "이번 주",
        primaryValue: `${formatNumber(friend.weeklySteps)}보`,
        secondaryLeftLabel: "평균",
        secondaryLeftValue: `${formatNumber(Math.round((friend.weeklySteps ?? 0) / 7))}보`,
        secondaryRightLabel: "오늘",
        secondaryRightValue: `${formatNumber(friend.todaySteps)}보`,
      };
    case "streak":
      return {
        primaryLabel: "연속",
        primaryValue: `${friend.streak}일`,
        secondaryLeftLabel: "장기 상태",
        secondaryLeftValue: getLongTermLabel(friend.longTermState),
        secondaryRightLabel: "에너지",
        secondaryRightValue: `E${friend.energyLevel}`,
      };
    default:
      return {
        primaryLabel: "오늘",
        primaryValue: `${formatNumber(friend.todaySteps)}보`,
        secondaryLeftLabel: "에너지",
        secondaryLeftValue: `E${friend.energyLevel} ${getEnergyLabel(friend.energyLevel)}`,
        secondaryRightLabel: "이번 주",
        secondaryRightValue: `${formatNumber(friend.weeklySteps)}보`,
      };
  }
}

function getEnergyLabel(level) {
  return ENERGY_META[level]?.label ?? "평온";
}

function getLongTermLabel(state) {
  return LONG_TERM_META[state]?.label ?? "건강";
}

function getRankingDetails(rankMode) {
  switch (rankMode) {
    case "weekly":
      return { subtitle: "이번 주 누적 걸음이 큰 친구부터 카드가 정렬돼요." };
    case "streak":
      return { subtitle: "연속 산책일이 긴 친구부터 카드가 정렬돼요." };
    default:
      return { subtitle: "오늘 걸음이 많은 친구부터 카드가 정렬돼요." };
  }
}

function getRankBadgeStyle(rank) {
  if (rank <= 3) {
    const meta = RANK_BADGE_COLORS[rank];
    return {
      badgeStyle: {
        backgroundColor: meta.backgroundColor,
        borderColor: meta.borderColor,
      },
      textColor: meta.color,
    };
  }

  return {
    badgeStyle: {
      backgroundColor: "#f2f4f7",
      borderColor: "#d6dee8",
    },
    textColor: theme.colors.ink,
  };
}

function softenColor(color) {
  return `${color}22`;
}

function formatTopFriend(friend) {
  if (!friend) {
    return "기록 없음";
  }

  return `${friend.nickname} · ${formatNumber(friend.todaySteps)}보`;
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
    backgroundColor: "#eef8f6",
    borderWidth: 1,
    borderColor: "#cde7e0",
  },
  kicker: {
    color: "#2c7a75",
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
  summaryCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  summaryValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  tabCard: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankTabRow: {
    flexDirection: "row",
    gap: 8,
  },
  rankTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankTabActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  rankTabLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  rankTabLabelActive: {
    color: "#ffffff",
  },
  listHeader: {
    gap: 4,
  },
  listTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  listSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  friendCard: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
    aspectRatio: 0.68,
    overflow: "hidden",
  },
  friendCardMe: {
    backgroundColor: "#fff7ef",
    borderColor: "#d99d78",
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  friendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rankNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  rankBadgeLabel: {
    fontSize: 11,
    fontWeight: "900",
  },
  friendName: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  meBadge: {
    color: "#9f4e33",
    fontSize: 10,
    fontWeight: "900",
  },
  previewWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewShell: {
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  previewHead: {
    position: "absolute",
    top: "18%",
    width: "42%",
    aspectRatio: 1,
    borderRadius: 999,
    opacity: 0.95,
  },
  previewBody: {
    position: "absolute",
    bottom: "18%",
    width: "58%",
    height: "42%",
    borderRadius: 999,
    opacity: 0.95,
  },
  previewShadow: {
    position: "absolute",
    bottom: "10%",
    width: "72%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
  previewText: {
    position: "absolute",
    bottom: 12,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.22)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  previewTag: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  previewTagText: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    fontWeight: "900",
  },
  focusBlock: {
    gap: 2,
  },
  focusLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  focusValue: {
    color: theme.colors.ink,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  detailRow: {
    flexDirection: "row",
    gap: 6,
  },
  detailPill: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 0,
  },
  detailPillLabel: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    fontWeight: "800",
  },
  detailPillValue: {
    marginTop: 3,
    color: theme.colors.ink,
    fontSize: 10,
    fontWeight: "900",
  },
  bottomMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  miniMeta: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    maxWidth: "100%",
  },
  miniMetaText: {
    fontSize: 9,
    fontWeight: "900",
  },
  emptyCard: {
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 8,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
});
