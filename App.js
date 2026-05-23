import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
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
import { CHARACTER_PARTS, FLOOR_TILES } from "./src/scene.js";

export default function App() {
  const [state, setState] = useState(() => createGameState());

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
                <View accessibilityLabel={"\\uADC0\\uC5EC\\uC6B4 3D \\uC0AC\\uB78C \\uCE90\\uB9AD\\uD130"} style={styles.sceneWrap}>
                  <View style={styles.floorGroup}>
                    {FLOOR_TILES.map((tile) => (
                      <View
                        key={tile.id}
                        style={[
                          styles.floorTile,
                          tile.tone === "mid" ? styles.floorTileMid : styles.floorTileLight,
                          { left: 110 + tile.x, top: 18 + tile.y },
                        ]}
                      />
                    ))}
                    <View style={styles.floorShadow} />
                  </View>

                  <View style={styles.characterWrap}>
                    {CHARACTER_PARTS.includes("backHair") && <View style={styles.backHair} />}
                    {CHARACTER_PARTS.includes("hairCap") && <View style={styles.hairCap} />}
                    {CHARACTER_PARTS.includes("bangLeft") && <View style={styles.bangLeft} />}
                    {CHARACTER_PARTS.includes("bangRight") && <View style={styles.bangRight} />}
                    {CHARACTER_PARTS.includes("head") && <View style={styles.head} />}
                    {CHARACTER_PARTS.includes("earLeft") && <View style={styles.earLeft} />}
                    {CHARACTER_PARTS.includes("earRight") && <View style={styles.earRight} />}
                    <View style={[styles.eye, styles.eyeLeft]} />
                    <View style={[styles.eye, styles.eyeRight]} />
                    <View style={[styles.cheek, styles.cheekLeft]} />
                    <View style={[styles.cheek, styles.cheekRight]} />
                    <View style={styles.nose} />
                    <View style={styles.smile} />
                    {CHARACTER_PARTS.includes("neck") && <View style={styles.neck} />}
                    {CHARACTER_PARTS.includes("armLeft") && <View style={styles.armLeft} />}
                    {CHARACTER_PARTS.includes("armRight") && <View style={styles.armRight} />}
                    {CHARACTER_PARTS.includes("handLeft") && <View style={styles.handLeft} />}
                    {CHARACTER_PARTS.includes("handRight") && <View style={styles.handRight} />}
                    {CHARACTER_PARTS.includes("body") && (
                      <LinearGradient colors={["#eef3ff", "#d3dbff"]} style={styles.body} />
                    )}
                    {CHARACTER_PARTS.includes("belt") && <View style={styles.belt} />}
                    {CHARACTER_PARTS.includes("legLeft") && <View style={styles.legLeft} />}
                    {CHARACTER_PARTS.includes("legRight") && <View style={styles.legRight} />}
                    {CHARACTER_PARTS.includes("shoeLeft") && <View style={styles.shoeLeft} />}
                    {CHARACTER_PARTS.includes("shoeRight") && <View style={styles.shoeRight} />}
                  </View>
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.heading}>{"\uB0B4 \uCE90\uB9AD\uD130"}</Text>
            <Text style={styles.subtitle}>{state.title}</Text>

            <View style={styles.statsRow}>
              <StatCard label="EXP" value={String(state.exp)} />
              <StatCard label={"\uAE30\uBD84"} value={state.mood} />
              <StatCard label={"\uC624\uB298"} value={String(state.count)} />
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
              {"\uB85C\uCEEC \uAC1C\uBC1C \uC8FC\uC18C\uB294 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uBC18\uC601\uB418\uACE0, GitHub Pages \uC8FC\uC18C\uB294 push \uD6C4 \uC790\uB3D9 \uAC31\uC2E0\uB429\uB2C8\uB2E4."}
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

