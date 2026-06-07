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
    note: "옷으로 분위기를 바꿔요.",
    accent: "#d89a4a",
    accentSoft: "#f7eadc",
  },
  {
    id: "expression",
    label: "표정",
    note: "표정으로 반응을 더해요.",
    accent: "#111111",
    accentSoft: "#f4f4f2",
  },
  {
    id: "background",
    label: "배경",
    note: "배경 분위기를 바꿔요.",
    accent: "#8fbe70",
    accentSoft: "#edf5e8",
  },
  {
    id: "item",
    label: "아이템",
    note: "작은 소품을 모아요.",
    accent: "#7d87ff",
    accentSoft: "#eef0ff",
  },
];

const SHOP_ITEMS = {
  clothes: buildItems("의상", ["베이직", "데일리", "포근", "라운지", "포인트", "데님", "스트라이프", "윈드", "클래식", "라이트"]),
  expression: buildItems("표정", ["무표정", "웃음", "졸림", "반짝", "당황", "포근", "뿌듯", "신남", "차분", "하트"]),
  background: buildItems("배경", ["하늘", "노을", "숲", "별빛", "비", "바람", "구름", "잔디", "밤", "벽"]),
  item: buildItems("아이템", ["모자", "가방", "신발", "안경", "리본", "목도리", "장갑", "배지", "열쇠", "꽃"]),
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

      <View style={styles.introCard}>
        <Text style={styles.introTitle}>캐릭터 꾸미기 공간</Text>
        <Text style={styles.introNote}>카테고리를 누르면 아래 아이템만 볼 수 있어요.</Text>
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

      <View style={styles.previewRow}>
        <View style={styles.previewCard}>
          <SectionHeader title="캐릭터" />
          <View style={styles.characterPreviewWrap}>
            <CharacterStage
              character={previewCharacter}
              state={characterViewState}
              presentation="thumbnail"
            />
          </View>
        </View>

        <View style={styles.previewCard}>
          <SectionHeader title="배경" />
          <View style={[styles.backgroundPreview, { backgroundColor: selectedCategory.accentSoft }]}>
            <View style={[styles.backgroundSun, { backgroundColor: selectedCategory.accent }]} />
            <View style={styles.backgroundCloudOne} />
            <View style={styles.backgroundCloudTwo} />
            <Text style={styles.backgroundLabel}>{selectedCategory.label}</Text>
            <Text style={styles.backgroundNote}>{selectedCategory.note}</Text>
          </View>
        </View>
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
              <Text style={styles.itemNote} numberOfLines={1}>
                {item.note}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
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
  introCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  introTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  introNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
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
  previewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  previewCard: {
    flex: 1,
    minWidth: "48%",
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  characterPreviewWrap: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
  },
  backgroundPreview: {
    minHeight: 172,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  backgroundSun: {
    position: "absolute",
    top: 20,
    right: 24,
    width: 18,
    height: 18,
    borderRadius: 999,
    opacity: 0.95,
  },
  backgroundCloudOne: {
    position: "absolute",
    top: 48,
    left: 22,
    width: 54,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  backgroundCloudTwo: {
    position: "absolute",
    bottom: 46,
    left: 34,
    width: 72,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  backgroundLabel: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  backgroundNote: {
    marginTop: 6,
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
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
    gap: 6,
  },
  itemCard: {
    flexBasis: "18.4%",
    maxWidth: "18.4%",
    aspectRatio: 0.9,
    minHeight: 74,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  itemTitle: {
    color: theme.colors.ink,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  itemNote: {
    color: theme.colors.inkSoft,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
});
