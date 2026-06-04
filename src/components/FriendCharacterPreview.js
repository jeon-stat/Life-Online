import { StyleSheet, View } from "react-native";

export function FriendCharacterPreview({ size = 112 }) {
  const safeSize = Number.isFinite(size) ? size : 112;
  const width = safeSize;
  const height = Math.round(safeSize * 1.08);

  return (
    <View style={[styles.shell, { width, height }]}>
      <View style={styles.sky} />
      <View style={styles.sun} />
      <View style={[styles.cloud, styles.cloudOne]} />
      <View style={[styles.cloud, styles.cloudTwo]} />
      <View style={styles.world} />
      <View style={styles.path} />
      <View style={styles.character} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fbfbf8",
  },
  sun: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f7d27c",
    opacity: 0.72,
  },
  cloud: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(17,17,17,0.05)",
    opacity: 0.88,
  },
  cloudOne: {
    top: 16,
    left: 12,
    width: 26,
    height: 12,
  },
  cloudTwo: {
    top: 30,
    right: 18,
    width: 30,
    height: 13,
  },
  world: {
    position: "absolute",
    left: "50%",
    bottom: -18,
    width: 140,
    height: 72,
    marginLeft: -70,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    backgroundColor: "#8fbe70",
  },
  path: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    width: 18,
    height: 86,
    marginLeft: -9,
    backgroundColor: "#d89a4a",
    transform: [{ skewX: "-10deg" }],
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  character: {
    position: "absolute",
    left: "50%",
    bottom: 14,
    width: 28,
    height: 58,
    marginLeft: -14,
    borderRadius: 14,
    backgroundColor: "rgba(247, 217, 207, 0.96)",
  },
});
