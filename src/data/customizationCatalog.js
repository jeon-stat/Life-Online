import { SKIN_TONE_PRESETS } from "../characters.js";

const DEFAULT_PRICE = 0;

export const CUSTOMIZATION_CATEGORIES = [
  { id: "top", label: "\uC0C1\uC758", accent: "#d89a4a" },
  { id: "bottom", label: "\uD558\uC758", accent: "#8fbe70" },
  { id: "expression", label: "\uD45C\uC815", accent: "#111111" },
  { id: "background", label: "\uBC30\uACBD", accent: "#7bb3e5" },
  { id: "item", label: "\uC544\uC774\uD15C", accent: "#7d87ff" },
  { id: "skinTone", label: "\uD53C\uBD80\uD1A4", accent: "#d6b09b" },
];

export const CUSTOMIZATION_ITEMS = {
  top: buildItems("top", [
    "\uB9E4\uD2B8\uB85C",
    "\uC544\uC6B0\uD130",
    "\uC154\uCE20",
    "\uC2A4\uC6E8\uD130",
    "\uC904\uB2C8",
    "\uCF54\uD2B8",
    "\uCE90\uCE6D",
    "\uAC00\uB514\uAC74",
    "\uD6C4\uB4DC",
    "\uBE0C\uB77C\uC774\uC5B8",
    "\uC138\uC158",
    "\uD53C\uCE20",
  ]),
  bottom: buildItems("bottom", [
    "\uCC44\uCEEC",
    "\uC870\uAC70",
    "\uB9C8\uB4E4",
    "\uBC18\uBC14\uC9C0",
    "\uC2A4\uB7EC\uC6B4",
    "\uC2A4\uD0A4\uB2C8",
    "\uD50C\uB85C\uC5B4",
    "\uBAA8\uB4E0",
    "\uC14B",
    "\uB85C\uC6B8",
    "\uC2A4\uCE74\uD2B8",
    "\uD3EC\uC2A4\uD2B8",
  ]),
  expression: buildItems("expression", [
    "\uBB34\uD45C\uC815",
    "\uBBF8\uC18C",
    "\uC7A0\uC624\uB984",
    "\uD765\uBBF8",
    "\uC6B8\uC0C1",
    "\uD65C\uC131",
    "\uC9D1\uC911",
    "\uAE30\uBD84\uC88B\uC74C",
    "\uC2DC\uBB34\uB77C",
    "\uC0AC\uB791",
    "\uC9C4\uC9DC",
    "\uACE0\uBBFC",
  ]),
  background: buildItems("background", [
    "\uD558\uB298",
    "\uB178\uC744",
    "\uBC14\uB2E4",
    "\uB208",
    "\uACF5\uC6D0",
    "\uBC24",
    "\uACC4\uC808",
    "\uC11C\uC6B8",
    "\uAC1C\uB098\uB9AC",
    "\uB9E5\uC8FC",
    "\uBE48\uACB0",
    "\uC720\uB828",
  ]),
  item: buildItems("item", [
    "\uBAA8\uC790",
    "\uAC00\uBC29",
    "\uC548\uACBD",
    "\uD1A0\uC5C5",
    "\uC18C\uAC1C",
    "\uD734\uB300\uD3F0",
    "\uC13C\uC11C",
    "\uC2A4\uD0C0\uC77C",
    "\uAD6C\uB3C5",
    "\uD0A4\uCCB4\uC778",
    "\uBC8C\uC13C",
    "\uC120\uBB3C",
  ]),
  skinTone: SKIN_TONE_PRESETS.map((tone, index) => ({
    id: tone.id ?? `skin-tone-${index + 1}`,
    label: tone.label ?? `\uD1A4 ${index + 1}`,
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
