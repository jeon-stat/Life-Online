import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import {
  FRIEND_GROUPS,
  buildFriendRankingData,
  createFriendGroupState,
  filterFriendsByGroup,
  getFriendGroupIds,
  getFriendGroupNames,
  sortFriendCards,
  toggleFriendGroupMembership,
} from "../data/mockFriendData.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { getStreak } from "../game/progression.js";
import { theme } from "../constants/theme.js";

const VIEW_TABS = [
  { id: "ranking", label: "랭킹" },
  { id: "list", label: "친구 목록" },
];

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
  const [viewMode, setViewMode] = useState("ranking");
  const [rankMode, setRankMode] = useState("daily");

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin }),
    [admin, goal, history, today],
  );

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

  const [friendGroupState, setFriendGroupState] = useState(() => createFriendGroupState(friends));
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [selectedFriendId, setSelectedFriendId] = useState(friends[0]?.id ?? null);

  const mergedFriends = useMemo(
    () =>
      friends.map((friend) => ({
        ...friend,
        groupIds: getFriendGroupIds(friend, friendGroupState),
      })),
    [friendGroupState, friends],
  );

  const selectedGroup = useMemo(
    () => FRIEND_GROUPS.find((group) => group.id === selectedGroupId) ?? FRIEND_GROUPS[0],
    [selectedGroupId],
  );

  const selectedGroupFriends = useMemo(
    () => filterFriendsByGroup(mergedFriends, selectedGroupId),
    [mergedFriends, selectedGroupId],
  );

  const rankedFriends = useMemo(() => sortFriendCards(selectedGroupFriends, rankMode), [rankMode, selectedGroupFriends]);
  const listFriends = useMemo(
    () =>
      [...mergedFriends].sort((a, b) =>
        String(a.nickname ?? "").localeCompare(String(b.nickname ?? ""), "ko-KR"),
      ),
    [mergedFriends],
  );

  const selectedFriend = useMemo(
    () => listFriends.find((friend) => friend.id === selectedFriendId) ?? listFriends[0] ?? null,
    [listFriends, selectedFriendId],
  );

  const cardWidth = useMemo(() => {
    const horizontalPadding = theme.spacing.md * 2;
    const usableWidth = Math.max(0, width - horizontalPadding);
    const gapSpace = 20;
    const baseWidth = Math.floor((usableWidth - gapSpace) / 3);
    return Math.max(104, Math.min(210, baseWidth));
  }, [width]);

  const previewSize = useMemo(() => Math.max(62, Math.min(126, Math.round(cardWidth * 0.68))), [cardWidth]);

  const onToggleFriendGroup = (friendId, groupId) => {
    setFriendGroupState((current) => toggleFriendGroupMembership(current, friendId, groupId));
  };

  if (viewMode === "ranking" && rankedFriends.length === 0) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>친구</Text>
          <Text style={styles.heroTitle}>그룹 안에 아직 친구가 없어요</Text>
          <Text style={styles.heroText}>친구 목록에서 이 그룹에 친구를 추가해보세요.</Text>
        </View>
        <EmptyState />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>친구</Text>
        <Text style={styles.heroTitle}>친구 그룹 안에서 캐릭터를 비교해요</Text>
        <Text style={styles.heroText}>
          친구를 폴더처럼 묶어두고, 선택한 그룹 안에서만 일간·주간·연속 순위를 볼 수 있어요.
        </Text>
      </View>

      <View style={styles.tabCard}>
        <View style={styles.modeTabRow}>
          {VIEW_TABS.map((tab) => {
            const active = tab.id === viewMode;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setViewMode(tab.id)}
                style={[styles.modeTab, active && styles.modeTabActive]}
              >
                <Text style={[styles.modeTabLabel, active && styles.modeTabLabelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {viewMode === "ranking" ? (
        <>
          <View style={styles.groupCard}>
            <View style={styles.groupCardTop}>
              <View>
                <Text style={styles.groupCardLabel}>현재 그룹</Text>
                <Text style={styles.groupCardTitle}>{selectedGroup.name}</Text>
              </View>
              {selectedGroup.system ? <Text style={styles.systemBadge}>시스템</Text> : null}
            </View>
            <Text style={styles.groupCardMeta}>{selectedGroupFriends.length}명의 친구가 포함돼 있어요.</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupChipRow}>
            {FRIEND_GROUPS.map((group) => {
              const active = group.id === selectedGroupId;
              return (
                <Pressable
                  key={group.id}
                  onPress={() => setSelectedGroupId(group.id)}
                  style={[styles.groupChip, active && styles.groupChipActive]}
                >
                  <Text style={[styles.groupChipLabel, active && styles.groupChipLabelActive]}>{group.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.rankTabCard}>
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
            <Text style={styles.listTitle}>{getRankingTitle(rankMode, selectedGroup.name)}</Text>
            <Text style={styles.listSubtitle}>{getRankingDetails(rankMode, selectedGroup.name)}</Text>
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
        </>
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>친구 목록</Text>
            <Text style={styles.listSubtitle}>이름과 아이디를 빠르게 보고, 그룹만 간단히 관리할 수 있어요.</Text>
          </View>

          <View style={styles.friendList}>
            {listFriends.map((friend) => (
              <FriendListRow
                key={friend.id}
                friend={friend}
                isSelected={friend.id === selectedFriend?.id}
                onPress={() => setSelectedFriendId(friend.id)}
                onManagePress={() => setSelectedFriendId(friend.id)}
              />
            ))}
          </View>

          {selectedFriend ? (
            <View style={styles.groupManagerCard}>
              <Text style={styles.groupManagerTitle}>{selectedFriend.nickname}</Text>
              <Text style={styles.groupManagerHandle}>@{selectedFriend.handle}</Text>
              <Text style={styles.groupManagerLabel}>그룹 관리</Text>

              <View style={styles.groupChecklist}>
                {FRIEND_GROUPS.filter((group) => !group.system).map((group) => {
                  const groupIds = getFriendGroupIds(selectedFriend, friendGroupState);
                  const checked = groupIds.includes(group.id);
                  return (
                    <Pressable
                      key={group.id}
                      onPress={() => onToggleFriendGroup(selectedFriend.id, group.id)}
                      style={[styles.checkRow, checked && styles.checkRowChecked]}
                    >
                      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                        {checked ? <Text style={styles.checkboxMark}>✓</Text> : null}
                      </View>
                      <Text style={styles.checkLabel}>{group.name}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.groupSummaryLabel}>현재 포함 그룹</Text>
              <Text style={styles.groupSummaryValue}>{getFriendGroupNames(selectedFriend, friendGroupState)}</Text>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function FriendRankCard({ friend, rank, isMe, rankMode, cardWidth, previewSize }) {
  const rankBadge = getRankBadgeStyle(rank);
  const info = getModeInfo(friend, rankMode);

  return (
    <View style={[styles.friendCard, isMe && styles.friendCardMe, { width: cardWidth, maxWidth: 210 }]}>
      <View style={styles.friendCardContent}>
        <View style={styles.friendHeader}>
          <View style={styles.rankNameRow}>
            <View style={[styles.rankBadge, rankBadge.badgeStyle]}>
              <Text style={[styles.rankBadgeLabel, { color: rankBadge.textColor }]}>{rank}</Text>
            </View>
            <Text style={styles.friendName} numberOfLines={1}>
              {friend.nickname}
            </Text>
          </View>
          {isMe ? <Text style={styles.meLabel}>나</Text> : null}
        </View>

        <View style={styles.characterStage}>
          <FriendPreview friend={friend} size={previewSize} />
        </View>

        <View style={styles.primaryStatBlock}>
          <Text style={styles.primaryStatLabel}>{info.primaryLabel}</Text>
          <Text style={styles.primaryStatValue} numberOfLines={1}>
            {info.primaryValue}
          </Text>
        </View>

        <View style={styles.footerInfoRow}>
          <FooterStat label={info.secondaryLeftLabel} value={info.secondaryLeftValue} />
          <FooterStat label={info.secondaryRightLabel} value={info.secondaryRightValue} />
        </View>
      </View>
    </View>
  );
}

function FriendPreview({ friend, size }) {
  const skinTone = friend.skinTone ?? "#f4cbbb";

  return (
    <View style={[styles.previewFigure, { width: size, height: Math.round(size * 1.16) }]}>
      <View style={[styles.previewShadow, { backgroundColor: softenColor(skinTone) }]} />
      <View style={[styles.previewHead, { backgroundColor: skinTone }]} />
      <View style={[styles.previewBody, { backgroundColor: skinTone }]} />
    </View>
  );
}

function FriendListRow({ friend, isSelected, onPress, onManagePress }) {
  return (
    <View style={[styles.friendListRow, isSelected && styles.friendListRowSelected]}>
      <Pressable onPress={onPress} style={styles.friendListMain}>
        <Text style={styles.friendListName} numberOfLines={1}>
          {friend.nickname}
        </Text>
        <Text style={styles.friendListHandle}>@{friend.handle}</Text>
      </Pressable>
      <Pressable onPress={onManagePress} style={styles.manageButton}>
        <Text style={styles.manageButtonLabel}>그룹 관리</Text>
      </Pressable>
    </View>
  );
}

function FooterStat({ label, value }) {
  return (
    <View style={styles.footerStat}>
      <Text style={styles.footerStatLabel}>{label}</Text>
      <Text style={styles.footerStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>이 그룹에는 아직 친구가 없어요.</Text>
      <Text style={styles.emptyText}>친구 목록에서 이 그룹에 친구를 추가해보세요.</Text>
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
        secondaryRightLabel: "최고",
        secondaryRightValue: `E${friend.energyLevel}`,
      };
    case "streak":
      return {
        primaryLabel: "연속",
        primaryValue: `${friend.streak}일`,
        secondaryLeftLabel: "이번 주",
        secondaryLeftValue: `${formatNumber(friend.weeklySteps)}보`,
        secondaryRightLabel: "장기",
        secondaryRightValue: getLongTermLabel(friend.longTermState),
      };
    default:
      return {
        primaryLabel: "오늘",
        primaryValue: `${formatNumber(friend.todaySteps)}보`,
        secondaryLeftLabel: "에너지",
        secondaryLeftValue: `E${friend.energyLevel}`,
        secondaryRightLabel: "장기",
        secondaryRightValue: getLongTermLabel(friend.longTermState),
      };
  }
}

function getRankingTitle(rankMode, groupName) {
  const prefix = groupName ? `${groupName} 안에서 보는 ` : "";
  switch (rankMode) {
    case "weekly":
      return `${prefix}주간 순위`;
    case "streak":
      return `${prefix}연속 순위`;
    default:
      return `${prefix}일간 순위`;
  }
}

function getRankingDetails(rankMode, groupName) {
  const subject = groupName ? `${groupName} 그룹 안의 친구들` : "선택된 그룹의 친구들";
  switch (rankMode) {
    case "weekly":
      return `${subject}의 이번 주 누적 걸음 수를 기준으로 비교해요.`;
    case "streak":
      return `${subject}의 연속 달성일을 기준으로 살펴봐요.`;
    default:
      return `${subject}의 오늘 걸음 수를 기준으로 비교해요.`;
  }
}

function getLongTermLabel(state) {
  return LONG_TERM_META[state]?.label ?? "건강";
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
    borderColor: "#d7ebe6",
  },
  kicker: {
    color: "#4c7b71",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroTitle: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "900",
  },
  heroText: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  tabCard: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTabRow: {
    flexDirection: "row",
    gap: 8,
  },
  modeTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeTabActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  modeTabLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  modeTabLabelActive: {
    color: "#ffffff",
  },
  groupCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  groupCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  groupCardLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groupCardTitle: {
    marginTop: 4,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  groupCardMeta: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  systemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: "#edf6f0",
    color: "#4f7a57",
    fontSize: 10,
    fontWeight: "900",
  },
  groupChipRow: {
    gap: 8,
    paddingRight: theme.spacing.md,
  },
  groupChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groupChipActive: {
    backgroundColor: "#16302b",
    borderColor: "#16302b",
  },
  groupChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  groupChipLabelActive: {
    color: "#ffffff",
  },
  rankTabCard: {
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
    position: "relative",
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: theme.colors.border,
    aspectRatio: 0.68,
    overflow: "hidden",
  },
  friendCardContent: {
    flex: 1,
    position: "relative",
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "flex-start",
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
  meLabel: {
    color: "#9f4e33",
    fontSize: 10,
    fontWeight: "900",
  },
  characterStage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 28,
    bottom: 72,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  previewFigure: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  previewShadow: {
    position: "absolute",
    bottom: "7%",
    width: "72%",
    height: "9%",
    borderRadius: 999,
    opacity: 0.55,
  },
  previewHead: {
    position: "absolute",
    top: "11%",
    width: "42%",
    aspectRatio: 1,
    borderRadius: 999,
    opacity: 0.98,
  },
  previewBody: {
    position: "absolute",
    bottom: "7%",
    width: "66%",
    height: "48%",
    borderRadius: 999,
    opacity: 0.98,
  },
  primaryStatBlock: {
    position: "absolute",
    left: 0,
    bottom: 52,
    zIndex: 2,
    maxWidth: "64%",
  },
  primaryStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  primaryStatValue: {
    color: theme.colors.ink,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  footerInfoRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  footerStat: {
    flex: 1,
    minWidth: 0,
  },
  footerStatLabel: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 2,
  },
  footerStatValue: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  friendList: {
    gap: 10,
  },
  friendListRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  friendListRowSelected: {
    borderColor: "#d99d78",
    backgroundColor: "#fff7ef",
  },
  friendListMain: {
    flex: 1,
    minWidth: 0,
  },
  friendListName: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  friendListHandle: {
    marginTop: 3,
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.ink,
  },
  manageButtonLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  groupManagerCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  groupManagerTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  groupManagerHandle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  groupManagerLabel: {
    marginTop: 4,
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groupChecklist: {
    gap: 8,
    marginTop: 4,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkRowChecked: {
    backgroundColor: "#eef8f2",
    borderColor: "#b7d8c0",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#c7d0da",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: "#4f7a57",
    borderColor: "#4f7a57",
  },
  checkboxMark: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  checkLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  groupSummaryLabel: {
    marginTop: 4,
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
  },
  groupSummaryValue: {
    color: theme.colors.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
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
