import { StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function CharacterStage({ character, state }) {
  return (
    <View style={[styles.shell, { backgroundColor: state.stageColor }]}>
      <View style={styles.placeholder}>
        <Text style={styles.name}>{character.label}</Text>
        <Text style={styles.copy}>3D character view is available in the web build.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 340,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  name: {
    color: theme.colors.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  copy: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "700",
  },
});
