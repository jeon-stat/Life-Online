import { StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

export function CharacterStatusBubble({ text, bubbleSurface }) {
  return (
    <View style={[styles.shell, { backgroundColor: bubbleSurface ?? theme.colors.surfaceSoft }]}>
      <Text style={styles.text}>{text}</Text>
      <View style={[styles.tail, { backgroundColor: bubbleSurface ?? theme.colors.surfaceSoft }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    top: 18,
    right: 54,
    zIndex: 4,
    borderRadius: theme.radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    maxWidth: 140,
  },
  text: {
    color: theme.colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  tail: {
    position: "absolute",
    bottom: -6,
    left: 18,
    width: 14,
    height: 14,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "45deg" }],
  },
});
