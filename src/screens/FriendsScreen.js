import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { theme } from "../constants/theme.js";
import { buildFriendRankingData, getFriendSortLabel, sortFriendCards } from "../data/mockFriendData.js";

const RANK_TABS = [
  { id: "daily", label: "일간 순위" },
  { id: "weekly", label: "주간 누적" },
  { id: "streak", label: "연속 달성" },
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

export function FriendsScreen() {
  const { currentUser } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const [rankMode, setRankMode] = useState("daily");
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });
  const weeklySteps = useMemo(() => history.slice(0, 7).reduce((sum, record) => sum + (record?.steps ?? 0), 0), [history]);
  const friends = useMemo(
    () =>
      buildFriendRankingData({
        currentUser,
        todayRecord: today,
        weeklySteps,
        streak: viewState.growth.streak,
        energyLevel: viewState.energyLevel,
        longTermState: viewState.longTermState,
        skinTone: admin?.skinTones?.find((tone) => tone.id === admin?.skinToneId)?.color ?? null,
      }),
    [admin?.skinToneId, admin?.skinTones, currentUser, today, viewState.energyLevel, viewState.growth.streak, viewState.longTermState, weeklySteps],
  );
  const rankedFriends = useMemo(() => sortFriendCards(friends, rankMode), [friends, rankMode]);
  const myDailyRank = useMemo(() => rankedFriends.findIndex((friend) => friend.isMe) + 1, [rankedFriends]);
  const topToday = rankedFriends[0] ?? null;
  const topStreak = useMemo(() => sortFriendCards(friends, "streak")[0] ?? null, [friends]);

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
        <Text style={styles.heroTitle}>친구들의 발자국을 가볍게 비교해요</Text>
        <Text style={styles.heroText}>
          오늘, 이번 주, 연속 산책을 기준으로 친구들의 캐릭터 상태를 한눈에 볼 수 있어요.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard label="내 오늘 순위" value={myDailyRank > 0 ? `${myDailyRank}위` : "기록 없음"} />
        <SummaryCard label="친구 수" value={`${Math.max(0, friends.filter((friend) => !friend.isMe).length)}명`} />
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
        <Text style={styles.listTitle}>{getFriendSortLabel(rankMode)}</Text>
        <Text style={styles.listSubtitle}>친구 카드에서 오늘 걸음과 누적 흐름을 비교할 수 있어요.</Text>
      </View>

      <View style={styles.cardList}>
        {rankedFriends.map((friend, index) => (
          <FriendRankCard
            key={friend.id}
            friend={friend}
            rank={index + 1}
            isMe={Boolean(friend.isMe)}
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

function FriendRankCard({ friend, rank, isMe }) {
  const energyMeta = ENERGY_META[friend.energyLevel] ?? ENERGY_META[3];
  const longTermMeta = LONG_TERM_META[friend.longTermState] ?? LONG_TERM_META.HEALTHY;

  return (
    <View style={[styles.friendCard, isMe && styles.friendCardMe]}>
      <View style={styles.friendHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankBadgeLabel}>{`${rank}위`}</Text>
        </View>
        {isMe ? <Text style={styles.meBadge}>내 카드</Text> : null}
      </View>

      <View style={styles.friendTopRow}>
        <FriendAvatar friend={friend} />
        <View style={styles.friendCopy}>
          <Text style={styles.friendName}>{friend.nickname}</Text>
          <Text style={styles.friendHandle}>{`@${friend.handle}`}</Text>
          <Text style={[styles.friendState, { color: longTermMeta.tone }]}>{`상태: ${longTermMeta.label}`}</Text>
        </View>
      </View>

      <View style={styles.friendMetrics}>
        <MetricLine label="오늘" value={`${formatNumber(friend.todaySteps)}보`} />
        <MetricLine label="이번 주" value={`${formatNumber(friend.weeklySteps)}보`} />
        <MetricLine label="연속" value={`${friend.streak}일`} />
      </View>

      <View style={styles.friendFooter}>
        <Pill label={`E${friend.energyLevel} · ${energyMeta.label}`} tone={energyMeta.tone} />
        <Pill label={`장기 ${longTermMeta.label}`} tone={longTermMeta.tone} />
      </View>
    </View>
  );
}

function FriendAvatar({ friend }) {
  const initials = buildInitials(friend.nickname, friend.handle);

  return (
    <View style={[styles.avatar, { backgroundColor: friend.skinTone ?? "#f4cbbb" }]}>
      <Text style={styles.avatarInitials}>{initials}</Text>
      <View style={styles.avatarChip}>
        <Text style={styles.avatarChipText}>{friend.avatarCharacterId?.includes("custom") ? "나" : "프리뷰"}</Text>
      </View>
    </View>
  );
}

function MetricLine({ label, value }) {
  return (
    <View style={styles.metricLine}>
      <Text style={styles.metricLineLabel}>{label}</Text>
      <Text style={styles.metricLineValue}>{value}</Text>
    </View>
  );
}

function Pill({ label, tone }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${tone}18`, borderColor: `${tone}35` }]}>
      <Text style={[styles.pillText, { color: tone }]}>{label}</Text>
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

function buildInitials(nickname, handle) {
  const base = String(nickname ?? handle ?? "F").trim();
  const chars = base.replace(/\s+/g, "").slice(0, 2).toUpperCase();
  return chars || "F";
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
  cardList: {
    gap: 10,
  },
  friendCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  friendCardMe: {
    backgroundColor: "#fff7ef",
    borderColor: "#d99d78",
  },
  friendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankBadge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f2f4f7",
  },
  rankBadgeLabel: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  meBadge: {
    color: "#9f4e33",
    fontSize: 11,
    fontWeight: "900",
  },
  friendTopRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  avatarInitials: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  avatarChip: {
    position: "absolute",
    bottom: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarChipText: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "900",
  },
  friendCopy: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  friendHandle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  friendState: {
    fontSize: 12,
    fontWeight: "900",
  },
  friendMetrics: {
    gap: 6,
  },
  metricLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricLineLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  metricLineValue: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  friendFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 11,
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
