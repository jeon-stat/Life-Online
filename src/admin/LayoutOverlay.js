import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../constants/theme.js";

export function LayoutOverlay({ editor }) {
  if (!editor?.enabled) {
    return null;
  }

  return (
    <View style={styles.shell}>
      <Text style={styles.title}>레이아웃 편집</Text>
      <Text style={styles.meta}>{`선택 요소: ${editor.selectedId ?? "없음"}`}</Text>

      <TextInput
        value={editor.token}
        onChangeText={editor.setToken}
        placeholder="GitHub Personal Access Token"
        placeholderTextColor={theme.colors.muted}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.row}>
        <Pressable onPress={editor.resetSelected} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>선택 리셋</Text>
        </Pressable>
        <Pressable onPress={editor.resetAll} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>전체 리셋</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={editor.saveToGitHub}
        disabled={editor.saveDisabled}
        style={[styles.saveButton, editor.saveDisabled && styles.saveButtonDisabled]}
      >
        <Text style={styles.saveLabel}>Save to GitHub</Text>
      </Pressable>

      {editor.status?.message ? <Text style={styles.status}>{editor.status.message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: "#f7f3ec",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  meta: {
    marginTop: 8,
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#ffffff",
  },
  secondaryLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  saveButton: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.ink,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ba4b2",
  },
  saveLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  status: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
});
