import { ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

const SHOP_SECTIONS = [
  { title: "의상", note: "준비 중" },
  { title: "표정", note: "준비 중" },
  { title: "배경", note: "준비 중" },
  { title: "아이템", note: "준비 중" },
];

export function ShopScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>상점</Text>
      </View>

      <View style={styles.introCard}>
        <Text style={styles.introTitle}>캐릭터 꾸미기 공간</Text>
        <Text style={styles.introNote}>준비 중인 항목을 한눈에 볼 수 있어요.</Text>
      </View>

      <View style={styles.sectionList}>
        {SHOP_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <SectionHeader title={section.title} />
            <View style={styles.slotBody}>
              <Text style={styles.cardNote}>{section.note}</Text>
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
  sectionList: {
    gap: theme.spacing.md,
  },
  card: {
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
  cardNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
