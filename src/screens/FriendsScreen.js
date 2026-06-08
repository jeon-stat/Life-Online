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
import { CHARACTER_CLASSES } from "../characters.js";
import { useStepData } from "../data/stepDataProvider.js";
import {
  DEFAULT_FRIEND_GROUPS,
  buildFriendRankingData,
  filterFriendsByGroup,
  findFriendByHandle,
  getFriendGroupIds,
  sortFriendCards,
} from "../data/mockFriendData.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { getStreak } from "../game/progression.js";
import { theme } from "../constants/theme.js";
import { FriendCharacterPreview } from "../components/FriendCharacterPreview";

const VIEW_TABS = [
  { id: "ranking", label: "랭킹" },
  { id: "friends", label: "친구 관리" },
  { id: "groups", label: "그룹 관리" },
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
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCode, setNewGroupCode] = useState("");
  const [renameGroupName, setRenameGroupName] = useState("");
  const [showGroupRename, setShowGroupRename] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [friendHandleInput, setFriendHandleInput] = useState("");
  const [friendAddMessage, setFriendAddMessage] = useState("");
  const [groupJoinCode, setGroupJoinCode] = useState("");
  const [groupJoinMessage, setGroupJoinMessage] = useState("");
  const [customFriends, setCustomFriends] = useState([]);

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin }),
    [admin, goal, history, today],
  );

  const previewCharacter = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    const selectedSkinTone = admin?.skinTones?.find((tone) => tone.id === admin?.skinToneId);

    if (!selectedSkinTone) {
      return baseCharacter;
    }

    return {
      ...baseCharacter,
      palette: {
        ...baseCharacter.palette,
        skin: selectedSkinTone.color,
      },
      skinTone: selectedSkinTone.color,
    };
  }, [admin?.skinToneId, admin?.skinTones]);

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
      for (const friend of [...friends, ...customFriends]) {
        if (!next[friend.id]) {
          next[friend.id] = getFriendGroupIds(friend);
        }
      }
      return next;
    });
  }, [customFriends, friends]);

  const mergedFriends = useMemo(() => {
    const baseFriends = friends.map((friend) => ({
      ...friend,
      groupIds: getFriendGroupIds(friend, friendGroupState),
    }));
    return dedupeFriends([...baseFriends, ...customFriends]);
  }, [customFriends, friendGroupState, friends]);

  const groupCounts = useMemo(() => buildGroupCounts(groups, mergedFriends), [groups, mergedFriends]);
  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  useEffect(() => {
    setRenameGroupName(selectedGroup && !selectedGroup.system ? selectedGroup.name : "");
    setShowGroupRename(false);
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedFriendId && mergedFriends.every((friend) => friend.id !== selectedFriendId)) {
      setSelectedFriendId(null);
    }
  }, [mergedFriends, selectedFriendId]);

  const selectedGroupFriends = useMemo(
    () => filterFriendsByGroup(mergedFriends, selectedGroupId),
    [mergedFriends, selectedGroupId],
  );

  const groupFriends = useMemo(
    () =>
      [...selectedGroupFriends].sort((a, b) => {
        if (selectedGroup?.leaderId === a.id) return -1;
        if (selectedGroup?.leaderId === b.id) return 1;
        return String(a.nickname ?? "").localeCompare(String(b.nickname ?? ""), "ko-KR");
      }),
    [selectedGroup?.leaderId, selectedGroupFriends],
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

  const previewSize = useMemo(() => Math.max(96, Math.min(132, Math.round(cardWidth * 0.92))), [cardWidth]);
  const galleryCardWidth = useMemo(() => {
    const horizontalPadding = theme.spacing.md * 2;
    const usableWidth = Math.max(0, width - horizontalPadding);
    const gapSpace = 20;
    const baseWidth = Math.floor((usableWidth - gapSpace) / 3);
    return Math.max(96, Math.min(140, baseWidth));
  }, [width]);
  const galleryPreviewSize = useMemo(
    () => Math.max(88, Math.min(124, Math.round(galleryCardWidth * 0.92))),
    [galleryCardWidth],
  );
  const expandedPreviewSize = useMemo(
    () => Math.max(240, Math.min(420, Math.round(width - theme.spacing.md * 2))),
    [width],
  );

  const createGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;

    const code = generateGroupCode(groups);
    const id = makeGroupId(name, groups);
    setGroups((current) => [...current, { id, name, code, system: false, leaderId: "friend-me" }]);
    setFriendGroupState((current) => ({
      ...current,
      "friend-me": Array.from(new Set([...(current["friend-me"] ?? []), id])),
    }));
    setSelectedGroupId(id);
    setNewGroupName("");
    setNewGroupCode(code);
    setShowGroupRename(false);
  };

  const joinGroup = () => {
    const rawCode = String(groupJoinCode ?? "").trim();

    if (!rawCode) {
      setGroupJoinMessage("그룹 번호를 입력해 주세요.");
      return;
    }

    const matchedGroup = groups.find((group) => String(group.code ?? "") === rawCode);
    if (!matchedGroup) {
      setGroupJoinMessage("찾을 수 없는 그룹 번호예요.");
      return;
    }

    setSelectedGroupId(matchedGroup.id);
    setFriendGroupState((current) => ({
      ...current,
      "friend-me": Array.from(new Set([...(current["friend-me"] ?? []), matchedGroup.id])),
    }));
    setGroupJoinMessage(`${matchedGroup.name} 그룹에 들어갔어요.`);
  };

  const renameGroup = () => {
    const name = renameGroupName.trim();
    if (!name || !selectedGroup || selectedGroup.system) return;

    setGroups((current) => current.map((group) => (group.id === selectedGroup.id ? { ...group, name } : group)));
    setShowGroupRename(false);
  };

  const deleteGroup = () => {
    if (!selectedGroup || selectedGroup.system) return;

    setGroups((current) => current.filter((group) => group.id !== selectedGroup.id));
    setFriendGroupState((current) => removeGroupFromAllFriends(current, selectedGroup.id));
    setSelectedGroupId(null);
    setShowGroupRename(false);
    setShowDeleteConfirm(false);
  };

  const addFriendFromHandle = () => {
    const raw = String(friendHandleInput ?? "").trim();
    const normalized = raw.toLowerCase();

    if (!normalized) {
      setFriendAddMessage("친구 아이디를 입력해 주세요.");
      return;
    }

    if (!normalized.startsWith("@")) {
      setFriendAddMessage("@아이디 형식으로 입력해 주세요.");
      return;
    }

    const handle = normalized.slice(1).trim();
    if (!handle) {
      setFriendAddMessage("@아이디 형식으로 입력해 주세요.");
      return;
    }

    if (mergedFriends.some((friend) => String(friend.handle ?? "").toLowerCase() === handle)) {
      setFriendAddMessage("이미 추가된 친구예요.");
      return;
    }

    const foundFriend = findFriendByHandle(handle);
    if (!foundFriend) {
      setFriendAddMessage("친구를 찾을 수 없어요.");
      return;
    }

    setCustomFriends((current) => {
      if (current.some((friend) => friend.handle === foundFriend.handle)) {
        return current;
      }
      return [...current, foundFriend];
    });
    setFriendGroupState((current) => ({
      ...current,
      [foundFriend.id]: getFriendGroupIds(foundFriend),
    }));
    setFriendHandleInput("");
    setFriendAddMessage(`${foundFriend.nickname}님을 추가했어요.`);
  };

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

      {viewMode === "groups" ? (
        <>
          <View style={styles.groupToolStack}>
            <View style={styles.groupToolCard}>
              <View style={styles.groupActionHeader}>
                <Text style={styles.groupActionTitle}>그룹 만들기</Text>
                <Text style={styles.groupActionHint}>고유 번호</Text>
              </View>
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
              <Text style={styles.groupActionNote}>
                만들면 고유 번호가 생겨요. {newGroupCode ? `최근 번호 ${newGroupCode}` : ""}
              </Text>
            </View>

            <View style={styles.groupToolCard}>
              <View style={styles.groupActionHeader}>
                <Text style={styles.groupActionTitle}>그룹 들어가기</Text>
                <Text style={styles.groupActionHint}>번호 입력</Text>
              </View>
              <View style={styles.inlineInputRow}>
                <TextInput
                  value={groupJoinCode}
                  onChangeText={setGroupJoinCode}
                  placeholder="그룹 번호"
                  placeholderTextColor={theme.colors.inkSoft}
                  keyboardType="number-pad"
                  style={styles.textInput}
                />
                <Pressable onPress={joinGroup} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonLabel}>입장</Text>
                </Pressable>
              </View>
              {groupJoinMessage ? <Text style={styles.groupActionNote}>{groupJoinMessage}</Text> : null}
            </View>
          </View>
        </>
      ) : null}

      {viewMode !== "friends" ? (
        <View style={styles.groupCard}>
          <View style={styles.groupCardTop}>
            <View>
              <Text style={styles.groupCardLabel}>그룹</Text>
              <Text style={styles.groupCardTitle}>{selectedGroup?.name ?? "아직 그룹이 없어요"}</Text>
            </View>
            {selectedGroup ? <Text style={styles.systemBadge}>번호 {selectedGroup.code}</Text> : null}
          </View>
          <Text style={styles.groupCardMeta}>
            {selectedGroup ? `${groupCounts[selectedGroup.id] ?? 0}명` : "새 그룹을 만들거나 들어가세요."}
            {selectedGroup?.leaderId ? ` · 그룹장 ${mergedFriends.find((friend) => friend.id === selectedGroup.leaderId)?.nickname ?? "나"}` : ""}
          </Text>

          {groups.length ? (
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
                    onPress={() => setSelectedGroupId(group.id)}
                    style={[styles.groupChip, active && styles.groupChipActive]}
                  >
                    <Text style={[styles.groupChipLabel, active && styles.groupChipLabelActive]}>
                      {group.name} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {viewMode === "groups" ? (
            <>
              <View style={styles.groupButtonRow}>
                {selectedGroup ? (
                  <>
                    <Pressable
                      onPress={() => setShowGroupRename((current) => !current)}
                      style={styles.groupActionFlexButton}
                    >
                      <Text style={styles.secondaryButtonLabel}>그룹 관리</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowDeleteConfirm(true)} style={styles.dangerButton}>
                      <Text style={styles.dangerButtonLabel}>그룹 삭제</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={styles.groupActionNote}>그룹을 하나 만들거나 번호를 입력해 들어가세요.</Text>
                )}
              </View>

              {selectedGroup && showGroupRename ? (
                <View style={styles.inlineInputRow}>
                  <TextInput
                    value={renameGroupName}
                    onChangeText={setRenameGroupName}
                    placeholder="그룹 이름"
                    placeholderTextColor={theme.colors.inkSoft}
                    style={styles.textInput}
                  />
                  <Pressable onPress={renameGroup} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonLabel}>변경</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}

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
            <Text style={styles.listTitle}>{getRankingTitle(rankMode, selectedGroup?.name ?? "")}</Text>
            <Text style={styles.listSubtitle}>{getRankingDetails(rankMode)}</Text>
          </View>

          {rankedFriends.length ? (
            <View style={styles.gridWrap}>
              {rankedFriends.map((friend) => (
                <FriendGalleryCard
                  key={friend.id}
                  friend={friend}
                  isMe={Boolean(friend.isMe)}
                  cardWidth={galleryCardWidth}
                  previewSize={galleryPreviewSize}
                  previewCharacter={previewCharacter}
                  characterViewState={characterViewState}
                  caption={getModeInfo(friend, rankMode).primaryValue}
                  onPress={() => setSelectedFriendId(friend.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
        </>
      ) : viewMode === "friends" ? (
        <>
          <View style={styles.groupActionCard}>
            <View style={styles.groupActionHeader}>
              <Text style={styles.groupActionTitle}>친구 추가</Text>
              <Text style={styles.groupActionHint}>@아이디</Text>
            </View>
            <View style={styles.inlineInputRow}>
              <TextInput
                value={friendHandleInput}
                onChangeText={setFriendHandleInput}
                placeholder="@아이디"
                placeholderTextColor={theme.colors.inkSoft}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.textInput}
              />
              <Pressable onPress={addFriendFromHandle} style={styles.primaryButton}>
                <Text style={styles.primaryButtonLabel}>추가</Text>
              </Pressable>
            </View>
            {friendAddMessage ? <Text style={styles.groupActionNote}>{friendAddMessage}</Text> : null}
          </View>

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
                    <FriendPreview character={previewCharacter} state={characterViewState} size={galleryPreviewSize} />
                  </View>
                  <View style={styles.friendGalleryCaption}>
                    <FriendIdentity friend={friend} />
                    <Text style={styles.friendGridSteps} numberOfLines={1}>
                      👣 {formatNumber(friend.todaySteps)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>그룹 친구</Text>
            <Text style={styles.listSubtitle}>선택한 그룹의 친구만 보여요.</Text>
          </View>

          {groupFriends.length ? (
            <View style={styles.friendGallery}>
              {groupFriends.map((friend) => {
                const active = friend.id === selectedFriend?.id;
                const isLeader = selectedGroup?.leaderId === friend.id;
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
                      <FriendPreview character={previewCharacter} state={characterViewState} size={galleryPreviewSize} />
                    </View>
                    <View style={styles.friendGalleryCaption}>
                      <FriendIdentity friend={friend} />
                      {isLeader ? <Text style={styles.friendLeaderBadge}>그룹장</Text> : null}
                      <Text style={styles.friendGridSteps} numberOfLines={1}>
                        👣 {formatNumber(friend.todaySteps)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyState />
          )}
        </>
      )}

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

                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.modalSceneWrap}>
                    <FriendPreview character={previewCharacter} state={characterViewState} size={expandedPreviewSize} variant="detail" />
                  </View>

                  <View style={styles.modalStatsRow}>
                    <StatBlock label="최근 7일" value={`${formatNumber(selectedFriend.weeklySteps)}보`} />
                    <StatBlock label="연속" value={`${selectedFriend.streak}일`} />
                    <StatBlock label="상태" value={getLongTermLabel(selectedFriend.longTermState)} />
                  </View>
                </ScrollView>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowDeleteConfirm(false)}>
          <Pressable style={styles.deleteConfirmCard} onPress={() => null}>
            <Text style={styles.deleteConfirmTitle}>정말 삭제할까요?</Text>
            <Text style={styles.deleteConfirmText}>그룹 정보와 멤버가 삭제될 수 있어요.</Text>
            <View style={styles.deleteConfirmRow}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonLabel}>취소</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  deleteGroup();
                }}
                style={styles.dangerButton}
              >
                <Text style={styles.dangerButtonLabel}>삭제</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function FriendGalleryCard({
  friend,
  isMe,
  cardWidth,
  previewSize,
  previewCharacter,
  characterViewState,
  caption,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.friendGalleryCard, isMe && styles.friendGalleryCardSelected, { width: cardWidth }]}
    >
      <View style={styles.friendGalleryScene}>
        <FriendPreview character={previewCharacter} state={characterViewState} size={previewSize} />
      </View>

      <View style={styles.friendGalleryCaption}>
        <FriendIdentity friend={friend} />
        <Text style={styles.friendGridSteps} numberOfLines={1}>
          {caption}
        </Text>
      </View>
    </Pressable>
  );
}

function FriendIdentity({ friend }) {
  return (
    <View style={styles.friendIdentity}>
      <Text style={styles.friendGridName} numberOfLines={1}>
        {friend.nickname}
      </Text>
      <Text style={styles.friendGridHandle} numberOfLines={1}>
        @{friend.handle}
      </Text>
    </View>
  );
}

function FriendPreview({ character, state, size, variant }) {
  return <FriendCharacterPreview character={character} state={state} size={size} variant={variant} />;
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

function dedupeFriends(friends) {
  const seen = new Set();
  const result = [];

  for (const friend of friends) {
    const key = String(friend?.id ?? friend?.handle ?? "").trim();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(friend);
  }

  return result;
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
    next[friendId] = Array.from(new Set((groupIds ?? []).filter((id) => id !== groupId)));
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

function generateGroupCode(groups) {
  const existing = new Set(groups.map((group) => String(group.code ?? "").trim()).filter(Boolean));
  let attempts = 0;

  while (attempts < 2000) {
    const candidate = String(100000 + Math.floor(Math.random() * 900000));
    if (!existing.has(candidate)) {
      return candidate;
    }
    attempts += 1;
  }

  return String(Date.now()).slice(-6);
}

function getModeInfo(friend, rankMode) {
  switch (rankMode) {
    case "weekly":
      return {
        primaryLabel: "이번 주",
        primaryValue: `${formatNumber(friend.weeklySteps)}보`,
      };
    case "streak":
      return {
        primaryLabel: "연속",
        primaryValue: `${friend.streak}일`,
      };
    default:
      return {
        primaryLabel: "오늘",
        primaryValue: `${formatNumber(friend.todaySteps)}보`,
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
  groupToolStack: {
    gap: 10,
  },
  groupToolCard: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
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
  groupButtonRow: {
    flexDirection: "row",
    gap: 8,
  },
  groupActionFlexButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    flex: 1,
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
    aspectRatio: 0.54,
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
  rankCardBadgeWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    left: -12,
    right: -12,
    top: 0,
    bottom: 52,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
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
    aspectRatio: 0.58,
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
    alignItems: "center",
    justifyContent: "center",
  },
  friendGalleryCaption: {
    minHeight: 42,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  friendIdentity: {
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  friendGridName: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  friendGridHandle: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  friendLeaderBadge: {
    alignSelf: "center",
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: "#f5f5f3",
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: "#111111",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  friendGridSteps: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
    flexShrink: 1,
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
    overflow: "hidden",
  },
  modalScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  modalScrollContent: {
    gap: 14,
    paddingBottom: 10,
  },
  deleteConfirmCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 10,
  },
  deleteConfirmTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  deleteConfirmText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    fontFamily: theme.fonts.body,
  },
  deleteConfirmRow: {
    flexDirection: "row",
    gap: 8,
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
    justifyContent: "center",
    flexShrink: 0,
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
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "900",
    flexShrink: 1,
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
