import { SKIN_TONE_PRESETS } from "../characters.js";

export const DEFAULT_FRIEND_GROUPS = [
  { id: "all", name: "전체", system: true },
  { id: "workout", name: "운동친구", system: false },
  { id: "school", name: "학교", system: false },
  { id: "company", name: "회사", system: false },
  { id: "family", name: "가족", system: false },
];

export const FRIEND_GROUPS = DEFAULT_FRIEND_GROUPS;

const BASE_FRIENDS = [
  {
    id: "friend-minji",
    nickname: "민지",
    handle: "minji",
    avatarCharacterId: "chibi-01",
    todaySteps: 12430,
    weeklySteps: 58000,
    streak: 7,
    energyLevel: 6,
    longTermState: "ACTIVE",
    skinTone: SKIN_TONE_PRESETS[2]?.color ?? "#efbda8",
    groupIds: ["all", "workout", "school"],
  },
  {
    id: "friend-jun",
    nickname: "준호",
    handle: "junho",
    avatarCharacterId: "chibi-02",
    todaySteps: 10880,
    weeklySteps: 50240,
    streak: 5,
    energyLevel: 5,
    longTermState: "HEALTHY",
    skinTone: SKIN_TONE_PRESETS[4]?.color ?? "#f29d6d",
    groupIds: ["all", "workout", "company"],
  },
  {
    id: "friend-soo",
    nickname: "수연",
    handle: "sooyeon",
    avatarCharacterId: "chibi-03",
    todaySteps: 9640,
    weeklySteps: 48320,
    streak: 9,
    energyLevel: 5,
    longTermState: "ACTIVE",
    skinTone: SKIN_TONE_PRESETS[0]?.color ?? "#f7d9cf",
    groupIds: ["all", "school", "family"],
  },
  {
    id: "friend-hana",
    nickname: "하나",
    handle: "hana_walks",
    avatarCharacterId: "chibi-04",
    todaySteps: 8340,
    weeklySteps: 41750,
    streak: 3,
    energyLevel: 4,
    longTermState: "HEALTHY",
    skinTone: SKIN_TONE_PRESETS[1]?.color ?? "#f4cbbb",
    groupIds: ["all", "workout", "family"],
  },
  {
    id: "friend-minho",
    nickname: "민호",
    handle: "minho",
    avatarCharacterId: "chibi-05",
    todaySteps: 6320,
    weeklySteps: 36210,
    streak: 11,
    energyLevel: 4,
    longTermState: "HEALTHY",
    skinTone: SKIN_TONE_PRESETS[5]?.color ?? "#d77c54",
    groupIds: ["all", "company"],
  },
];

const FRIEND_DIRECTORY = [
  ...BASE_FRIENDS,
  {
    id: "friend-seo",
    nickname: "서연",
    handle: "seoyeon",
    avatarCharacterId: "chibi-06",
    todaySteps: 7890,
    weeklySteps: 40120,
    streak: 4,
    energyLevel: 4,
    longTermState: "HEALTHY",
    skinTone: SKIN_TONE_PRESETS[3]?.color ?? "#f0b79b",
    groupIds: ["all"],
  },
  {
    id: "friend-ji",
    nickname: "지우",
    handle: "jiwoo",
    avatarCharacterId: "chibi-07",
    todaySteps: 9450,
    weeklySteps: 46200,
    streak: 6,
    energyLevel: 5,
    longTermState: "ACTIVE",
    skinTone: SKIN_TONE_PRESETS[6]?.color ?? "#cb7a53",
    groupIds: ["all"],
  },
  {
    id: "friend-doyun",
    nickname: "도윤",
    handle: "doyun",
    avatarCharacterId: "chibi-08",
    todaySteps: 5230,
    weeklySteps: 28900,
    streak: 2,
    energyLevel: 3,
    longTermState: "HEALTHY",
    skinTone: SKIN_TONE_PRESETS[1]?.color ?? "#f4cbbb",
    groupIds: ["all"],
  },
];

