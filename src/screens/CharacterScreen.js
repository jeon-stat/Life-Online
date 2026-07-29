import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CharacterStage } from "../components/CharacterStage";
import { CHARACTER_CLASSES } from "../characters.js";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";

const COLLECTION_SECTIONS = [
  { id: "action", title: "동작", selector: "selectAction", stateKey: "selectedActionId" },
  { id: "pet", title: "펫", selector: "selectPet", stateKey: "selectedPetId" },
  { id: "background", title: "배경", selector: "selectBackground", stateKey: "selectedBackgroundId" },
  { id: "expression", title: "표정", selector: "selectExpression", stateKey: "selectedExpressionId" },
  { id: "outfit", title: "의상", selector: "selectOutfit", stateKey: "selectedOutfitId" },
];

export function CharacterScreen() {
  const { growth, rewards, shop, characterViewState } = useStepData();

  const character = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    const selectedSkinTone =
      shop.items.skinTone.find((tone) => tone.id === shop.skinToneId) ??
      shop.items.skinTone[0] ??
      null;

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
  }, [shop.items.skinTone, shop.skinToneId]);

  const collections = {
    action: rewards.actionOptions,
    pet: rewards.petOptions,
    background: rewards.backgroundOptions,
    expression: rewards.expressionOptions,
    outfit: rewards.outfitOptions,
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>성장과 수집</Text>
      </View>

      <View style={styles.previewPanel}>
        <CharacterStage
          character={character}
          state={characterViewState}
          presentation="full"
          scale={0.86}
          interactionEnabled={true}
          showGlowBack={false}
        />

        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeTitle}>현재 세계</Text>
          <Text style={styles.previewBadgeText}>
            Lv.{growth.currentLevel} · 최고 Lv.{growth.highestLevelReached}
          </Text>
          <Text style={styles.previewBadgeText}>
            {characterViewState.currentAction?.label ?? "기본 자세"}
            {characterViewState.selectedPet?.label ? ` · ${characterViewState.selectedPet.label}` : ""}
          </Text>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>보상은 영구 보유</Text>
        <Text style={styles.noticeText}>
          현재 레벨이 내려가더라도 최고 레벨과 이미 잠금 해제한 보상은 유지돼요. 잠긴 항목은 앞으로 얻을 콘텐츠를 미리 보여 줍니다.
        </Text>
      </View>

      <View style={styles.roadmapCard}>
        <Text style={styles.sectionTitle}>Lv.1 ~ Lv.20 로드맵</Text>
        <View style={styles.roadmapList}>
          {rewards.roadmap.map((entry) => (
            <View
              key={`roadmap-${entry.level}`}
              style={[
                styles.roadmapRow,
                entry.current && styles.roadmapRowCurrent,
                entry.reached && styles.roadmapRowReached,
              ]}
            >
              <View style={styles.roadmapLevelWrap}>
                <Text style={styles.roadmapLevel}>Lv.{entry.level}</Text>
                <Text style={styles.roadmapState}>
                  {entry.current ? "현재" : entry.reached ? "달성" : entry.level === growth.currentLevel + 1 ? "다음" : "잠금"}
                </Text>
              </View>
              <View style={styles.roadmapRewards}>
                {entry.rewards.length ? (
                  entry.rewards.map((reward) => (
                    <Text key={reward.id} style={styles.roadmapRewardText}>
                      {reward.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.roadmapRewardText}>기본 세계 시작</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {COLLECTION_SECTIONS.map((section) => (
        <CollectionSection
          key={section.id}
          title={section.title}
          items={collections[section.id]}
          selectedId={growth[section.stateKey]}
          onSelect={growth[section.selector]}
        />
      ))}
    </ScrollView>
  );
}

function CollectionSection({ title, items = [], selectedId, onSelect }) {
  return (
    <View style={styles.collectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.collectionGrid}>
        {items.map((item) => {
          const selected = selectedId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => item.unlocked && onSelect?.(item.id)}
              style={[
                styles.collectionTile,
                selected && styles.collectionTileSelected,
                !item.unlocked && styles.collectionTileLocked,
              ]}
            >
              <Text style={styles.collectionTileTitle}>{item.label}</Text>
              <Text style={styles.collectionTilePreview}>{item.preview}</Text>
              <Text style={styles.collectionTileDescription}>{item.description}</Text>
              <Text style={styles.collectionTileState}>{item.unlocked ? (selected ? "선택됨" : "보유") : `Lv.${item.requiredLevel}`}</Text>
            </Pressable>
          );
        })}
      </View>
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
    paddingBottom: 112,
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
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewBadge: {
    position: "absolute",
    left: 16,
    bottom: 16,
    right: 16,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  previewBadgeTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  previewBadgeText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  noticeCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: "#fff9ef",
    borderWidth: 1,
    borderColor: "#f1dfb9",
    gap: 6,
  },
  noticeTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  noticeText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  roadmapCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  roadmapList: {
    gap: 8,
  },
  roadmapRow: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  roadmapRowReached: {
    borderColor: "#d9e8cf",
    backgroundColor: "#f6fbf2",
  },
  roadmapRowCurrent: {
    borderColor: "#111111",
  },
  roadmapLevelWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roadmapLevel: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  roadmapState: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  roadmapRewards: {
    gap: 4,
  },
  roadmapRewardText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  collectionCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  collectionGrid: {
    gap: 10,
  },
  collectionTile: {
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 5,
  },
  collectionTileSelected: {
    borderColor: "#111111",
    backgroundColor: "#ffffff",
  },
  collectionTileLocked: {
    opacity: 0.45,
  },
  collectionTileTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  collectionTilePreview: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  collectionTileDescription: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  collectionTileState: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
});
