const STARTER_BACKGROUND_ID = "background-starter-meadow";
const STARTER_ACTION_ID = "action-starter-idle";

export const ACTION_CATALOG = [
  {
    id: STARTER_ACTION_ID,
    animationKey: "energy3",
    label: "포근한 대기",
    description: "기본 자세로 작은 세계를 천천히 바라봐요.",
    preview: "Neutral Idle",
    motionKind: "neutral",
    clipSpeed: 1,
    worldSpeed: 0.02,
    requiredLevel: 1,
  },
  {
    id: "action-breathing-idle",
    animationKey: "energy2",
    label: "숨 고르기",
    description: "가볍게 호흡을 정리하는 안정적인 동작이에요.",
    preview: "Breathing Idle",
    motionKind: "neutral",
    clipSpeed: 1,
    worldSpeed: 0.02,
    requiredLevel: 3,
  },
  {
    id: "action-hiphop-dance",
    animationKey: "hipHopDancing",
    label: "축하 댄스",
    description: "목표를 자주 채울수록 무대를 즐길 수 있어요.",
    preview: "Hip Hop Dancing",
    motionKind: "neutral",
    clipSpeed: 1,
    worldSpeed: 0.04,
    requiredLevel: 9,
  },
  {
    id: "action-moonwalk",
    animationKey: "moonwalk",
    label: "문워크",
    description: "세계가 자랄수록 더 장난스러운 움직임이 열려요.",
    preview: "Moonwalk",
    motionKind: "neutral",
    clipSpeed: 1,
    worldSpeed: 0.04,
    requiredLevel: 15,
  },
  {
    id: "action-run-loop",
    animationKey: "energy5",
    label: "러닝 루프",
    description: "언제든 활기찬 무드로 둘러볼 수 있는 동작이에요.",
    preview: "Running",
    motionKind: "run",
    clipSpeed: 1.08,
    worldSpeed: 0.26,
    requiredLevel: 18,
  },
];

export const BACKGROUND_CATALOG = [
  {
    id: STARTER_BACKGROUND_ID,
    label: "새싹 마당",
    description: "처음 시작할 때의 차분한 잔디 마당이에요.",
    preview: "기본 배경",
    palette: ["#f7f6ef", "#eef4ea"],
    stage: "#eef1e5",
    bubbleSurface: "#ffffff",
    effect: "float",
    brightness: 1,
    cloudSpeed: 0.6,
    requiredLevel: 1,
  },
  {
    id: "background-sunset-yard",
    label: "노을 정원",
    description: "하루가 잘 쌓일수록 따뜻한 노을빛이 더해져요.",
    preview: "노을빛",
    palette: ["#fff1d9", "#f8d7c1"],
    stage: "#f2dfcf",
    bubbleSurface: "#fff9f2",
    effect: "float",
    brightness: 1.02,
    cloudSpeed: 0.55,
    requiredLevel: 5,
  },
  {
    id: "background-starlit-pond",
    label: "별빛 연못",
    description: "밤하늘과 물결이 작은 세계를 더 깊게 보여줘요.",
    preview: "별빛",
    palette: ["#eef4ff", "#d8e7fb"],
    stage: "#dce7f5",
    bubbleSurface: "#f8fbff",
    effect: "sparkle",
    brightness: 1.03,
    cloudSpeed: 0.7,
    requiredLevel: 12,
  },
  {
    id: "background-seaside-breeze",
    label: "바닷바람 산책길",
    description: "오래 걸어온 기록이 넓은 풍경을 열어 줘요.",
    preview: "바다",
    palette: ["#ecfbff", "#d2f1f1"],
    stage: "#d8ece9",
    bubbleSurface: "#f8ffff",
    effect: "float",
    brightness: 1.04,
    cloudSpeed: 0.82,
    requiredLevel: 17,
  },
];

export const PET_CATALOG = [
  {
    id: "pet-sprout",
    label: "새싹 친구",
    description: "천천히 자라는 작은 새싹이 곁을 따라다녀요.",
    preview: "초록 구슬",
    color: "#7bb36a",
    accent: "#eaf6d4",
    shape: "orb",
    requiredLevel: 4,
  },
  {
    id: "pet-cloud",
    label: "구름 친구",
    description: "둥실둥실 떠다니며 화면에 부드러운 리듬을 더해요.",
    preview: "하얀 구름",
    color: "#dbe7f7",
    accent: "#ffffff",
    shape: "cloud",
    requiredLevel: 10,
  },
  {
    id: "pet-lantern",
    label: "등불 친구",
    description: "밤이 되어도 길을 잃지 않게 옆에서 반짝여요.",
    preview: "주황 빛",
    color: "#f0b15e",
    accent: "#fff1d4",
    shape: "lantern",
    requiredLevel: 14,
  },
];

