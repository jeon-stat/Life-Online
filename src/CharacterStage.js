import { StyleSheet, Text, View } from "react-native";

export function CharacterStage({ character }) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>{character.label}</Text>
      <Text style={styles.copy}>3D preview is available in the web build.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#243042",
    fontSize: 24,
    fontWeight: "800",
  },
  copy: {
    marginTop: 10,
    color: "#627182",
    fontSize: 15,
  },
});
