import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { CharacterStage } from "../components/CharacterStage";

const SHOP_CATEGORIES = [
  {
    id: "clothes",
    label: "의상",
    note: "옷을 바꿔요",
    accent: "#d89a4a",
    accentSoft: "#f7eadc",
  },
  {
    id: "expression",
    label: "표정",
    note: "표정을 바꿔요",
    accent: "#111111",
    accentSoft: "#f4f4f2",
  },
  {
    id: "background",
    label: "배경",
    note: "배경을 바꿔요",
    accent: "#8fbe70",
    accentSoft: "#edf5e8",
  },
  {
    id: "item",
    label: "아이템",
    note: "장식 아이템",
    accent: "#7d87ff",
    accentSoft: "#eef0ff",
  },
];

const SHOP_ITEMS = {
  clothes: buildItems("의상", ["재킷", "원피스", "티셔츠", "후드", "셔츠", "코트", "니트", "바지", "치마", "신발"]),
  expression: buildItems("표정", ["무표정", "웃음", "졸림", "반짝", "화남", "뿌듯", "수줍", "장난", "놀람", "하트"]),
  background: buildItems("배경", ["하늘", "저녁", "눈", "봄", "밤", "비", "구름", "숲", "바다", "별"]),
  item: buildItems("아이템", ["모자", "가방", "선글라스", "리본", "핀", "배지", "꽃", "반지", "스티커", "키링"]),
};

export function ShopScreen() {
  const { today, history, goal, admin } = useStepData();
  const [selectedCategoryId, setSelectedCategoryId] = useState(SHOP_CATEGORIES[0].id);

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

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin }),
    [admin, goal, history, today],
  );

  const selectedCategory = SHOP_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? SHOP_CATEGORIES[0];
  const selectedItems = SHOP_ITEMS[selectedCategory.id] ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>상점</Text>
      </View>

      <View style={styles.categoryCard}>
        <View style={styles.categoryRow}>
          {SHOP_CATEGORIES.map((category) => {
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

      <View style={styles.scenePanel}>
        <CharacterStage
          character={previewCharacter}
          state={characterViewState}
          presentation="full"
          scale={0.76}
          interactionEnabled={true}
        />
      </View>

      <View style={styles.itemsCard}>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>{selectedCategory.label}</Text>
          <Text style={styles.itemsMeta}>준비 중</Text>
        </View>
        <View style={styles.itemsGrid}>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemDot, { backgroundColor: selectedCategory.accent }]} />
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceCoin}>◍</Text>
                <Text style={styles.priceValue}>0원</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function buildItems(prefix, labels) {
  return labels.map((label, index) => ({
    id: `${prefix}-${index + 1}`,
    label,
    note: "준비 중",
  }));
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
  scenePanel: {
    minHeight: 320,
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: -theme.spacing.md,
    marginTop: -6,
    marginBottom: -6,
  },
  itemsCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemsTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  itemsMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },
  itemCard: {
    width: "31%",
    aspectRatio: 0.9,
    minHeight: 78,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  itemTitle: {
    color: theme.colors.ink,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 1,
  },
  priceCoin: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  priceValue: {
    color: theme.colors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
});