export const EXPRESSION_CATALOG = [
  {
    id: "expression-starter-calm",
    label: "잔잔한 표정",
    description: "처음 시작할 때의 편안한 기본 표정이에요.",
    preview: "기본",
    requiredLevel: 1,
  },
  {
    id: "expression-soft-smile",
    label: "작은 미소",
    description: "조금씩 성장이 시작될 때 열리는 표정이에요.",
    preview: "미소",
    requiredLevel: 2,
  },
  {
    id: "expression-curious",
    label: "호기심",
    description: "새로운 풍경을 발견하는 눈빛이에요.",
    preview: "호기심",
    requiredLevel: 11,
  },
  {
    id: "expression-proud",
    label: "뿌듯함",
    description: "꾸준함이 만든 자신감이 얼굴에 드러나요.",
    preview: "뿌듯",
    requiredLevel: 16,
  },
];

export const OUTFIT_CATALOG = [
  {
    id: "outfit-daypack",
    label: "데이팩",
    description: "산책이 일상이 되면 어울리는 가벼운 외출 룩이에요.",
    preview: "가방 포인트",
    requiredLevel: 8,
    hasModelAsset: false,
  },
  {
    id: "outfit-raincoat",
    label: "레인코트",
    description: "날씨 효과와 잘 어울리는 비 오는 날 룩이에요.",
    preview: "비옷",
    requiredLevel: 13,
    hasModelAsset: false,
  },
  {
    id: "outfit-festival-cape",
    label: "축제 망토",
    description: "높은 레벨에서만 보이는 상징적인 의상 콘셉트예요.",
    preview: "망토",
    requiredLevel: 19,
    hasModelAsset: false,
  },
];

export const LEVEL_REWARDS = [
  {
    id: "reward-expression-soft-smile",
    requiredLevel: 2,
    type: "expression",
    name: "작은 미소",
    description: "새로운 표정이 열립니다.",
    assetKey: "expression-soft-smile",
    preview: "미소",
    permanentlyUnlocked: true,
    contentId: "expression-soft-smile",
  },
  {
    id: "reward-action-breathing-idle",
    requiredLevel: 3,
    type: "action",
    name: "숨 고르기",
    description: "선택 가능한 캐릭터 동작이 추가됩니다.",
    assetKey: "action-breathing-idle",
    preview: "Breathing Idle",
    permanentlyUnlocked: true,
    contentId: "action-breathing-idle",
  },
  {
    id: "reward-pet-sprout",
    requiredLevel: 4,
    type: "pet",
    name: "새싹 친구",
    description: "첫 번째 펫이 세계에 합류합니다.",
    assetKey: "pet-sprout",
    preview: "초록 구슬",
    permanentlyUnlocked: true,
    contentId: "pet-sprout",
  },
  {
    id: "reward-background-sunset-yard",
    requiredLevel: 5,
    type: "background",
    name: "노을 정원",
    description: "새로운 배경을 선택할 수 있습니다.",
    assetKey: "background-sunset-yard",
    preview: "노을빛",
    permanentlyUnlocked: true,
    contentId: "background-sunset-yard",
  },
  {
    id: "reward-pet-sprout-cheer",
    requiredLevel: 6,
    type: "petAction",
    name: "새싹 친구의 응원",
    description: "펫이 목표 달성 시 더 활발하게 반응합니다.",
    assetKey: "pet-sprout-cheer",
    preview: "펫 특별 행동",
    permanentlyUnlocked: true,
    contentId: "pet-sprout",
  },
  {
    id: "reward-world-fireflies",
    requiredLevel: 7,
    type: "worldEffect",
    name: "반딧불 효과",
    description: "시간대와 날씨 느낌을 더하는 연출이 열립니다.",
    assetKey: "world-fireflies",
    preview: "반짝임",
    permanentlyUnlocked: true,
    contentId: "world-fireflies",
  },
  {
    id: "reward-outfit-daypack",
    requiredLevel: 8,
    type: "outfit",
    name: "데이팩",
    description: "새로운 의상 콘셉트가 해금됩니다.",
    assetKey: "outfit-daypack",
    preview: "가방 포인트",
    permanentlyUnlocked: true,
    contentId: "outfit-daypack",
  },
  {
    id: "reward-action-hiphop-dance",
    requiredLevel: 9,
    type: "action",
    name: "축하 댄스",
    description: "화려한 선택 동작이 추가됩니다.",
    assetKey: "action-hiphop-dance",
    preview: "Hip Hop Dancing",
    permanentlyUnlocked: true,
    contentId: "action-hiphop-dance",
  },
  {
    id: "reward-pet-cloud",
    requiredLevel: 10,
    type: "pet",
    name: "구름 친구",
    description: "새로운 펫이 작은 세계를 떠다닙니다.",
    assetKey: "pet-cloud",
    preview: "하얀 구름",
    permanentlyUnlocked: true,
    contentId: "pet-cloud",
  },
  {
    id: "reward-expression-curious",
    requiredLevel: 11,
    type: "expression",
    name: "호기심",
    description: "새로운 표정이 열립니다.",
    assetKey: "expression-curious",
    preview: "호기심",
    permanentlyUnlocked: true,
    contentId: "expression-curious",
  },
  {
    id: "reward-background-starlit-pond",
    requiredLevel: 12,
    type: "background",
    name: "별빛 연못",
    description: "밤 느낌의 배경을 선택할 수 있습니다.",
    assetKey: "background-starlit-pond",
    preview: "별빛",
    permanentlyUnlocked: true,
    contentId: "background-starlit-pond",
  },
  {
    id: "reward-outfit-raincoat",
    requiredLevel: 13,
    type: "outfit",
    name: "레인코트",
    description: "새로운 의상 콘셉트가 해금됩니다.",
    assetKey: "outfit-raincoat",
    preview: "비옷",
    permanentlyUnlocked: true,
    contentId: "outfit-raincoat",
  },
  {
    id: "reward-pet-lantern",
    requiredLevel: 14,
    type: "pet",
    name: "등불 친구",
    description: "밤 분위기에 잘 어울리는 펫이 등장합니다.",
    assetKey: "pet-lantern",
    preview: "주황 빛",
    permanentlyUnlocked: true,
    contentId: "pet-lantern",
  },
  {
    id: "reward-action-moonwalk",
    requiredLevel: 15,
    type: "action",
    name: "문워크",
    description: "선택 가능한 리듬 동작이 추가됩니다.",
    assetKey: "action-moonwalk",
    preview: "Moonwalk",
    permanentlyUnlocked: true,
    contentId: "action-moonwalk",
  },
  {
    id: "reward-expression-proud",
    requiredLevel: 16,
    type: "expression",
    name: "뿌듯함",
    description: "꾸준함이 쌓인 표정이 열립니다.",
    assetKey: "expression-proud",
    preview: "뿌듯",
    permanentlyUnlocked: true,
    contentId: "expression-proud",
  },
  {
    id: "reward-background-seaside-breeze",
    requiredLevel: 17,
    type: "background",
    name: "바닷바람 산책길",
    description: "넓은 풍경의 배경을 선택할 수 있습니다.",
    assetKey: "background-seaside-breeze",
    preview: "바다",
    permanentlyUnlocked: true,
    contentId: "background-seaside-breeze",
  },
  {
    id: "reward-action-run-loop",
    requiredLevel: 18,
    type: "action",
    name: "러닝 루프",
    description: "빠른 리듬의 선택 동작이 추가됩니다.",
    assetKey: "action-run-loop",
    preview: "Running",
    permanentlyUnlocked: true,
    contentId: "action-run-loop",
  },
  {
    id: "reward-outfit-festival-cape",
    requiredLevel: 19,
    type: "outfit",
    name: "축제 망토",
    description: "상징적인 의상 콘셉트가 해금됩니다.",
    assetKey: "outfit-festival-cape",
    preview: "망토",
    permanentlyUnlocked: true,
    contentId: "outfit-festival-cape",
  },
  {
    id: "reward-world-golden-hours",
    requiredLevel: 20,
    type: "worldEffect",
    name: "황금 시간대 연출",
    description: "작은 세계에 더 풍성한 빛 연출이 더해집니다.",
    assetKey: "world-golden-hours",
    preview: "빛 연출",
    permanentlyUnlocked: true,
    contentId: "world-golden-hours",
  },
];

