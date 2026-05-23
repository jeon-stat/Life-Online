import { Pressable, StyleSheet, Text, View } from "react-native";

export function ClassTabs({ characters, selectedId, onSelect }) {
  return (
    <View style={styles.row}>
      {characters.map((character) => {
        const selected = character.id === selectedId;

        return (
          <Pressable
            key={character.id}
            onPress={() => onSelect(character.id)}
            style={[
              styles.button,
              selected && { backgroundColor: character.palette.primary, borderColor: "transparent" },
            ]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{character.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dce5f0",
    backgroundColor: "rgba(255,255,255,0.84)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#27364d",
    fontSize: 15,
    fontWeight: "800",
  },
  textSelected: {
    color: "#ffffff",
  },
});
