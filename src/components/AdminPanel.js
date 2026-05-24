import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function AdminPanel({ admin }) {
  if (!admin?.visible || !admin?.canOverride) {
    return null;
  }

  return (
    <View style={styles.shell}>
      <Text style={styles.title}>{"\uAC1C\uBC1C\uC790 \uC804\uC6A9 Admin Panel"}</Text>
      <Text style={styles.caption}>
        {
          "\uC774 \uD328\uB110\uC740 mock \uAC78\uC74C \uB370\uC774\uD130\uC5D0\uC11C\uB9CC \uC791\uB3D9\uD558\uACE0, \uC2E4\uC81C \uD5EC\uC2A4 \uC5F0\uB3D9 \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uC4F8 \uC218 \uC5C6\uC5B4\uC694."
        }
      </Text>
      <Text style={styles.source}>{`source: ${admin.source}`}</Text>

      <View style={styles.row}>
        {admin.presets.map((preset) => (
          <Pressable key={preset.id} onPress={() => admin.setPreset(preset)} style={styles.button}>
            <Text style={styles.buttonLabel}>{preset.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={admin.resetMock} style={styles.resetButton}>
        <Text style={styles.resetLabel}>{"\uAE30\uBCF8 mock \uD750\uB984\uC73C\uB85C \uB3CC\uB9AC\uAE30"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: "#fff4ef",
    borderWidth: 1,
    borderColor: "#f0d6c3",
  },
  title: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  caption: {
    marginTop: 8,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  source: {
    marginTop: 10,
    color: "#b45c3a",
    fontSize: 12,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  button: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efcbb1",
  },
  buttonLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  resetButton: {
    marginTop: 12,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fce7d8",
  },
  resetLabel: {
    color: "#9f4e33",
    fontSize: 12,
    fontWeight: "900",
  },
});
