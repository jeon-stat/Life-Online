import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { CharacterStage } from "../components/CharacterStage";

const DEFAULT_SKIN_TONES = [
  { id: "tone-1", label: "톤 1", color: "#f3d8c6" },
  { id: "tone-2", label: "톤 2", color: "#f0c7ad" },
  { id: "tone-3", label: "톤 3", color: "#e1b28f" },
  { id: "tone-4", label: "톤 4", color: "#c88f64" },
  { id: "tone-5", label: "톤 5", color: "#a86d4b" },
  { id: "tone-6", label: "톤 6", color: "#8b553a" },
];

const SHOP_CATEGORIES = [
  {
    id: "top",
    label: "상의",
    note: "상의 꾸미기",
    previewMode: "character",
    accent: "#d89a4a",
    accentSoft: "#f7eadc",
  },
  {
    id: "bottom",
    label: "하의",
    note: "하의 꾸미기",
    previewMode: "character",
    accent: "#8fbe70",
    accentSoft: "#edf5e8",
  },
  {
    id: "expression",
    label: "표정",
    note: "얼굴을 바꿔요",
    previewMode: "face",
    accent: "#111111",
    accentSoft: "#f4f4f2",
  },
  {
    id: "background",
    label: "배경",
    note: "배경만 보여줘요",
    previewMode: "background",
    accent: "#7bb3e5",
    accentSoft: "#eef6fe",
  },
  {
    id: "item",
    label: "아이템",
    note: "장식 아이템",
    previewMode: "character",
    accent: "#7d87ff",
    accentSoft: "#eef0ff",
  },
  {
    id: "skinTone",
    label: "피부톤",
    note: "피부색을 바꿔요",
    previewMode: "character",
    accent: "#d6b09b",
    accentSoft: "#f8ede6",
  },
];

const SHOP_ITEMS = {
  top: buildItems("상의", ["티셔츠", "셔츠", "니트", "후드", "재킷", "코트", "원피스", "블라우스", "스웨터", "조끼"]),
  bottom: buildItems("하의", ["바지", "치마", "반바지", "청바지", "슬랙스", "조거", "레깅스", "스커트", "쇼츠", "팬츠"]),
  expression: buildItems("표정", ["무표정", "웃음", "졸림", "뿌듯", "놀람", "장난", "수줍", "반짝", "화남", "하트"]),
  background: buildItems("배경", ["하늘", "저녁", "밤", "비", "눈", "구름", "숲", "바다", "봄", "별"]),
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
  const selectedItems = useMemo(() => {
    if (selectedCategoryId === "skinTone") {
      return (admin?.skinTones?.length ? admin.skinTones : DEFAULT_SKIN_TONES).map((tone, index) => ({
        id: tone.id ?? `tone-${index + 1}`,
        label: tone.label ?? `톤 ${index + 1}`,
        note: "피부톤",
        accent: tone.color ?? DEFAULT_SKIN_TONES[index % DEFAULT_SKIN_TONES.length].color,
      }));
    }

    return SHOP_ITEMS[selectedCategoryId] ?? [];
  }, [admin?.skinTones, selectedCategoryId]);

  const previewMode = selectedCategory.previewMode;

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

      <View
        style={[
          styles.scenePanel,
          previewMode === "background" ? styles.scenePanelBackground : styles.scenePanelCharacter,
          { backgroundColor: previewMode === "background" ? selectedCategory.accentSoft : "#ffffff" },
        ]}
      >
        {previewMode === "background" ? (
          <BackgroundScene accent={selectedCategory.accent} accentSoft={selectedCategory.accentSoft} />
        ) : (
          <CharacterStage
            character={previewCharacter}
            state={characterViewState}
            presentation="full"
            scale={1}
            characterScale={previewMode === "face" ? 0.98 : 0.68}
            cameraPosition={previewMode === "face" ? [0, 2.18, 4.7] : null}
            fov={previewMode === "face" ? 18 : null}
            showMiniWorld={previewMode !== "face"}
            interactionEnabled={false}
          />
        )}
      </View>

      <View style={styles.itemsCard}>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>{selectedCategory.label}</Text>
          <Text style={styles.itemsMeta}>준비 중</Text>
        </View>
        <View style={styles.itemsGrid}>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={[styles.itemDot, { backgroundColor: item.accent ?? selectedCategory.accent }]} />
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

function BackgroundScene({ accent, accentSoft }) {
  return (
    <View style={[styles.backgroundScene, { backgroundColor: accentSoft }]}>
      <View style={[styles.bgOrb, { backgroundColor: accent }]} />
      <View style={styles.bgCloudOne} />
      <View style={styles.bgCloudTwo} />
      <View style={[styles.bgHillLeft, { backgroundColor: "#99c06c" }]} />
      <View style={[styles.bgHillRight, { backgroundColor: "#d19c42" }]} />
      <View style={[styles.bgHillBase, { backgroundColor: "#99c06c" }]} />
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
    minHeight: 420,
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: -theme.spacing.md,
    marginTop: -4,
    marginBottom: -2,
    justifyContent: "center",
    alignItems: "center",
  },
  scenePanelBackground: {
    paddingVertical: 0,
  },
  scenePanelCharacter: {
    paddingVertical: 0,
  },
  backgroundScene: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  bgOrb: {
    position: "absolute",
    top: 28,
    right: 28,
    width: 16,
    height: 16,
    borderRadius: 999,
    opacity: 0.92,
  },
  bgCloudOne: {
    position: "absolute",
    top: 58,
    left: 72,
    width: 60,
    height: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.84)",
  },
  bgCloudTwo: {
    position: "absolute",
    top: 88,
    right: 84,
    width: 52,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  bgHillLeft: {
    position: "absolute",
    bottom: -68,
    left: -42,
    width: "78%",
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transform: [{ rotate: "-7deg" }],
  },
  bgHillRight: {
    position: "absolute",
    bottom: -56,
    right: -54,
    width: "66%",
    height: 220,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transform: [{ rotate: "8deg" }],
    opacity: 0.96,
  },
  bgHillBase: {
    position: "absolute",
    bottom: -2,
    left: "16%",
    width: "68%",
    height: 10,
    borderRadius: 999,
    opacity: 0.22,
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
