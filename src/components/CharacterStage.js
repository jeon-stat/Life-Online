import { StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function CharacterStage({ character }) {
  return (
    <View style={styles.shell}>
      <View style={styles.placeholder}>
        <Text style={styles.name}>{character.label}</Text>
        <Text style={styles.copy}>3D 미리보기는 웹에서 확인할 수 있어요.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    height: 340,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
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
