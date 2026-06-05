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
      <Text style={styles.title}>상점</Text>
      <Text style={styles.subtitle}>캐릭터 꾸미기 공간</Text>

      <View style={styles.grid}>
        {SHOP_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardNote}>{section.note}</Text>
          </View>
        ))}
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
    gap: 16,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: theme.fonts.display,
  },
  subtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: theme.fonts.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: "48.5%",
    minHeight: 104,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  cardNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