export function getStarterActionId() {
  return STARTER_ACTION_ID;
}

export function getStarterBackgroundId() {
  return STARTER_BACKGROUND_ID;
}

export function getRewardsForLevel(level) {
  return LEVEL_REWARDS.filter((reward) => reward.requiredLevel === level);
}

export function getRewardById(rewardId) {
  return LEVEL_REWARDS.find((reward) => reward.id === rewardId) ?? null;
}

export function getRewardsUnlockedUpToLevel(level) {
  return LEVEL_REWARDS.filter((reward) => reward.requiredLevel <= level).map((reward) => reward.id);
}

export function findActionById(actionId) {
  return ACTION_CATALOG.find((item) => item.id === actionId) ?? ACTION_CATALOG[0] ?? null;
}

export function findBackgroundById(backgroundId) {
  return BACKGROUND_CATALOG.find((item) => item.id === backgroundId) ?? BACKGROUND_CATALOG[0] ?? null;
}

export function findPetById(petId) {
  return PET_CATALOG.find((item) => item.id === petId) ?? null;
}

export function findExpressionById(expressionId) {
  return EXPRESSION_CATALOG.find((item) => item.id === expressionId) ?? EXPRESSION_CATALOG[0] ?? null;
}

export function findOutfitById(outfitId) {
  return OUTFIT_CATALOG.find((item) => item.id === outfitId) ?? null;
}

export function isRewardUnlocked(rewardId, unlockedRewardIds = []) {
  return unlockedRewardIds.includes(rewardId);
}

export function getUnlockedContentIds(unlockedRewardIds = [], type) {
  return LEVEL_REWARDS
    .filter((reward) => reward.type === type && unlockedRewardIds.includes(reward.id))
    .map((reward) => reward.contentId)
    .filter(Boolean);
}

export function getNextRewards(currentLevel) {
  return getRewardsForLevel(currentLevel + 1);
}
