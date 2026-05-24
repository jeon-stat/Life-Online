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
    borderTopColor: "rgba(214, 207, 197, 0.8)",
    backgroundColor: "rgba(248,247,244,0.96)",
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e3ddd4",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  itemActive: {
    backgroundColor: "#253247",
    borderColor: "#253247",
  },
  emoji: {
    fontSize: 16,
    color: "#68778c",
  },
  emojiActive: {
    transform: [{ translateY: -1 }],
    color: "#ffffff",
  },
  label: {
    color: "#68778c",
    fontSize: 11,
    fontWeight: "900",
  },
  labelActive: {
    color: "#ffffff",
  },
});
