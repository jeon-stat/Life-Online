import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

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
              <Text style={[styles.icon, active && styles.iconActive]}>{item.icon}</Text>
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
    borderTopColor: theme.colors.border,
    backgroundColor: "rgba(248,247,244,0.96)",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  item: {
    flex: 1,
    minHeight: 50,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  itemActive: {
    backgroundColor: theme.colors.ink,
    borderColor: theme.colors.ink,
  },
  icon: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.colors.muted,
  },
  iconActive: {
    color: "#ffffff",
  },
  label: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.colors.inkSoft,
  },
  labelActive: {
    color: "#ffffff",
  },
});
