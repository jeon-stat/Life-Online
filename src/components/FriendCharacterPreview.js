import { StyleSheet, Text, View } from "react-native";

export function FriendCharacterPreview({ friend, size = 88 }) {
  const wrapperHeight = Math.round(size * 1.18);
  const initial = String(friend?.nickname ?? friend?.handle ?? "F").trim().slice(0, 1).toUpperCase();

  return (
    <View style={[styles.shell, { width: size, height: wrapperHeight }]}>
      <View style={styles.frame}>
        <View style={styles.avatarMark}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.label}>Preview</Text>
        <Text style={styles.subLabel}>MOCK</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
  },
  frame: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ecece9",
    paddingHorizontal: 8,
  },
  avatarMark: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f5",
    borderWidth: 1,
    borderColor: "#dededb",
  },
  avatarInitial: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "900",
  },
  label: {
    marginTop: 8,
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
  },
  subLabel: {
    marginTop: 2,
    color: "#888888",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
