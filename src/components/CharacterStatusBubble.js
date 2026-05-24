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
    borderRadius: theme.radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    position: "relative",
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  text: {
    color: theme.colors.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800",
  },
  tail: {
    position: "absolute",
    bottom: -8,
    left: 28,
    width: 18,
    height: 18,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "45deg" }],
  },
});
