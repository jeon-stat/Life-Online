import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import { ACTION_LIST, applyAction, createGameState } from "./src/game.js";
import { STAGE_LAYOUT } from "./src/scene/stageConfig.js";
import { ActionGrid } from "./src/ui/ActionGrid.js";
import { ClassTabs } from "./src/ui/ClassTabs.js";
import { StatRow } from "./src/ui/StatRow.js";

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [selectedId, setSelectedId] = useState("warrior");

  const selectedCharacter =
    CHARACTER_CLASSES.find((item) => item.id === selectedId) ?? CHARACTER_CLASSES[0];

  return (
    <LinearGradient colors={["#cfeeff", "#fff7df", "#ffe3ef"]} style={styles.background}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.screen}>
            <View style={styles.topbar}>
              <Text style={styles.brand}>Life Online DEV</Text>
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>LV {state.level}</Text>
              </View>
            </View>

            <Text style={styles.heading}>내 캐릭터</Text>
            <Text style={styles.subtitle}>{selectedCharacter.label}</Text>
            <Text style={styles.blurb}>{selectedCharacter.blurb}</Text>

            <View style={[styles.heroStage, { height: STAGE_LAYOUT.heroHeight }]}>
              <CharacterStage character={selectedCharacter} />
            </View>

            <View style={styles.surface}>
              <ClassTabs
                characters={CHARACTER_CLASSES}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </View>

            <View style={styles.surface}>
              <StatRow
                items={[
                  { label: "EXP", value: String(state.exp) },
                  { label: "기분", value: state.mood },
                  { label: "오늘", value: String(state.count) },
                ]}
              />
            </View>

            <View style={styles.surface}>
              <ActionGrid
                actions={ACTION_LIST}
                onAction={(action) => setState((current) => applyAction(current, action))}
              />
            </View>

            <View style={styles.logPanel}>
              <Text style={styles.logText}>{state.log}</Text>
            </View>

            <Text style={styles.helperText}>
              이제 씬은 카드가 아니라 열린 공간으로 다룹니다. 다음 단계에서는 이 공간 안에서
              자유 회전과 더 정교한 캐릭터 디테일을 붙이면 됩니다.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar style="dark" />
    </LinearGradient>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  screen: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
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
    maxWidth: 320,
  },
  heroStage: {
    width: "100%",
    marginTop: 12,
    marginBottom: 14,
    overflow: "hidden",
  },
  surface: {
    marginTop: 10,
  },
  logPanel: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.86)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  logText: {
    color: "#5d6879",
    fontSize: 14,
    fontWeight: "800",
  },
  helperText: {
    marginTop: 12,
    color: "#6a7585",
    fontSize: 13,
    lineHeight: 18,
    paddingBottom: 8,
  },
});
