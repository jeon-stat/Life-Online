import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ACTION_LIST, applyAction, createGameState } from "./src/game.js";

export default function App() {
  const [state, setState] = useState(() => createGameState());

  const titleText = useMemo(() => state.title, [state.title]);

  return (
    <LinearGradient colors={["#bde7ff", "#fff7df", "#ffd6e9"]} style={styles.background}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.appShell}>
            <View style={styles.topbar}>
              <Text style={styles.brand}>Life Online DEV</Text>
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>LV {state.level}</Text>
              </View>
            </View>

            <View style={styles.hero}>
              <LinearGradient colors={["#dff7ff", "#fff0af"]} style={styles.characterCard}>
                <View accessibilityLabel="귀여운 3D 사람 캐릭터" style={styles.characterWrap}>
                  <View style={styles.hair} />
                  <View style={styles.head} />
                  <View style={[styles.eye, styles.eyeLeft]} />
                  <View style={[styles.eye, styles.eyeRight]} />
                  <View style={[styles.cheek, styles.cheekLeft]} />
                  <View style={[styles.cheek, styles.cheekRight]} />
                  <View style={styles.smile} />
                  <View style={[styles.arm, styles.armLeft]} />
                  <View style={[styles.arm, styles.armRight]} />
                  <LinearGradient colors={["#79dcff", "#8d7dff"]} style={styles.body} />
                  <View style={[styles.leg, styles.legLeft]} />
                  <View style={[styles.leg, styles.legRight]} />
                  <View style={styles.shadow} />
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.heading}>내 캐릭터</Text>
            <Text style={styles.subtitle}>{titleText}</Text>

            <View style={styles.statsRow}>
              <StatCard label="EXP" value={String(state.exp)} />
              <StatCard label="기분" value={state.mood} />
              <StatCard label="오늘" value={String(state.count)} />
            </View>

            <View style={styles.actionsGrid}>
              {ACTION_LIST.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => setState((current) => applyAction(current, action))}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.actionText}>{action.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.logText}>{state.log}</Text>
            <Text style={styles.helperText}>
              로컬 개발 주소는 실시간으로 반영되고, GitHub Pages 주소는 push 후 자동 갱신됩니다.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="dark" />
    </LinearGradient>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 14,
  },
  appShell: {
    width: "100%",
    maxWidth: 402,
    minHeight: Platform.select({ web: 780, default: "100%" }),
    alignSelf: "center",
    padding: 20,
    borderRadius: 34,
    borderWidth: Platform.select({ web: 8, default: 0 }),
    borderColor: "#27364d",
    backgroundColor: "#f8fbff",
    shadowColor: "#1c2537",
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 5,
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    color: "#627182",
    fontSize: 13,
    fontWeight: "900",
  },
  levelPill: {
    minWidth: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#27364d",
    alignItems: "center",
  },
  levelText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 16,
  },
  hero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  characterCard: {
    width: 264,
    minHeight: 344,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4e5f7d",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  characterWrap: {
    width: 156,
    height: 262,
    position: "relative",
  },
  hair: {
    position: "absolute",
    top: 8,
    left: 22,
    width: 112,
    height: 88,
    borderRadius: 48,
    backgroundColor: "#6b4b3a",
  },
  head: {
    position: "absolute",
    top: 36,
    left: 26,
    width: 104,
    height: 104,
    borderRadius: 44,
    backgroundColor: "#ffd9bc",
  },
  eye: {
    position: "absolute",
    top: 74,
    width: 12,
    height: 15,
    borderRadius: 999,
    backgroundColor: "#293047",
  },
  eyeLeft: {
    left: 48,
  },
  eyeRight: {
    right: 48,
  },
  cheek: {
    position: "absolute",
    top: 98,
    width: 20,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#ff9fba",
  },
  cheekLeft: {
    left: 34,
  },
  cheekRight: {
    right: 34,
  },
  smile: {
    position: "absolute",
    top: 103,
    left: 68,
    width: 20,
    height: 12,
    borderBottomWidth: 3,
    borderBottomColor: "#293047",
    borderRadius: 999,
  },
  arm: {
    position: "absolute",
    top: 148,
    width: 34,
    height: 86,
    borderRadius: 999,
    backgroundColor: "#ffd9bc",
  },
  armLeft: {
    left: 18,
    transform: [{ rotate: "18deg" }],
  },
  armRight: {
    right: 18,
    transform: [{ rotate: "-18deg" }],
  },
  body: {
    position: "absolute",
    top: 136,
    left: 22,
    width: 112,
    height: 94,
    borderRadius: 36,
  },
  leg: {
    position: "absolute",
    top: 216,
    width: 36,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#6b72ff",
  },
  legLeft: {
    left: 50,
  },
  legRight: {
    right: 50,
  },
  shadow: {
    position: "absolute",
    left: 22,
    bottom: -8,
    width: 112,
    height: 22,
    borderRadius: 999,
    backgroundColor: "rgba(39,54,77,0.14)",
  },
  heading: {
    fontSize: 34,
    lineHeight: 38,
    color: "#243042",
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: "#627182",
    fontSize: 18,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dce5f0",
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statLabel: {
    color: "#7b8798",
    fontSize: 12,
    fontWeight: "900",
  },
  statValue: {
    color: "#243042",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexBasis: "18%",
    minWidth: 64,
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#27364d",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 15,
  },
  logText: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#5d6879",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: "800",
  },
  helperText: {
    marginTop: 12,
    color: "#6a7585",
    fontSize: 13,
    lineHeight: 18,
  },
});
