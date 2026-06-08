import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHARACTER_CLASSES, SKIN_TONE_PRESETS } from "../characters.js";
import { CharacterStage } from "../components/CharacterStage";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";

const CHARACTER_CATEGORIES = [
  {
    id: "top",
    label: "상의",
    previewMode: "character",
    accent: "#d89a4a",
  },
  {
    id: "bottom",
    label: "하의",
    previewMode: "character",
    accent: "#8fbe70",
  },
  {
    id: "expression",
    label: "표정",
    previewMode: "face",
    accent: "#111111",
  },
  {
    id: "background",
    label: "배경",
    previewMode: "background",
    accent: "#7bb3e5",
  },
  {
    id: "item",
    label: "아이템",
    previewMode: "character",
    accent: "#7d87ff",
  },
  {
    id: "skinTone",
    label: "피부톤",
    previewMode: "character",
    accent: "#d6b09b",
  },
];

const OWNED_ITEMS = {
  top: [
    { id: "top-1", label: "티셔츠" },
    { id: "top-2", label: "셔츠" },
    { id: "top-3", label: "니트" },
    { id: "top-4", label: "후드" },
    { id: "top-5", label: "재킷" },
    { id: "top-6", label: "코트" },
  ],
  bottom: [
    { id: "bottom-1", label: "바지" },
    { id: "bottom-2", label: "청바지" },
    { id: "bottom-3", label: "조거" },
    { id: "bottom-4", label: "슬랙스" },
    { id: "bottom-5", label: "반바지" },
    { id: "bottom-6", label: "치마" },
  ],
  expression: [
    { id: "expression-1", label: "무표정" },
    { id: "expression-2", label: "웃음" },
    { id: "expression-3", label: "졸림" },
    { id: "expression-4", label: "장난" },
    { id: "expression-5", label: "반짝" },
    { id: "expression-6", label: "놀람" },
  ],
  background: [
    { id: "background-1", label: "하늘" },
    { id: "background-2", label: "저녁" },
    { id: "background-3", label: "밤" },
    { id: "background-4", label: "구름" },
    { id: "background-5", label: "숲" },
    { id: "background-6", label: "바다" },
  ],
  item: [
    { id: "item-1", label: "모자" },
    { id: "item-2", label: "가방" },
    { id: "item-3", label: "선글라스" },
    { id: "item-4", label: "리본" },
    { id: "item-5", label: "핀" },
    { id: "item-6", label: "키링" },
  ],
  skinTone: SKIN_TONE_PRESETS.map((tone, index) => ({
    id: tone.id ?? `skin-${index + 1}`,
    label: tone.label ?? `톤 ${index + 1}`,
    color: tone.color,
  })),
};

const INITIAL_SELECTIONS = {
  top: OWNED_ITEMS.top[0]?.id ?? null,
  bottom: OWNED_ITEMS.bottom[0]?.id ?? null,
  expression: OWNED_ITEMS.expression[0]?.id ?? null,
  background: OWNED_ITEMS.background[0]?.id ?? null,
  item: OWNED_ITEMS.item[0]?.id ?? null,
  skinTone: OWNED_ITEMS.skinTone[0]?.id ?? null,
};