const skin = "#ffe1ca";
const line = "#26324a";
const hair = "#6f4f43";

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
    minHeight: Platform.select({ web: 808, default: "100%" }),
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
    width: 288,
    minHeight: 390,
    borderRadius: 28,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#4e5f7d",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  sceneWrap: {
    width: "100%",
    height: 360,
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  floorGroup: {
    position: "absolute",
    width: "100%",
    height: 180,
    left: 0,
    top: 250,
    zIndex: 1,
  },
  floorTile: {
    position: "absolute",
    width: 66,
    height: 66,
    borderWidth: 1.5,
    borderColor: "rgba(88, 104, 138, 0.5)",
    transform: [{ rotate: "45deg" }, { skewX: "-12deg" }],
    borderRadius: 8,
  },
  floorTileLight: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },
  floorTileMid: {
    backgroundColor: "rgba(184, 224, 240, 0.92)",
  },
  floorShadow: {
    position: "absolute",
    left: 98,
    top: 48,
    width: 106,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(39, 54, 77, 0.22)",
  },
  characterWrap: {
    width: 186,
    height: 294,
    position: "relative",
    marginBottom: 26,
    zIndex: 2,
  },
  backHair: {
    position: "absolute",
    left: 26,
    top: 8,
    width: 134,
    height: 122,
    borderRadius: 56,
    backgroundColor: "#8a6b5a",
  },
  hairCap: {
    position: "absolute",
    left: 30,
    top: 10,
    width: 126,
    height: 92,
    borderRadius: 48,
    backgroundColor: hair,
  },
  bangLeft: {
    position: "absolute",
    left: 38,
    top: 46,
    width: 36,
    height: 32,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 10,
    backgroundColor: "#5f4137",
    transform: [{ rotate: "-22deg" }],
  },
  bangRight: {
    position: "absolute",
    right: 38,
    top: 44,
    width: 42,
    height: 34,
    borderBottomLeftRadius: 24,
    borderTopRightRadius: 10,
    backgroundColor: "#5f4137",
    transform: [{ rotate: "18deg" }],
  },
  head: {
    position: "absolute",
    left: 41,
    top: 42,
    width: 104,
    height: 112,
    borderRadius: 48,
    backgroundColor: skin,
  },
  earLeft: {
    position: "absolute",
    left: 34,
    top: 92,
    width: 16,
    height: 28,
    borderRadius: 10,
    backgroundColor: skin,
  },
  earRight: {
    position: "absolute",
    right: 34,
    top: 92,
    width: 16,
    height: 28,
    borderRadius: 10,
    backgroundColor: skin,
  },
  eye: {
    position: "absolute",
    top: 94,
    width: 14,
    height: 18,
    borderRadius: 999,
    backgroundColor: line,
  },
  eyeLeft: {
    left: 72,
  },
  eyeRight: {
    right: 72,
  },
  cheek: {
    position: "absolute",
    top: 120,
    width: 20,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#ffb2cb",
  },
  cheekLeft: {
    left: 54,
  },
  cheekRight: {
    right: 54,
  },
  nose: {
    position: "absolute",
    top: 112,
    left: 91,
    width: 6,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#f1c1a4",
  },
  smile: {
    position: "absolute",
    top: 129,
    left: 84,
    width: 18,
    height: 10,
    borderBottomWidth: 3,
    borderBottomColor: line,
    borderRadius: 999,
  },
  neck: {
    position: "absolute",
    left: 80,
    top: 145,
    width: 28,
    height: 24,
    borderRadius: 10,
    backgroundColor: skin,
  },
  armLeft: {
    position: "absolute",
    left: 28,
    top: 170,
    width: 34,
    height: 98,
    borderRadius: 20,
    backgroundColor: "#dce3ff",
    transform: [{ rotate: "10deg" }],
  },
  armRight: {
    position: "absolute",
    right: 28,
    top: 168,
    width: 34,
    height: 98,
    borderRadius: 20,
    backgroundColor: "#dce3ff",
    transform: [{ rotate: "-10deg" }],
  },
  handLeft: {
    position: "absolute",
    left: 24,
    top: 247,
    width: 26,
    height: 26,
    borderRadius: 16,
    backgroundColor: skin,
  },
  handRight: {
    position: "absolute",
    right: 24,
    top: 246,
    width: 26,
    height: 26,
    borderRadius: 16,
    backgroundColor: skin,
  },
  body: {
    position: "absolute",
    left: 51,
    top: 164,
    width: 84,
    height: 94,
    borderRadius: 28,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  belt: {
    position: "absolute",
    left: 58,
    top: 221,
    width: 70,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#b8c5ff",
  },
  legLeft: {
    position: "absolute",
    left: 62,
    top: 245,
    width: 28,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#f3f6ff",
  },
  legRight: {
    position: "absolute",
    right: 62,
    top: 245,
    width: 28,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#f3f6ff",
  },
  shoeLeft: {
    position: "absolute",
    left: 54,
    top: 279,
    width: 40,
    height: 16,
    borderRadius: 12,
    backgroundColor: "#d7deff",
  },
  shoeRight: {
    position: "absolute",
    right: 54,
    top: 279,
    width: 40,
    height: 16,
    borderRadius: 12,
    backgroundColor: "#d7deff",
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
