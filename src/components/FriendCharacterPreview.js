import { StyleSheet, Text, View } from "react-native";

export function FriendCharacterPreview({ size = 88 }) {
  const wrapperHeight = Math.round(size * (size > 100 ? 1 : 1.18));

  return (
    <View style={[styles.shell, { width: size, height: wrapperHeight }]}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderIcon}>🌍</Text>
        <Text style={styles.placeholderText}>3D</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#eef8ee",
    borderWidth: 1,
    borderColor: "#dce8d8",
  },
  placeholderIcon: {
    fontSize: 20,
  },
  placeholderText: {
    marginTop: 2,
    color: "#4f7a57",
    fontSize: 10,
    fontWeight: "900",
  },
});