export function CharacterScreen() {
  const { today, history, goal, admin } = useStepData();
  const [selectedCategoryId, setSelectedCategoryId] = useState("top");
  const [selectedItems, setSelectedItems] = useState(INITIAL_SELECTIONS);

  const previewCharacter = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    const selectedSkinTone = OWNED_ITEMS.skinTone.find((tone) => tone.id === selectedItems.skinTone);

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
  }, [selectedItems.skinTone]);

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin }),
    [admin, goal, history, today],
  );

  const selectedCategory = CHARACTER_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? CHARACTER_CATEGORIES[0];
  const ownedItems = OWNED_ITEMS[selectedCategory.id] ?? [];
  const currentSelection = ownedItems.find((item) => item.id === selectedItems[selectedCategory.id]) ?? ownedItems[0] ?? null;

  const previewMode = selectedCategory.previewMode;

  const handleSelectItem = (itemId) => {
    setSelectedItems((current) => ({
      ...current,
      [selectedCategory.id]: itemId,
    }));

    if (selectedCategory.id === "skinTone") {
      admin?.setSkinTone?.(itemId);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>캐릭터</Text>
      </View>

      <View style={styles.previewPanel}>
        {previewMode === "background" ? (
          <BackgroundScene />
        ) : (
          <CharacterStage
            character={previewCharacter}
            state={characterViewState}
            presentation="full"
            scale={0.9}
            characterScale={previewMode === "face" ? 0.98 : 0.78}
            cameraPosition={previewMode === "face" ? [0, 2.16, 4.8] : null}
            fov={previewMode === "face" ? 18 : null}
            showMiniWorld={previewMode !== "face"}
            interactionEnabled={true}
          />
        )}

        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeLabel}>{selectedCategory.label}</Text>
          {currentSelection ? <Text style={styles.previewBadgeValue}>{currentSelection.label}</Text> : null}
        </View>
      </View>

      <View style={styles.categoryCard}>
        <View style={styles.categoryRow}>
          {CHARACTER_CATEGORIES.map((category) => {
            const active = category.id === selectedCategoryId;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategoryId(category.id)}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipLabel, active && styles.categoryChipLabelActive]}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{selectedCategory.label}</Text>
          <Text style={styles.itemMeta}>{previewMode === "background" ? "배경만 보기" : "선택 가능"}</Text>
        </View>

        <View style={styles.itemGrid}>
          {ownedItems.map((item) => {
            const selected = selectedItems[selectedCategory.id] === item.id;
            const chipStyle =
              selectedCategory.id === "skinTone"
                ? { backgroundColor: item.color, borderColor: selected ? theme.colors.ink : theme.colors.border }
                : null;

            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelectItem(item.id)}
                style={[styles.itemTile, selected && styles.itemTileSelected, chipStyle]}
              >
                {selectedCategory.id === "skinTone" ? null : (
                  <View style={[styles.itemDot, { backgroundColor: selectedCategory.accent }]} />
                )}
                <Text style={styles.itemLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function BackgroundScene() {
  return (
    <View style={styles.backgroundScene}>
      <View style={styles.bgSun} />
      <View style={styles.bgCloudLeft} />
      <View style={styles.bgCloudRight} />
      <View style={styles.bgHillLeft} />
      <View style={styles.bgHillRight} />
      <View style={styles.bgPath} />
    </View>
  );
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
  previewPanel: {
    minHeight: 300,
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: -theme.spacing.md,
    marginTop: -6,
    marginBottom: -4,
    backgroundColor: "#ffffff",
  },
  backgroundScene: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#edf6e6",
  },
  bgSun: {
    position: "absolute",
    top: 28,
    right: 26,
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "#ffc85e",
  },
  bgCloudLeft: {
    position: "absolute",
    top: 56,
    left: 66,
    width: 54,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.84)",
  },
  bgCloudRight: {
    position: "absolute",
    top: 86,
    right: 76,
    width: 56,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  bgHillLeft: {
    position: "absolute",
    bottom: -44,
    left: -54,
    width: "84%",
    height: 196,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: "#99c06c",
    transform: [{ rotate: "-5deg" }],
  },
  bgHillRight: {
    position: "absolute",
    bottom: -34,
    right: -48,
    width: "70%",
    height: 196,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: "#d19c42",
    transform: [{ rotate: "7deg" }],
  },
  bgPath: {
    position: "absolute",
    bottom: -4,
    left: "17%",
    width: "66%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  previewBadge: {
    position: "absolute",
    left: 16,
    bottom: 16,
    minWidth: 116,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  previewBadgeLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  previewBadgeValue: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  categoryCard: {
    borderRadius: theme.radius.xl,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  categoryChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  categoryChipLabelActive: {
    color: "#ffffff",
  },
  itemCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  itemMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  itemTile: {
    flexBasis: "32.2%",
    maxWidth: "32.2%",
    minHeight: 84,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  itemTileSelected: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.surface,
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  itemLabel: {
    color: theme.colors.ink,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
});
