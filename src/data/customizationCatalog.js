import { SKIN_TONE_PRESETS } from "../characters.js";

const DEFAULT_PRICE = 0;

export const CUSTOMIZATION_CATEGORIES = [
  { id: "top", label: "상의", accent: "#d89a4a" },
  { id: "bottom", label: "하의", accent: "#8fbe70" },
  { id: "expression", label: "표정", accent: "#111111" },
  { id: "background", label: "배경", accent: "#7bb3e5" },
  { id: "item", label: "아이템", accent: "#7d87ff" },
  { id: "skinTone", label: "피부톤", accent: "#d6b09b" },
];

export const CUSTOMIZATION_ITEMS = {
  top: buildItems("top", [
    "맨투맨",
    "후드티",
    "니트",
    "재킷",
    "셔츠",
    "코트",
    "티셔츠",
    "가디건",
    "조끼",
    "블라우스",
    "점퍼",
    "폴로",
  ]),
  bottom: buildItems("bottom", [
    "청바지",
    "조거",
    "슬랙스",
    "반바지",
    "스커트",
    "와이드",
    "레깅스",
    "트레이닝",
    "면바지",
    "롤업",
    "오버롤",
    "부츠컷",
  ]),
  expression: buildItems("expression", [
    "무표정",
    "미소",
    "졸림",
    "뿌듯",
    "놀람",
    "행복",
    "집중",
    "민망",
    "하트눈",
    "윙크",
    "멍",
    "쇼크",
  ]),
  background: buildItems("background", [
    "하늘",
    "노을",
    "밤하늘",
    "숲길",
    "공원",
    "바닷가",
    "들판",
    "골목",
    "강변",
    "눈밭",
    "비오는날",
    "실내",
  ]),
  item: buildItems("item", [
    "모자",
    "가방",
    "선글라스",
    "리본",
    "목도리",
    "안경",
    "꽃",
    "풍선",
    "우산",
    "스티커",
    "별",
    "인형",
  ]),
  skinTone: SKIN_TONE_PRESETS.map((tone, index) => ({
    id: tone.id ?? `skin-tone-${index + 1}`,
    label: tone.label ?? `톤 ${index + 1}`,
    color: tone.color,
    price: DEFAULT_PRICE,
  })),
};

export const DEFAULT_SHOP_COIN_BALANCE = 1000;

export function createDefaultOwnedItemIds() {
  return {
    top: CUSTOMIZATION_ITEMS.top.slice(0, 9).map((item) => item.id),
    bottom: CUSTOMIZATION_ITEMS.bottom.slice(0, 9).map((item) => item.id),
    expression: CUSTOMIZATION_ITEMS.expression.slice(0, 9).map((item) => item.id),
    background: CUSTOMIZATION_ITEMS.background.slice(0, 9).map((item) => item.id),
    item: CUSTOMIZATION_ITEMS.item.slice(0, 9).map((item) => item.id),
    skinTone: CUSTOMIZATION_ITEMS.skinTone.map((item) => item.id),
  };
}

export function createDefaultSelectedItemIds() {
  const owned = createDefaultOwnedItemIds();

  return {
    top: owned.top[0] ?? null,
    bottom: owned.bottom[0] ?? null,
    expression: owned.expression[0] ?? null,
    background: owned.background[0] ?? null,
    item: owned.item[0] ?? null,
    skinTone: owned.skinTone[0] ?? null,
  };
}

function buildItems(prefix, labels) {
  return labels.map((label, index) => ({
    id: `${prefix}-${index + 1}`,
    label,
    price: DEFAULT_PRICE,
  }));
}
