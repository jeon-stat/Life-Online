import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHARACTER_CLASSES, SKIN_TONE_PRESETS } from "../characters.js";
import { CharacterStage } from "../components/CharacterStage";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";

const PAGE_SIZE = 9;

const CHARACTER_CATEGORIES = [
  { id: "top", label: "상의", mode: "character", accent: "#d89a4a" },
  { id: "bottom", label: "하의", mode: "character", accent: "#8fbe70" },
  { id: "expression", label: "표정", mode: "face", accent: "#111111" },
  { id: "background", label: "배경", mode: "background", accent: "#7bb3e5" },
  { id: "item", label: "아이템", mode: "character", accent: "#7d87ff" },
  { id: "skinTone", label: "피부톤", mode: "character", accent: "#d6b09b" },
];

const OWNED_ITEMS = {
  top: buildOwnedItems("상의", ["티셔츠", "셔츠", "니트", "후드", "재킷", "코트", "원피스", "블라우스", "스웨터", "조끼", "맨투맨", "가디건"]),
  bottom: buildOwnedItems("하의", ["바지", "청바지", "조거", "슬랙스", "반바지", "치마", "레깅스", "숏팬츠", "와이드", "스커트", "슬림", "트레이닝"]),
  expression: buildOwnedItems("표정", ["무표정", "웃음", "졸림", "장난", "반짝", "놀람", "수줍", "뿌듯", "화남", "하트", "멍함", "윙크"]),
  background: buildOwnedItems("배경", ["하늘", "저녁", "밤", "구름", "숲", "바다", "봄", "눈", "비", "별", "노을", "새벽"]),
  item: buildOwnedItems("아이템", ["모자", "가방", "선글라스", "리본", "핀", "키링", "배지", "꽃", "반지", "스티커", "목걸이", "양말"]),
  skinTone: SKIN_TONE_PRESETS.map((tone, index) => ({
    id: tone.id ?? `skin-${index + 1}`,
    label: tone.label ?? `톤 ${index + 1}`,
    color: tone.color,
  })),
};

const DEFAULT_SELECTIONS = {
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
  const [selectedItems, setSelectedItems] = useState(() => ({
    ...DEFAULT_SELECTIONS,
    skinTone: admin?.skinToneId ?? DEFAULT_SELECTIONS.skinTone,
  }));
  const [pageByCategory, setPageByCategory] = useState({});

  useEffect(() => {
    if (!admin?.skinToneId) return;
    setSelectedItems((current) =>
      current.skinTone === admin.skinToneId ? current : { ...current, skinTone: admin.skinToneId },
    );
  }, [admin?.skinToneId]);

  const selectedCategory =
    CHARACTER_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? CHARACTER_CATEGORIES[0];
  const selectedCategoryItems = OWNED_ITEMS[selectedCategoryId] ?? [];

  const activeSkinTone = useMemo(
    () =>
      OWNED_ITEMS.skinTone.find((tone) => tone.id === selectedItems.skinTone) ??
      OWNED_ITEMS.skinTone[0] ??
      null,
    [selectedItems.skinTone],
  );

  const previewCharacter = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    if (!activeSkinTone) return baseCharacter;

    return {
      ...baseCharacter,
      palette: {
        ...baseCharacter.palette,
        skin: activeSkinTone.color,
      },
      skinTone: activeSkinTone.color,
    };
  }, [activeSkinTone]);

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin }),
    [admin, goal, history, today],
  );

  const previewMode = selectedCategory.mode;
  const currentSelection =
    selectedCategoryId === "skinTone"
      ? activeSkinTone
      : selectedCategoryItems.find((item) => item.id === selectedItems[selectedCategoryId]) ?? selectedCategoryItems[0];

  const totalPages = Math.max(1, Math.ceil(selectedCategoryItems.length / PAGE_SIZE));
  const currentPage = Math.min(pageByCategory[selectedCategoryId] ?? 0, totalPages - 1);
  const visibleItems =
    selectedCategoryId === "skinTone"
      ? selectedCategoryItems
      : selectedCategoryItems.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const handleSelectItem = (item) => {
    setSelectedItems((current) => ({ ...current, [selectedCategoryId]: item.id }));

    if (selectedCategoryId === "skinTone") {
      admin?.setSkinTone?.(item.id);
    }
  };

  const setPage = (nextPage) => {
    setPageByCategory((current) => ({
      ...current,
      [selectedCategoryId]: nextPage,
    }));
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
            scale={0.88}
            characterScale={previewMode === "face" ? 0.96 : 0.78}
            cameraPosition={previewMode === "face" ? [0, 2.16, 4.8] : null}
            fov={previewMode === "face" ? 18 : null}
            showMiniWorld={previewMode !== "face"}
            interactionEnabled={false}
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
          <Text style={styles.itemMeta}>
            {selectedCategoryId === "background" ? "배경만 보기" : selectedCategoryId === "skinTone" ? "원형 10개" : "9개씩 보기"}
          </Text>
        </View>

        {selectedCategoryId === "skinTone" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skinToneRow}>
            {visibleItems.map((item) => {
              const selected = selectedItems.skinTone === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectItem(item)}
                  style={[styles.skinToneChip, selected && styles.skinToneChipSelected]}
                >
                  <View style={[styles.skinToneSwatch, { backgroundColor: item.color }]} />
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <>
            <View style={styles.itemGrid}>
              {visibleItems.map((item) => {
                const selected = selectedItems[selectedCategoryId] === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleSelectItem(item)}
                    style={[styles.itemTile, selected && styles.itemTileSelected]}
                  >
                    <View style={[styles.itemDot, { backgroundColor: selectedCategory.accent }]} />
                    <Text style={styles.itemLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {totalPages > 1 ? (
              <View style={styles.paginationRow}>
                {Array.from({ length: totalPages }, (_, index) => (
                  <Pressable
                    key={`${selectedCategoryId}-page-${index + 1}`}
                    onPress={() => setPage(index)}
                    style={[styles.pageChip, currentPage === index && styles.pageChipActive]}
                  >
                    <Text style={[styles.pageChipLabel, currentPage === index && styles.pageChipLabelActive]}>
                      {index + 1}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        )}
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

function buildOwnedItems(prefix, labels) {
  return labels.map((label, index) => ({
    id: `${prefix}-${index + 1}`,
    label,
  }));
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
    gap: 12,
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
  skinToneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  skinToneChip: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  skinToneChipSelected: {
    borderColor: theme.colors.ink,
    borderWidth: 2,
  },
  skinToneSwatch: {
    width: 22,
    height: 22,
    borderRadius: 999,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingTop: 2,
  },
  pageChip: {
    minWidth: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  pageChipActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  pageChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  pageChipLabelActive: {
    color: "#ffffff",
  },
});
