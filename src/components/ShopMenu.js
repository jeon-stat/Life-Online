import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

const SHOP_SECTIONS = [
  { title: "의상", note: "준비 중" },
  { title: "표정", note: "준비 중" },
  { title: "배경", note: "준비 중" },
  { title: "아이템", note: "준비 중" },
];

export function ShopMenu({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => null}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>상점</Text>
              <Text style={styles.headerSubtitle}>캐릭터를 꾸미는 공간</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonLabel}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionCardTitle}>꾸미기 아이템</Text>
              <Text style={styles.sectionCardNote}>아직 준비 중이에요.</Text>
            </View>

            <View style={styles.grid}>
              {SHOP_SECTIONS.map((section) => (
                <View key={section.title} style={styles.tile}>
                  <Text style={styles.tileTitle}>{section.title}</Text>
                  <Text style={styles.tileNote}>{section.note}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.28)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "84%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 8,
  },
  handleBar: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: 12,
  },
  headerTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  headerSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeButtonLabel: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: 12,
  },
  sectionCard: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  sectionCardTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  sectionCardNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tile: {
    width: "48.5%",
    minHeight: 92,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "space-between",
  },
  tileTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  tileNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
