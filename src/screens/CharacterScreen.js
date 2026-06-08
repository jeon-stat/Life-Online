import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHARACTER_CLASSES } from "../characters.js";
import { CharacterStage } from "../components/CharacterStage";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { CUSTOMIZATION_CATEGORIES, CUSTOMIZATION_ITEMS } from "../data/customizationCatalog.js";
import { buildCharacterViewModel } from "../game/characterState.js";

const PAGE_SIZE = 9;

export function CharacterScreen() {
  const { today, history, goal, shop } = useStepData();
  const [selectedCategoryId, setSelectedCategoryId] = useState("top");
  const [pageByCategory, setPageByCategory] = useState({});

  const selectedCategory =
    CUSTOMIZATION_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? CUSTOMIZATION_CATEGORIES[0];

  const activeSkinTone =
    CUSTOMIZATION_ITEMS.skinTone.find((tone) => tone.id === shop.skinToneId) ?? CUSTOMIZATION_ITEMS.skinTone[0] ?? null;

  const previewCharacter = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];

    if (!activeSkinTone) {
      return baseCharacter;
    }

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
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin: null }),
    [goal, history, today],
  );

  const allCategoryItems = CUSTOMIZATION_ITEMS[selectedCategoryId] ?? [];
  const ownedIds = shop.ownedItemIdsByCategory[selectedCategoryId] ?? [];
  const ownedCategoryItems =
    selectedCategoryId === "skinTone" ? allCategoryItems : allCategoryItems.filter((item) => ownedIds.includes(item.id));
  const selectedItemId = shop.selectedItemIdsByCategory[selectedCategoryId] ?? null;

  const currentSelection =
    ownedCategoryItems.find((item) => item.id === selectedItemId) ?? ownedCategoryItems[0] ?? null;

  const totalPages = Math.max(1, Math.ceil(ownedCategoryItems.length / PAGE_SIZE));
  const currentPage = Math.min(pageByCategory[selectedCategoryId] ?? 0, totalPages - 1);
  const visibleItems =
    selectedCategoryId === "skinTone"
      ? ownedCategoryItems
      : ownedCategoryItems.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const handleSelectItem = (item) => {
    shop.selectItem?.(selectedCategoryId, item.id);
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
        <Text style={styles.pageTitle}>꾸미기</Text>
      </View>

      <View style={styles.previewPanel}>
        <CharacterStage
          character={previewCharacter}
          state={characterViewState}
          presentation="full"
          scale={0.86}
          interactionEnabled={true}
          showGlowBack={false}
        />

        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeLabel}>{selectedCategory.label}</Text>
          {currentSelection ? <Text style={styles.previewBadgeValue}>{currentSelection.label}</Text> : null}
        </View>
      </View>

      <View style={styles.categoryCard}>
        <View style={styles.categoryRow}>
          {CUSTOMIZATION_CATEGORIES.map((category) => {
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
        </View>

        {selectedCategoryId === "skinTone" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skinToneRow}>
            {visibleItems.map((item) => {
              const selected = selectedItemId === item.id;
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
                const selected = selectedItemId === item.id;
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
    textAlign: "center",
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
    justifyContent: "space-between",
    rowGap: 8,
  },
  itemTile: {
    width: "31%",
    minHeight: 72,
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

