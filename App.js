import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";

import { StepDataProvider } from "./src/data/stepDataProvider.js";
import { HomeScreen } from "./src/screens/HomeScreen.js";
import { HistoryScreen } from "./src/screens/HistoryScreen.js";
import { CharacterScreen } from "./src/screens/CharacterScreen.js";
import { BottomTabs } from "./src/components/BottomTabs.js";
import { theme } from "./src/constants/theme.js";

const TABS = [
  { id: "home", label: "\uC0B0\uCC45" },
  { id: "history", label: "\uAE30\uB85D" },
  { id: "character", label: "\uCE90\uB9AD\uD130" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const adminEnabled = useMemo(() => {
    if (typeof __DEV__ !== "undefined" && __DEV__ === true) {
      return true;
    }

    if (Platform.OS === "web" && typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("dev") === "1";
    }

    return false;
  }, []);

  return (
    <StepDataProvider mode="mock" adminEnabled={adminEnabled}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.appShell}>
          <View style={styles.screenArea}>
            {activeTab === "home" ? <HomeScreen /> : null}
            {activeTab === "history" ? <HistoryScreen /> : null}
            {activeTab === "character" ? <CharacterScreen /> : null}
          </View>
          <BottomTabs items={TABS} activeId={activeTab} onChange={setActiveTab} />
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </StepDataProvider>
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
});
