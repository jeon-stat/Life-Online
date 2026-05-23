import { StyleSheet, Text, View } from "react-native";

export function StatRow({ items }) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(220,229,240,0.95)",
    backgroundColor: "rgba(255,255,255,0.84)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  label: {
    color: "#7b8798",
    fontSize: 12,
    fontWeight: "900",
  },
  value: {
    color: "#243042",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },
});
