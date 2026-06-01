import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, Text } from "react-native";

import { AuthProvider, useAuth } from "./src/auth/AuthProvider.js";
import { StepDataProvider, useStepData } from "./src/data/stepDataProvider.js";
import { AuthScreen } from "./src/screens/AuthScreen.js";
import { HomeScreen } from "./src/screens/HomeScreen.js";
import { HistoryScreen } from "./src/screens/HistoryScreen.js";
import { CharacterScreen } from "./src/screens/CharacterScreen.js";
import { AdminPanel } from "./src/components/AdminPanel.js";
import { BottomTabs } from "./src/components/BottomTabs.js";
import { theme } from "./src/constants/theme.js";
import { buildCharacterViewModel } from "./src/game/characterState.js";

const TABS = [
  { id: "home", label: "\uC0B0\uCC45" },
  { id: "history", label: "\uBC1C\uC790\uAD6D" },
  { id: "character", label: "\uCE90\uB9AD\uD130" },
];

const STEP_DATA_MODE = Platform.OS === "web" ? "mock" : "auto";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("home");
  const { isAuthenticated } = useAuth();
  const adminEnabled = useMemo(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__ === true) {
      return true;
    }

    if (Platform.OS === "web" && typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("dev") === "1";
    }

    return false;
  }, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AuthScreen />
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <StepDataProvider mode={STEP_DATA_MODE} adminEnabled={adminEnabled}>
      <AppShell activeTab={activeTab} onChangeTab={setActiveTab} />
    </StepDataProvider>
  );
}

function AppShell({ activeTab, onChangeTab }) {
  const { today, history, goal, admin } = useStepData();
  const viewState = useMemo(
    () =>
      buildCharacterViewModel({
        todayRecord: today,
        history,
        goal,
        admin,
      }),
    [admin, goal, history, today],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appShell}>
        <View style={styles.screenArea}>
          {activeTab === "home" ? <HomeScreen /> : null}
          {activeTab === "history" ? <HistoryScreen /> : null}
          {activeTab === "character" ? <CharacterScreen /> : null}
        </View>

        {admin?.visible && admin?.canOverride ? (
          <View style={styles.adminPanelOverlay} pointerEvents="box-none">
            <ScrollView contentContainerStyle={styles.adminPanelScrollContent} showsVerticalScrollIndicator={false}>
              <AdminPanel admin={admin} behavior={viewState.behavior} />
            </ScrollView>
          </View>
        ) : null}

        {admin?.visible ? (
          <Pressable
            onPress={admin.toggleVisible}
            style={styles.adminToggle}
            accessibilityRole="button"
            accessibilityLabel="Hide admin panel"
          >
            <Text style={styles.adminToggleLabel}>Hide Admin</Text>
          </Pressable>
        ) : admin?.canOverride ? (
          <Pressable
            onPress={admin.toggleVisible}
            style={styles.adminToggle}
            accessibilityRole="button"
            accessibilityLabel="Show admin panel"
          >
            <Text style={styles.adminToggleLabel}>Show Admin</Text>
          </Pressable>
        ) : null}

        <BottomTabs items={TABS} activeId={activeTab} onChange={onChangeTab} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  appShell: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  screenArea: {
    flex: 1,
  },
  adminPanelOverlay: {
    position: "absolute",
    top: 56,
    left: 14,
    right: 14,
    bottom: 84,
    zIndex: 40,
  },
  adminPanelScrollContent: {
    paddingBottom: 12,
  },
  adminToggle: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 30,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#dfc8b4",
  },
  adminToggleLabel: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
});
