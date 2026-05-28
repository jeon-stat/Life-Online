import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { AdminPanel } from "../components/AdminPanel.js";
import { DailySummaryCard } from "../components/DailySummaryCard.js";
import { theme } from "../constants/theme.js";

export function CharacterScreen() {
  const { currentUser, signOut } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal });
  const recentMemories = viewState.memories.slice(0, 2);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <DailySummaryCard
        title="\uC131\uC7A5"
        primary={`LV ${viewState.level}`}
        secondary={`${viewState.totalXp} XP \u00B7 \uB2E4\uC74C \uC131\uC7A5\uAE4C\uC9C0 ${viewState.xpToNext} XP`}
        accent
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>내 산책 파트너</Text>
        <Text style={styles.status}>{currentUser?.nickname ?? "게스트"}</Text>
        <Text style={styles.description}>{`@${currentUser?.handle ?? "walk"}`}</Text>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutLabel}>로그아웃</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{"\uC131\uACA9 \uD0C0\uC785"}</Text>
        <Text style={styles.status}>{viewState.personality.label}</Text>
        <Text style={styles.description}>{viewState.personality.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{"\uC131\uC7A5 \uD754\uC801"}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(6, viewState.levelProgress * 100)}%` }]} />
        </View>
        <Text style={styles.meta}>{`${viewState.xpIntoLevel} / 100 XP`}</Text>
        <Text style={styles.meta}>{`\uB204\uC801 ${viewState.growth.lifetimeSteps.toLocaleString()}\uBCF4 \u00B7 \uBAA9\uD45C \uB2EC\uC131 ${viewState.growth.achievedDays}\uC77C \u00B7 \uC5F0\uC18D ${viewState.growth.streak}\uC77C`}</Text>
        <Text style={styles.growthLabel}>{`\uC7A5\uAE30 \uC0C1\uD0DC · ${viewState.growthLabel}`}</Text>
        <Text style={styles.description}>{viewState.growthDescription}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{"\uCD5C\uADFC \uCD94\uC5B5"}</Text>
        {recentMemories.length ? (
          recentMemories.map((memory) => (
            <View key={memory.id} style={styles.memoryItem}>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.memoryText}>{memory.summary}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.description}>
            \uC544\uC9C1 \uD2B9\uBCC4\uD55C \uCD94\uC5B5\uC740 \uC5C6\uC5B4\uC694. \uC624\uB298\uC758 \uC0B0\uCC45\uC774 \uCCAB \uCD94\uC5B5\uC774 \uB420 \uC218 \uC788\uC5B4\uC694.
          </Text>
        )}
      </View>

      <AdminPanel admin={admin} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.appBackground,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  status: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 24,
    fontWeight: "900",
  },
  description: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
  track: {
    marginTop: 14,
    height: 12,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    backgroundColor: "#ece8e1",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  meta: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  growthLabel: {
    marginTop: 12,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  memoryItem: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  memoryTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  memoryText: {
    marginTop: 6,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  signOutButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff2e8",
    borderWidth: 1,
    borderColor: "#f1d6bf",
  },
  signOutLabel: {
    color: "#9f4e33",
    fontSize: 12,
    fontWeight: "900",
  },
});