export function buildFriendRankingData({
  currentUser,
  todayRecord,
  weeklySteps = 0,
  streak = 0,
  energyLevel = 3,
  longTermState = "HEALTHY",
  skinTone = null,
} = {}) {
  const friends = [...BASE_FRIENDS];
  const currentHandle = String(currentUser?.handle ?? "walk").trim().toLowerCase();
  const currentNickname = String(currentUser?.nickname ?? "내 산책 파트너").trim() || "내 산책 파트너";
  const meSkinTone = skinTone ?? SKIN_TONE_PRESETS[0]?.color ?? "#f7d9cf";

  const me = {
    id: "friend-me",
    nickname: currentNickname,
    handle: currentHandle || "walk",
    avatarCharacterId: "custom-chibi",
    todaySteps: todayRecord?.steps ?? 0,
    weeklySteps,
    streak,
    energyLevel,
    longTermState,
    skinTone: meSkinTone,
    groupIds: ["all"],
    isMe: true,
  };

  const existingIndex = friends.findIndex((friend) => friend.handle === me.handle);
  if (existingIndex >= 0) {
    friends[existingIndex] = {
      ...friends[existingIndex],
      ...me,
      id: friends[existingIndex].id,
      groupIds: normalizeGroupIds(friends[existingIndex].groupIds),
      isMe: true,
    };
    return friends;
  }

  friends.push(me);
  return friends;
}

export function findFriendByHandle(handle) {
  const normalized = normalizeHandle(handle);
  if (!normalized) {
    return null;
  }

  return FRIEND_DIRECTORY.find((friend) => friend.handle === normalized) ?? null;
}

export function getFriendDirectory() {
  return FRIEND_DIRECTORY.map((friend) => ({ ...friend }));
}

export function createFriendGroupState(friends = []) {
  return friends.reduce((acc, friend) => {
    acc[friend.id] = normalizeGroupIds(friend.groupIds);
    return acc;
  }, {});
}

export function getFriendGroupIds(friend, groupState = {}) {
  return normalizeGroupIds(groupState?.[friend.id] ?? friend?.groupIds ?? ["all"]);
}

export function getFriendGroupNames(friend, groupState = {}, groups = DEFAULT_FRIEND_GROUPS) {
  const groupIds = getFriendGroupIds(friend, groupState);
  return groups
    .filter((group) => groupIds.includes(group.id) && !group.system)
    .map((group) => group.name)
    .join(", ") || "없음";
}

export function filterFriendsByGroup(friends, groupId) {
  if (groupId === "all") {
    return [...friends];
  }

  return friends.filter((friend) => getFriendGroupIds(friend).includes(groupId));
}

export function toggleFriendGroupMembership(groupState, friendId, groupId) {
  if (!friendId || !groupId || groupId === "all") {
    return groupState;
  }

  const currentIds = normalizeGroupIds(groupState?.[friendId] ?? ["all"]);
  const nextIds = new Set(currentIds);

  if (nextIds.has(groupId)) {
    nextIds.delete(groupId);
  } else {
    nextIds.add(groupId);
  }

  nextIds.add("all");

  return {
    ...groupState,
    [friendId]: Array.from(nextIds),
  };
}

export function sortFriendCards(friends, mode) {
  const sorted = [...friends];
  const scoreKey = getSortKey(mode);

  return sorted.sort((a, b) => {
    const diff = (b?.[scoreKey] ?? 0) - (a?.[scoreKey] ?? 0);
    if (diff !== 0) {
      return diff;
    }

    return String(a.nickname ?? "").localeCompare(String(b.nickname ?? ""), "ko-KR");
  });
}

export function getFriendSortLabel(mode) {
  switch (mode) {
    case "weekly":
      return "주간 누적 발걸음 순위";
    case "streak":
      return "연속 달성 순위";
    default:
      return "일간 순위";
  }
}

function normalizeGroupIds(groupIds) {
  const normalized = new Set(Array.isArray(groupIds) ? groupIds.filter(Boolean) : []);
  normalized.add("all");
  return Array.from(normalized);
}

function normalizeHandle(handle) {
  return String(handle ?? "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function getSortKey(mode) {
  switch (mode) {
    case "weekly":
      return "weeklySteps";
    case "streak":
      return "streak";
    default:
      return "todaySteps";
  }
}
