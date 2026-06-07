import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useStepData } from "../data/stepDataProvider.js";
import { theme } from "../constants/theme.js";

const CUSTOMIZATION_SLOTS = [
  { key: "hair", label: "헤어" },
  { key: "clothes", label: "의상" },
  { key: "expression", label: "표정" },
  { key: "background", label: "배경" },
];

export function CharacterScreen() {
  const { admin } = useStepData();
  const skinTones = admin?.skinTones ?? [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>캐릭터</Text>
      </View>

      <View style={styles.card}>
        <SectionHeader title="피부톤" />
        <View style={styles.skinToneGrid}>
          {skinTones.map((tone) => {
            const selected = admin?.skinToneId === tone.id;

            return (
              <Pressable
                key={tone.id}
                onPress={() => admin?.setSkinTone?.(tone.id)}
                style={[styles.skinToneChip, selected && styles.skinToneChipSelected]}
              >
                <View style={[styles.skinToneSwatch, { backgroundColor: tone.color }]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.slotList}>
        {CUSTOMIZATION_SLOTS.map((slot) => (
          <View key={slot.key} style={styles.card}>
            <SectionHeader title={slot.label} />
            <View style={styles.slotBody}>
              <Text style={styles.placeholderNote}>준비 중</Text>
            </View>
          </View>
        ))}
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
  card: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  slotList: {
    gap: theme.spacing.md,
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
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skinToneChip: {
    width: 42,
    height: 42,
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
    width: 28,
    height: 28,
    borderRadius: 999,
  },
  slotBody: {
    minHeight: 56,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
  },
  placeholderNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
