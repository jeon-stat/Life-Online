import { Pressable, StyleSheet, Text, View } from "react-native";

export function ActionGrid({ actions, onAction }) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => onAction(action)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.text}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    flexBasis: "18%",
    minWidth: 64,
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#27364d",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  text: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },
});
