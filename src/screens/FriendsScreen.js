import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import {
  DEFAULT_FRIEND_GROUPS,
  buildFriendRankingData,
  filterFriendsByGroup,
  getFriendGroupIds,
  sortFriendCards,
  toggleFriendGroupMembership,
} from "../data/mockFriendData.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { getStreak } from "../game/progression.js";
import { theme } from "../constants/theme.js";
import { FriendCharacterPreview } from "../components/FriendCharacterPreview.js";

const VIEW_TABS = [
  { id: "ranking", label: "랭킹" },
  { id: "list", label: "목록" },
];

const RANK_TABS = [
  { id: "daily", label: "일간" },
  { id: "weekly", label: "주간" },
  { id: "streak", label: "연속" },
];

const RANK_BADGE_COLORS = {
  1: { backgroundColor: "#111111", color: "#ffffff", borderColor: "#111111" },
  2: { backgroundColor: "#f2f2f0", color: "#111111", borderColor: "#d9d9d6" },
  3: { backgroundColor: "#ececea", color: "#111111", borderColor: "#d2d2cf" },
};

const LONG_TERM_META = {
  WEAK: { label: "허약" },
  HEALTHY: { label: "건강" },
  ACTIVE: { label: "활발" },
};

export function FriendsScreen() {
  const { currentUser } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const { width } = useWindowDimensions();

  const [viewMode, setViewMode] = useState("ranking");
  const [rankMode, setRankMode] = useState("daily");
  const [groups, setGroups] = useState(() => DEFAULT_FRIEND_GROUPS.map((group) => ({ ...group })));
  const [friendGroupState, setFriendGroupState] = useState(() => ({}));
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [renameGroupName, setRenameGroupName] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin }),
    [admin, goal, history, today],
  );

  const weeklySteps = useMemo(
    () => history.slice(0, 7).reduce((sum, record) => sum + (record?.steps ?? 0), 0),
    [history],
  );

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

  useEffect(() => {
    setFriendGroupState((current) => {
      const next = { ...current };
      for (const friend of friends) {
        if (!next[friend.id]) {
          next[friend.id] = getFriendGroupIds(friend);
        }
      }
      return next;
    });
  }, [friends]);

  const mergedFriends = useMemo(
    () =>
      friends.map((friend) => ({
        ...friend,
        groupIds: getFriendGroupIds(friend, friendGroupState),
      })),
    [friendGroupState, friends],
  );

  const groupCounts = useMemo(() => buildGroupCounts(groups, mergedFriends), [groups, mergedFriends]);
  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? DEFAULT_FRIEND_GROUPS[0],
    [groups, selectedGroupId],
  );

  useEffect(() => {
    setRenameGroupName(selectedGroup && !selectedGroup.system ? selectedGroup.name : "");
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedFriendId && mergedFriends.every((friend) => friend.id !== selectedFriendId)) {
      setSelectedFriendId(null);
    }
  }, [mergedFriends, selectedFriendId]);

  useEffect(() => {
    if (viewMode !== "list") {
      setSelectedFriendId(null);
    }
  }, [viewMode]);

  const selectedGroupFriends = useMemo(
    () => filterFriendsByGroup(mergedFriends, selectedGroupId),
    [mergedFriends, selectedGroupId],
  );

  const rankedFriends = useMemo(
    () => sortFriendCards(selectedGroupFriends, rankMode),
    [rankMode, selectedGroupFriends],
  );

  const listFriends = useMemo(
    () =>
      [...mergedFriends].sort((a, b) =>
        String(a.nickname ?? "").localeCompare(String(b.nickname ?? ""), "ko-KR"),
      ),
    [mergedFriends],
  );

  const selectedFriend = useMemo(
    () => (selectedFriendId ? listFriends.find((friend) => friend.id === selectedFriendId) ?? null : null),
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
  const galleryCardWidth = useMemo(() => {
    const horizontalPadding = theme.spacing.md * 2;
    const usableWidth = Math.max(0, width - horizontalPadding);
    const gapSpace = 20;
    const baseWidth = Math.floor((usableWidth - gapSpace) / 3);
    return Math.max(96, Math.min(140, baseWidth));
  }, [width]);
  const galleryPreviewSize = useMemo(
    () => Math.max(88, Math.min(132, Math.round(galleryCardWidth * 0.96))),
    [galleryCardWidth],
  );
  const expandedPreviewSize = useMemo(
    () => Math.max(220, Math.min(360, Math.round(width - theme.spacing.md * 4))),
    [width],
  );

  const createGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;

    const id = makeGroupId(name, groups);
    setGroups((current) => [...current, { id, name, system: false }]);
    setSelectedGroupId(id);
    setShowCreateGroup(false);
    setNewGroupName("");
  };

  const renameGroup = () => {
    const name = renameGroupName.trim();
    if (!name || !selectedGroup || selectedGroup.system) return;

    setGroups((current) => current.map((group) => (group.id === selectedGroup.id ? { ...group, name } : group)));
  };

  const deleteGroup = () => {
    if (!selectedGroup || selectedGroup.system) return;

    setGroups((current) => current.filter((group) => group.id !== selectedGroup.id));
    setFriendGroupState((current) => removeGroupFromAllFriends(current, selectedGroup.id));
    setSelectedGroupId("all");
  };

  const toggleMembership = (friendId, groupId) => {
    setFriendGroupState((current) => toggleFriendGroupMembership(current, friendId, groupId));
  };

  const selectedFriendGroupIds = selectedFriend ? getFriendGroupIds(selectedFriend, friendGroupState) : [];
  const selectableGroups = groups.filter((group) => !group.system);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>친구</Text>
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

      <View style={styles.groupCard}>
        <View style={styles.groupCardTop}>
          <View>
            <Text style={styles.groupCardLabel}>그룹</Text>
            <Text style={styles.groupCardTitle}>{selectedGroup.name}</Text>
          </View>
          {selectedGroup.system ? <Text style={styles.systemBadge}>SYS</Text> : null}
        </View>
        <Text style={styles.groupCardMeta}>{groupCounts[selectedGroup.id] ?? 0}명</Text>

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupChipRow}
          style={styles.groupChipScroller}
        >
          {groups.map((group) => {
            const active = group.id === selectedGroupId;
            const count = groupCounts[group.id] ?? 0;
            return (
              <Pressable
                key={group.id}
                onPress={() => {
                  setSelectedGroupId(group.id);
                  setShowCreateGroup(false);
                }}
                style={[styles.groupChip, active && styles.groupChipActive]}
              >
                <Text style={[styles.groupChipLabel, active && styles.groupChipLabelActive]}>
                  {group.name} ({count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {viewMode === "list" ? (
          <>
            <View style={styles.groupActionCard}>
              <View style={styles.groupActionHeader}>
                <Text style={styles.groupActionTitle}>그룹 설정</Text>
                {selectedGroup.system ? <Text style={styles.groupActionHint}>시스템 그룹</Text> : null}
              </View>
              {selectedGroup.system ? (
                <Text style={styles.groupActionNote}>전체 그룹은 이름 변경과 삭제를 할 수 없어요.</Text>
              ) : (
                <>
                  <View style={styles.inlineInputRow}>
                    <TextInput
                      value={renameGroupName}
                      onChangeText={setRenameGroupName}
                      placeholder="그룹 이름"
                      placeholderTextColor={theme.colors.inkSoft}
                      style={styles.textInput}
                    />
                    <Pressable onPress={renameGroup} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonLabel}>이름 변경</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={deleteGroup} style={styles.dangerButton}>
                    <Text style={styles.dangerButtonLabel}>그룹 삭제</Text>
                  </Pressable>
                </>
              )}
            </View>

            <View style={styles.groupActionCard}>
              <View style={styles.groupActionHeader}>
                <Text style={styles.groupActionTitle}>새 그룹 만들기</Text>
                <Pressable
                  onPress={() => setShowCreateGroup((current) => !current)}
                  style={[styles.groupActionToggle, showCreateGroup && styles.groupActionToggleActive]}
                >
                  <Text style={[styles.groupActionToggleLabel, showCreateGroup && styles.groupActionToggleLabelActive]}>
                    {showCreateGroup ? "닫기" : "생성"}
                  </Text>
                </Pressable>
              </View>

              {showCreateGroup ? (
                <View style={styles.inlineInputRow}>
                  <TextInput
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                    placeholder="그룹 이름"
                    placeholderTextColor={theme.colors.inkSoft}
                    style={styles.textInput}
                  />
                  <Pressable onPress={createGroup} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonLabel}>생성</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </>
        ) : null}
      </View>

      {viewMode === "ranking" ? (
        <>
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
            <Text style={styles.listSubtitle}>{getRankingDetails(rankMode)}</Text>
          </View>

          {rankedFriends.length ? (
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
          ) : (
            <EmptyState />
          )}
        </>
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>친구 목록</Text>
            <Text style={styles.listSubtitle}>캐릭터를 눌러 크게 볼 수 있어요.</Text>
          </View>

          <View style={styles.friendGallery}>
            {listFriends.map((friend) => {
              const active = friend.id === selectedFriend?.id;
              return (
                <Pressable
                  key={friend.id}
                  onPress={() => setSelectedFriendId(friend.id)}
                  style={[
                    styles.friendGalleryCard,
                    active && styles.friendGalleryCardSelected,
                    { width: galleryCardWidth },
                  ]}
                >
                  <View style={styles.friendGalleryScene}>
                    <FriendPreview friend={friend} size={galleryPreviewSize} />
                  </View>
                  <View style={styles.friendGalleryCaption}>
                    <Text style={styles.friendGridName} numberOfLines={1}>
                      {friend.nickname}
                    </Text>
                    <Text style={styles.friendGridSteps} numberOfLines={1}>
                      👣 {formatNumber(friend.todaySteps)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Modal
            visible={Boolean(selectedFriend)}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedFriendId(null)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectedFriendId(null)}>
              <Pressable style={styles.modalCard} onPress={() => null}>
                {selectedFriend ? (
                  <>
                    <View style={styles.modalHeader}>
                      <View style={styles.modalHeaderText}>
                        <Text style={styles.modalTitle}>{selectedFriend.nickname}</Text>
                        <Text style={styles.modalHandle}>@{selectedFriend.handle}</Text>
                      </View>
                      <Pressable onPress={() => setSelectedFriendId(null)} style={styles.modalCloseButton}>
                        <Text style={styles.modalCloseButtonLabel}>×</Text>
                      </Pressable>
                    </View>

                    <View style={styles.modalSceneWrap}>
                      <FriendPreview friend={selectedFriend} size={expandedPreviewSize} />
                    </View>

                    <View style={styles.modalStatsRow}>
                      <StatBlock label="최근 7일" value={`${formatNumber(selectedFriend.weeklySteps)}보`} />
                      <StatBlock label="연속" value={`${selectedFriend.streak}일`} />
                      <StatBlock label="상태" value={getLongTermLabel(selectedFriend.longTermState)} />
                    </View>

                    <View style={styles.modalGroupCard}>
                      <View style={styles.modalSectionHeader}>
                        <Text style={styles.modalSectionTitle}>그룹</Text>
                        <Text style={styles.modalSectionMeta}>{Math.max(0, selectedFriendGroupIds.length - 1)}개</Text>
                      </View>
                      <View style={styles.groupChecklist}>
                        {selectableGroups.map((group) => {
                          const checked = selectedFriendGroupIds.includes(group.id);
                          return (
                            <Pressable
                              key={group.id}
                              onPress={() => toggleMembership(selectedFriend.id, group.id)}
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
                    </View>
                  </>
                ) : null}
              </Pressable>
            </Pressable>
          </Modal>
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
  return <FriendCharacterPreview friend={friend} size={size} />;
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

function StatBlock({ label, value }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statBlockLabel}>{label}</Text>
      <Text style={styles.statBlockValue} numberOfLines={1}>
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

function buildGroupCounts(groups, friends) {
  const counts = {};
  for (const group of groups) {
    counts[group.id] = 0;
  }

  for (const friend of friends) {
    for (const groupId of friend.groupIds ?? []) {
      if (counts[groupId] != null) {
        counts[groupId] += 1;
      }
    }
  }

  return counts;
}

function removeGroupFromAllFriends(groupState, groupId) {
  const next = {};

  for (const [friendId, groupIds] of Object.entries(groupState)) {
    next[friendId] = Array.from(new Set((groupIds ?? []).filter((id) => id !== groupId).concat("all")));
  }

  return next;
}

function makeGroupId(name, groups) {
  const seed = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "")
    .slice(0, 18) || "group";
  let candidate = `custom-${seed}`;
  let counter = 2;

  while (groups.some((group) => group.id === candidate)) {
    candidate = `custom-${seed}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function getModeInfo(friend, rankMode) {
  switch (rankMode) {
    case "weekly":
      return {
        primaryLabel: "이번 주",
        primaryValue: `${formatNumber(friend.weeklySteps)}보`,
        secondaryLeftLabel: "평균",
        secondaryLeftValue: `${formatNumber(Math.round((friend.weeklySteps ?? 0) / 7))}보`,
        secondaryRightLabel: "E",
        secondaryRightValue: `${friend.energyLevel}`,
      };
    case "streak":
      return {
        primaryLabel: "연속",
        primaryValue: `${friend.streak}일`,
        secondaryLeftLabel: "주간",
        secondaryLeftValue: `${formatNumber(friend.weeklySteps)}보`,
        secondaryRightLabel: "상태",
        secondaryRightValue: getLongTermLabel(friend.longTermState),
      };
    default:
      return {
        primaryLabel: "오늘",
        primaryValue: `${formatNumber(friend.todaySteps)}보`,
        secondaryLeftLabel: "E",
        secondaryLeftValue: `${friend.energyLevel}`,
        secondaryRightLabel: "상태",
        secondaryRightValue: getLongTermLabel(friend.longTermState),
      };
  }
}

function getRankingTitle(rankMode, groupName) {
  const prefix = groupName ? `${groupName} 안의 ` : "";
  switch (rankMode) {
    case "weekly":
      return `${prefix}주간 순위`;
    case "streak":
      return `${prefix}연속 순위`;
    default:
      return `${prefix}일간 순위`;
  }
}

function getRankingDetails(rankMode) {
  switch (rankMode) {
    case "weekly":
      return "선택한 그룹 안의 이번 주 걸음 수를 봅니다.";
    case "streak":
      return "선택한 그룹 안의 연속 달성일을 봅니다.";
    default:
      return "선택한 그룹 안의 오늘 걸음 수를 봅니다.";
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
      backgroundColor: "#f5f5f3",
      borderColor: "#dededb",
    },
    textColor: theme.colors.ink,
  };
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
    fontFamily: theme.fonts.display,
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
    fontFamily: theme.fonts.body,
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
    gap: 10,
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
    fontFamily: theme.fonts.display,
  },
  groupCardMeta: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  systemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: "#f5f5f3",
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
  },
  groupChipRow: {
    gap: 8,
    paddingHorizontal: 4,
  },
  groupChipScroller: {
    marginTop: 8,
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
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  groupChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  groupChipLabelActive: {
    color: "#ffffff",
  },
  groupActionCard: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  groupActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  groupActionTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  groupActionHint: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  groupActionNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    fontFamily: theme.fonts.body,
  },
  groupActionToggle: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groupActionToggleActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  groupActionToggleLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  groupActionToggleLabelActive: {
    color: "#ffffff",
  },
  inlineInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  primaryButton: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    backgroundColor: "#111111",
    paddingHorizontal: 12,
  },
  primaryButtonLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  secondaryButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  dangerButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dangerButtonLabel: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
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
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  rankTabLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.display,
  },
  listSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
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
    backgroundColor: "#ffffff",
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
    backgroundColor: "#f9f9f8",
    borderColor: "#111111",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
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
    fontFamily: theme.fonts.body,
  },
  friendName: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  meLabel: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.body,
  },
  primaryStatValue: {
    color: theme.colors.ink,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.body,
  },
  footerStatValue: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  friendGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  friendGalleryCard: {
    borderRadius: theme.radius.xl,
    padding: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    aspectRatio: 0.66,
    overflow: "hidden",
    gap: 8,
  },
  friendGalleryCardSelected: {
    borderColor: "#111111",
    backgroundColor: "#f8f8f7",
  },
  friendGalleryScene: {
    flex: 1,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  friendGalleryCaption: {
    minHeight: 42,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  friendGridName: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  friendGridSteps: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  modalBackdrop: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: "rgba(17,17,17,0.28)",
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 28,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 14,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modalHeaderText: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  modalHandle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCloseButtonLabel: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 20,
    fontFamily: theme.fonts.body,
  },
  modalSceneWrap: {
    width: "100%",
    alignItems: "center",
  },
  modalStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statBlock: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 2,
  },
  statBlockLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  statBlockValue: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  modalGroupCard: {
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  modalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  modalSectionTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  modalSectionMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
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
    backgroundColor: "#f7f7f5",
    borderColor: "#111111",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#d8d8d6",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  checkboxMark: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  checkLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
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
    fontFamily: theme.fonts.display,
  },
  emptyText: {
    marginTop: 8,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
