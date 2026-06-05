import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

import { AuthProvider, useAuth } from "./src/auth/AuthProvider.js";
import { StepDataProvider, useStepData } from "./src/data/stepDataProvider.js";
import { AuthScreen } from "./src/screens/AuthScreen.js";
import { HomeScreen } from "./src/screens/HomeScreen.js";
import { HistoryScreen } from "./src/screens/HistoryScreen.js";
import { CharacterScreen } from "./src/screens/CharacterScreen.js";
import { FriendsScreen } from "./src/screens/FriendsScreen.js";
import { ShopScreen } from "./src/screens/ShopScreen.js";
import { AdminPanel } from "./src/components/AdminPanel.js";
import { AccountMenu } from "./src/components/AccountMenu.js";
import { BottomTabs } from "./src/components/BottomTabs.js";
import { theme } from "./src/constants/theme.js";
import { LAST_UPDATED_LABEL } from "./src/generated/buildInfo.js";
import { buildCharacterViewModel } from "./src/game/characterState.js";

Text.defaultProps = Text.defaultProps ?? {};
Text.defaultProps.style = [Text.defaultProps.style, { fontFamily: theme.fonts.body }];
TextInput.defaultProps = TextInput.defaultProps ?? {};
TextInput.defaultProps.style = [TextInput.defaultProps.style, { fontFamily: theme.fonts.body }];

const TABS = [
  { id: "home", label: "산책", icon: "⌂" },
  { id: "history", label: "추억", icon: "◌" },
  { id: "character", label: "캐릭터", icon: "○" },
  { id: "friends", label: "친구", icon: "◔" },
  { id: "shop", label: "상점", icon: "✦" },
];

const STEP_DATA_MODE = Platform.OS === "web" ? "mock" : "auto";

export default function App() {
  useWebFonts();

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function useWebFonts() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return undefined;
    }

    const id = "life-online-web-fonts";
    if (document.getElementById(id)) {
      return undefined;
    }

    const preconnectGoogle = document.createElement("link");
    preconnectGoogle.id = `${id}-preconnect-google`;
    preconnectGoogle.rel = "preconnect";
    preconnectGoogle.href = "https://fonts.googleapis.com";

    const preconnectFonts = document.createElement("link");
    preconnectFonts.id = `${id}-preconnect-fonts`;
    preconnectFonts.rel = "preconnect";
    preconnectFonts.href = "https://fonts.gstatic.com";
    preconnectFonts.crossOrigin = "anonymous";

    const stylesheet = document.createElement("link");
    stylesheet.id = id;
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap";

    document.head.appendChild(preconnectGoogle);
    document.head.appendChild(preconnectFonts);
    document.head.appendChild(stylesheet);

    return () => {
      document.getElementById(id)?.remove();
      document.getElementById(`${id}-preconnect-google`)?.remove();
      document.getElementById(`${id}-preconnect-fonts`)?.remove();
    };
  }, []);
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
  const { currentUser, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
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
        {admin?.canOverride ? (
          <View style={styles.updatedAtBadge} pointerEvents="none">
            <Text style={styles.updatedAtBadgeLabel}>{LAST_UPDATED_LABEL}</Text>
          </View>
        ) : null}

        <View style={styles.screenArea}>
          {activeTab === "home" ? <HomeScreen /> : null}
          {activeTab === "history" ? <HistoryScreen /> : null}
          {activeTab === "character" ? <CharacterScreen /> : null}
          {activeTab === "friends" ? <FriendsScreen /> : null}
          {activeTab === "shop" ? <ShopScreen /> : null}
        </View>

        <Pressable
          onPress={() => setMenuVisible(true)}
          style={styles.menuToggle}
          accessibilityRole="button"
          accessibilityLabel="Open account menu"
        >
          <Text style={styles.menuToggleLabel}>☰</Text>
        </Pressable>

        {admin?.visible && admin?.canOverride ? (
          <View style={styles.adminPanelOverlay} pointerEvents="box-none">
            <ScrollView contentContainerStyle={styles.adminPanelScrollContent} showsVerticalScrollIndicator={false}>
              <AdminPanel admin={admin} behavior={viewState.behavior} onClose={admin.toggleVisible} />
            </ScrollView>
          </View>
        ) : null}

        {admin?.visible ? (
          <Pressable
            onPress={admin.toggleVisible}
            style={[styles.adminToggle, styles.adminToggleActive]}
            accessibilityRole="button"
            accessibilityLabel="Hide admin panel"
          >
            <Text style={[styles.adminToggleLabel, styles.adminToggleLabelActive]}>Admin</Text>
          </Pressable>
        ) : admin?.canOverride ? (
          <Pressable
            onPress={admin.toggleVisible}
            style={styles.adminToggle}
            accessibilityRole="button"
            accessibilityLabel="Show admin panel"
          >
            <Text style={styles.adminToggleLabel}>Admin</Text>
          </Pressable>
        ) : null}

        <AccountMenu
          visible={menuVisible}
          currentUser={currentUser}
          totalSteps={viewState.growth?.lifetimeSteps ?? 0}
          goal={goal}
          onClose={() => setMenuVisible(false)}
          onLogout={() => {
            setMenuVisible(false);
            signOut();
          }}
        />

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
  updatedAtBadge: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    zIndex: 12,
    alignItems: "center",
  },
  updatedAtBadgeLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
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
    right: 14,
    bottom: 96,
    zIndex: 35,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  adminToggleActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  adminToggleLabel: {
    color: theme.colors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  adminToggleLabelActive: {
    color: "#ffffff",
  },
  shopToggle: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 30,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shopToggleLabel: {
    fontSize: 18,
    lineHeight: 18,
  },
  menuToggle: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 30,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuToggleLabel: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 18,
  },
});
