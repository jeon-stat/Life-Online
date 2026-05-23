import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import { ACTION_LIST, applyAction, createGameState } from "./src/game.js";

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [selectedId, setSelectedId] = useState("warrior");

  const selectedCharacter =
    CHARACTER_CLASSES.find((item) => item.id === selectedId) ?? CHARACTER_CLASSES[0];

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

            <Text style={styles.heading}>내 캐릭터</Text>
            <Text style={styles.subtitle}>{selectedCharacter.label}</Text>
            <Text style={styles.blurb}>{selectedCharacter.blurb}</Text>

            <View style={styles.hero}>
              <LinearGradient colors={["#f7fbff", "#fff2d4"]} style={styles.characterCard}>
                <CharacterStage character={selectedCharacter} />
              </LinearGradient>
            </View>

            <View style={styles.classRow}>
              {CHARACTER_CLASSES.map((character) => {
                const selected = character.id === selectedCharacter.id;

                return (
                  <Pressable
                    key={character.id}
                    onPress={() => setSelectedId(character.id)}
                    style={[
                      styles.classButton,
                      selected && { backgroundColor: character.palette.primary },
                    ]}
                  >
                    <Text style={[styles.classText, selected && styles.classTextSelected]}>
                      {character.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

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
              지금은 전사, 마법사, 해적 3종의 캐릭터 모델을 먼저 잡는 단계예요.
              다음 단계에서 자유 회전과 상세 연출을 붙일게요.
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
    maxWidth: 420,
    alignSelf: "center",
    padding: 20,
    borderRadius: 34,
    borderWidth: 8,
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
  heading: {
    marginTop: 18,
    fontSize: 34,
    lineHeight: 38,
    color: "#243042",
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    color: "#243042",
    fontSize: 22,
    fontWeight: "800",
  },
  blurb: {
    marginTop: 6,
    color: "#627182",
    fontSize: 15,
    lineHeight: 21,
  },
  hero: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  characterCard: {
    width: "100%",
    maxWidth: 320,
    height: 390,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#4e5f7d",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  classRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  classButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dce5f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  classText: {
    color: "#27364d",
    fontSize: 15,
    fontWeight: "800",
  },
  classTextSelected: {
    color: "#ffffff",
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
