import { SKIN_TONE_PRESETS } from "../characters.js";

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
  },
];

export function buildFriendRankingData({ currentUser, todayRecord, weeklySteps = 0, streak = 0, energyLevel = 3, longTermState = "HEALTHY", skinTone = null } = {}) {
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
    isMe: true,
  };

  const existingIndex = friends.findIndex((friend) => friend.handle === me.handle);
  if (existingIndex >= 0) {
    friends[existingIndex] = {
      ...friends[existingIndex],
      ...me,
      id: friends[existingIndex].id,
      isMe: true,
    };
    return friends;
  }

  friends.push(me);
  return friends;
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
