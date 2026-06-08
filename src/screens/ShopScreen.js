import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CHARACTER_CLASSES } from "../characters.js";
import { CharacterStage } from "../components/CharacterStage";
import { theme } from "../constants/theme.js";
import { useStepData } from "../data/stepDataProvider.js";
import { CUSTOMIZATION_CATEGORIES, CUSTOMIZATION_ITEMS } from "../data/customizationCatalog.js";
import { buildCharacterViewModel } from "../game/characterState.js";

const PAGE_SIZE = 9;

export function ShopScreen() {
  const { today, history, goal, shop } = useStepData();
  const [selectedCategoryId, setSelectedCategoryId] = useState(CUSTOMIZATION_CATEGORIES[0].id);
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);

  const selectedCategory =
    CUSTOMIZATION_CATEGORIES.find((category) => category.id === selectedCategoryId) ?? CUSTOMIZATION_CATEGORIES[0];

  const previewCharacter = useMemo(() => {
    const baseCharacter = CHARACTER_CLASSES[0];
    const selectedSkinTone = CUSTOMIZATION_ITEMS.skinTone.find((tone) => tone.id === shop.skinToneId) ?? null;

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
  }, [shop.skinToneId]);

  const characterViewState = useMemo(
    () => buildCharacterViewModel({ todayRecord: today, history, goal, admin: null }),
    [goal, history, today],
  );

  const selectedItemId = shop.selectedItemIdsByCategory[selectedCategoryId] ?? null;
  const ownedIds = shop.ownedItemIdsByCategory[selectedCategoryId] ?? [];
  const allItems = CUSTOMIZATION_ITEMS[selectedCategoryId] ?? [];
  const visibleItems = selectedCategoryId === "skinTone" ? allItems : allItems;

  const currentSelection = visibleItems.find((item) => item.id === selectedItemId) ?? visibleItems[0] ?? null;
  const currentPrice = purchaseRequest?.item?.price ?? 0;
  const currentCoin = shop.coinBalance ?? 0;
  const remainingCoin = Math.max(0, currentCoin - currentPrice);

  const handleSelectItem = (item) => {
    shop.selectItem?.(selectedCategoryId, item.id);
  };

  const handleBuyItem = (item) => {
    setPurchaseError(null);
    setPurchaseRequest({ categoryId: selectedCategoryId, item });
  };

  const confirmPurchase = () => {
    if (!purchaseRequest) return;

    const result = shop.purchaseItem?.(
      purchaseRequest.categoryId,
      purchaseRequest.item.id,
      purchaseRequest.item.price ?? 0,
    );

    if (result === "insufficient") {
      setPurchaseError("\uCF54\uC778\uC774 \uBD80\uC871\uD574\uC694.");
      return;
    }

    setPurchaseRequest(null);
    setPurchaseError(null);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>\uC0C1\uC810</Text>
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

      <View style={styles.itemsCard}>
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsTitle}>{selectedCategory.label}</Text>
          <Text style={styles.itemsMeta}>
            {selectedCategoryId === "skinTone" ? "\uD1A4 \uC120\uD0DD" : "\uC0C1\uD488 \uC120\uD0DD"}
          </Text>
        </View>

        {selectedCategoryId === "skinTone" ? (
          <View style={styles.skinToneGrid}>
            {visibleItems.map((item) => {
              const selected = selectedItemId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectItem(item)}
                  style={[styles.skinToneTile, selected && styles.skinToneTileSelected]}
                >
                  <View style={[styles.skinToneSwatch, { backgroundColor: item.color }]} />
                  <Text style={styles.skinToneLabel}>{item.label}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceCoin}>◍</Text>
                    <Text style={styles.priceValue}>{formatPrice(item.price)}</Text>
                  </View>
                  <Pressable onPress={() => handleBuyItem(item)} style={styles.buyButton}>
                    <Text style={styles.buyButtonLabel}>{ownedIds.includes(item.id) ? "\uC120\uD0DD" : "\uAD6C\uB9E4"}</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.itemsGrid}>
            {visibleItems.map((item) => {
              const selected = selectedItemId === item.id;
              const owned = ownedIds.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectItem(item)}
                  style={[styles.itemCard, selected && styles.itemCardSelected]}
                >
                  <View style={[styles.itemDot, { backgroundColor: selectedCategory.accent }]} />
                  <Text style={styles.itemLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <View style={styles.itemFooter}>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceCoin}>◍</Text>
                      <Text style={styles.priceValue}>{formatPrice(item.price)}</Text>
                    </View>
                    <Pressable onPress={() => handleBuyItem(item)} style={[styles.buyButton, owned && styles.buyButtonOwned]}>
                      <Text style={[styles.buyButtonLabel, owned && styles.buyButtonLabelOwned]}>
                        {owned ? "\uC120\uD0DD" : "\uAD6C\uB9E4"}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <Modal transparent visible={Boolean(purchaseRequest)} animationType="fade" onRequestClose={() => setPurchaseRequest(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPurchaseRequest(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>\uAD6C\uB9E4\uD560\uAE4C\uC694?</Text>
              <Pressable onPress={() => setPurchaseRequest(null)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseLabel}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.modalItemName}>{purchaseRequest?.item?.label ?? ""}</Text>

            <View style={styles.modalSummary}>
              <SummaryRow label="\uD604\uC7AC \uCF54\uC778" value={formatCoin(currentCoin)} />
              <SummaryRow label="\uAC00\uACA9" value={formatCoin(currentPrice)} />
              <SummaryRow label="\uB0A8\uC740 \uCF54\uC778" value={formatCoin(remainingCoin)} />
            </View>

            {purchaseError ? <Text style={styles.modalError}>{purchaseError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable onPress={() => setPurchaseRequest(null)} style={styles.modalButtonSecondary}>
                <Text style={styles.modalButtonSecondaryLabel}>\uCDE8\uC18C</Text>
              </Pressable>
              <Pressable onPress={confirmPurchase} style={styles.modalButtonPrimary}>
                <Text style={styles.modalButtonPrimaryLabel}>\uAD6C\uB9E4\uD558\uAE30</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function formatPrice(price = 0) {
  return `${Number(price ?? 0).toLocaleString("ko-KR")}\uC6D0`;
}

function formatCoin(amount = 0) {
  return `◍ ${Number(amount ?? 0).toLocaleString("ko-KR")}`;
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
    rowGap: 10,
  },
  itemCard: {
    width: "31%",
    minHeight: 116,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  itemCardSelected: {
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
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  itemFooter: {
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
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
  buyButton: {
    minWidth: 46,
    minHeight: 24,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  buyButtonOwned: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  buyButtonLabel: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  buyButtonLabelOwned: {
    color: theme.colors.ink,
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skinToneTile: {
    width: "31%",
    minHeight: 104,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  skinToneTileSelected: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.surface,
  },
  skinToneSwatch: {
    width: 28,
    height: 28,
    borderRadius: 999,
  },
  skinToneLabel: {
    color: theme.colors.ink,
    fontSize: 10,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    borderRadius: theme.radius.xl,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  modalTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCloseLabel: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 18,
  },
  modalItemName: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  modalSummary: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  summaryValue: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  modalError: {
    color: "#ba3b2d",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButtonSecondary: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonSecondaryLabel: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  modalButtonPrimary: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    backgroundColor: "#111111",
  },
  modalButtonPrimaryLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
});
