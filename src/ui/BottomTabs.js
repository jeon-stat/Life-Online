import { Pressable, StyleSheet, Text, View } from "react-native";

export function BottomTabs({ items, activeId, onChange }) {
  return (
    <View style={styles.shell}>
      <View style={styles.row}>
        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Text style={[styles.emoji, active && styles.emojiActive]}>{item.icon}</Text>
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    backgroundColor: "rgba(255,255,255,0.98)",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  item: {
    flex: 1,
    minHeight: 60,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e9e9e7",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  itemActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  emoji: {
    fontSize: 16,
    color: "#686868",
  },
  emojiActive: {
    transform: [{ translateY: -1 }],
    color: "#ffffff",
  },
  label: {
    color: "#545454",
    fontSize: 11,
    fontWeight: "900",
  },
  labelActive: {
    color: "#ffffff",
  },
});
