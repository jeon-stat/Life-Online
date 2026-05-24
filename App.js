import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import { ACTION_LIST, CATEGORY_LIMITS, DAILY_EXP_CAP, applyAction, createGameState } from "./src/game.js";
import { BottomTabs } from "./src/ui/BottomTabs.js";

const NAV_ITEMS = [
  { id: "today", label: "Today", icon: "Home" },
  { id: "focus", label: "Focus", icon: "Timer" },
  { id: "journey", label: "Journey", icon: "Log" },
  { id: "avatar", label: "Avatar", icon: "Style" },
];

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const DATE_ITEMS = [
  { day: "11", active: true },
  { day: "12", active: false },
  { day: "13", active: false },
  { day: "14", active: false },
  { day: "15", active: false },
  { day: "16", active: false },
  { day: "17", active: false },
];

const AVATAR_MOODS = [
  { id: "calm", label: "Calm" },
  { id: "bright", label: "Bright" },
  { id: "focus", label: "Focus" },
];

const SCENE_THEMES = [
  { id: "morning", label: "Morning" },
  { id: "study", label: "Study" },
  { id: "rest", label: "Rest" },
];

const ACTION_COPY = {
  walkGoal: "Walk Goal",
  focusSession: "Focus Session",
  windDown: "Wind Down",
  tidyReset: "Tidy Reset",
  reflection: "Reflection",
};

const ACTION_HELP = {
  walkGoal: "Wake up the body with a simple move",
  focusSession: "A clean 25 minute deep-focus loop",
  windDown: "Close the day with a gentle night routine",
  tidyReset: "Reset the space before the next step",
  reflection: "Leave one line about today",
};

const CATEGORY_COPY = {
  body: "Body",
  focus: "Focus",
  mind: "Mind",
  life: "Life",
};

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [activeTab, setActiveTab] = useState("today");
  const [isStageDragging, setIsStageDragging] = useState(false);
  const [selectedMood, setSelectedMood] = useState("calm");
  const [selectedTheme, setSelectedTheme] = useState("morning");

  const character = CHARACTER_CLASSES[0];
  const dailyProgress = Math.round((state.dailyExp / DAILY_EXP_CAP) * 100);
  const recentActionIds = state.history.map((item) => item.id.split("-")[0]);

  const heroStatus = useMemo(() => {
    if (state.dailyExp >= 70) return "Your rhythm is strong today. One more action will push growth forward.";
    if (state.dailyExp >= 35) return "Momentum is building. Keep the day feeling clean and intentional.";
    return "Start with one small helpful action and let the character grow with you.";
  }, [state.dailyExp]);

  const focusCount = state.history.filter((item) => item.category === "focus").length;
  const reflectionCount = state.history.filter((item) => item.id.startsWith("reflection")).length;
  const topActions = ACTION_LIST.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appShell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isStageDragging}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection
            character={character}
            level={state.level}
            statusCopy={heroStatus}
            progress={dailyProgress}
            onInteractionChange={setIsStageDragging}
          />

          <View style={styles.sheet}>
            <QuickStatusRow level={state.level} dailyProgress={dailyProgress} actionCount={state.count} />
            <DateStrip />

            {activeTab === "today" ? (
              <TodayTab
                state={state}
                topActions={topActions}
                recentActionIds={recentActionIds}
                onAction={(action) => setState((current) => applyAction(current, action))}
              />
            ) : null}

            {activeTab === "focus" ? (
              <FocusTab state={state} focusCount={focusCount} onAction={(action) => setState((current) => applyAction(current, action))} />
            ) : null}

            {activeTab === "journey" ? <JourneyTab state={state} /> : null}

            {activeTab === "avatar" ? (
              <AvatarTab
                state={state}
                selectedMood={selectedMood}
                selectedTheme={selectedTheme}
                onMoodChange={setSelectedMood}
                onThemeChange={setSelectedTheme}
              />
            ) : null}

            <FooterSpace reflectionCount={reflectionCount} />
          </View>
        </ScrollView>

        <BottomTabs items={NAV_ITEMS} activeId={activeTab} onChange={setActiveTab} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function HeroSection({ character, level, statusCopy, progress, onInteractionChange }) {
  return (
    <LinearGradient
      colors={["#fbfaf8", "#f4f1eb", "#eef2f8"]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.heroSection}
    >
      <View style={styles.heroGlowLarge} />
      <View style={styles.heroGlowSmall} />

      <View style={styles.headerBar}>
        <View>
          <Text style={styles.brand}>Life Online</Text>
          <Text style={styles.brandSub}>healthy growth game</Text>
        </View>
        <View style={styles.levelBubble}>
          <Text style={styles.levelBubbleText}>LV {level}</Text>
        </View>
      </View>

      <View style={styles.heroCopyBlock}>
        <Text style={styles.heroTitle}>{"\uB0B4 \uCE90\uB9AD\uD130"}</Text>
        <Text style={styles.heroCopy}>{statusCopy}</Text>
        <View style={styles.heroBadgeRow}>
          <Badge text={`Today XP ${progress}%`} />
          <Badge text={character.label} />
        </View>
      </View>

      <View style={styles.characterStageArea}>
        <CharacterStage character={character} onInteractionChange={onInteractionChange} />
      </View>

      <Text style={styles.heroHint}>Drag around the character to rotate it.</Text>
    </LinearGradient>
  );
}

function QuickStatusRow({ level, dailyProgress, actionCount }) {
  return (
    <View style={styles.quickStatusRow}>
      <SmallMetricCard label="Level" value={`LV ${level}`} />
      <SmallMetricCard label="Today XP" value={`${dailyProgress}%`} />
      <SmallMetricCard label="Done" value={`${actionCount}`} />
    </View>
  );
}

function TodayTab({ state, topActions, recentActionIds, onAction }) {
  const primaryFocusAction = ACTION_LIST.find((item) => item.id === "focusSession");

  return (
    <>
      <InteractiveCard
        overline="NOW"
        title="What to do next"
        description="The goal is to make the first helpful action feel immediate."
      >
        <View style={styles.quickActionRow}>
          {topActions.map((action) => (
            <QuickActionChip
              key={action.id}
              title={ACTION_COPY[action.id] ?? action.label}
              active={recentActionIds.includes(action.id)}
              onPress={() => onAction(action)}
            />
          ))}
        </View>
        <PrimaryActionButton
          title="Start a focus loop"
          subtitle="Log a clean 25 minute session"
          onPress={() => onAction(primaryFocusAction)}
        />
      </InteractiveCard>

      <InteractiveCard
        overline="ROUTINE"
        title="Today's actions"
        description="Each row is a real tap target so the screen feels alive, not static."
      >
        {ACTION_LIST.map((action) => (
          <ActionRow
            key={action.id}
            title={ACTION_COPY[action.id] ?? action.label}
            meta={ACTION_HELP[action.id]}
            value={`+${action.points}`}
            onPress={() => onAction(action)}
          />
        ))}
      </InteractiveCard>

      <InteractiveCard overline="RECAP" title="Recent activity" description={state.log}>
        {state.history.length === 0 ? (
          <EmptyState text="No log yet. Tap one action above to create the first growth entry." />
        ) : (
          state.history.map((item) => (
            <HistoryRow
              key={item.id}
              title={ACTION_COPY[item.id.split("-")[0]] ?? item.label}
              meta={`${CATEGORY_COPY[item.category]} · +${item.earned} XP`}
            />
          ))
        )}
      </InteractiveCard>
    </>
  );
}

function FocusTab({ state, focusCount, onAction }) {
  const focusAction = ACTION_LIST.find((item) => item.id === "focusSession");
  const reflectionAction = ACTION_LIST.find((item) => item.id === "reflection");
  const tidyAction = ACTION_LIST.find((item) => item.id === "tidyReset");

  return (
    <>
      <InteractiveCard
        overline="FOCUS"
        title="Focus mode"
        description="This tab is built around actions you can actually press right now."
      >
        <View style={styles.dualActionGrid}>
          <PrimaryActionButton
            title="Complete focus session"
            subtitle={`Focus reward ${state.categoryTotals.focus}/${CATEGORY_LIMITS.focus}`}
            onPress={() => onAction(focusAction)}
          />
          <SecondaryActionButton
            title="Add reflection"
            subtitle="Leave one line after the session"
            onPress={() => onAction(reflectionAction)}
          />
          <SecondaryActionButton
            title="Desk reset"
            subtitle="Clear the space and continue"
            onPress={() => onAction(tidyAction)}
          />
        </View>
      </InteractiveCard>

      <InteractiveCard overline="INSIGHT" title="Today's focus flow" description="The structure now shows rhythm and progression, not just a static screen.">
        <MetricBar label="Focus" value={state.categoryTotals.focus} max={CATEGORY_LIMITS.focus} />
        <MetricBar label="Mind" value={state.categoryTotals.mind} max={CATEGORY_LIMITS.mind} />
        <MetricBar label="Life" value={state.categoryTotals.life} max={CATEGORY_LIMITS.life} />
        <Text style={styles.noteText}>Focus loops completed today: {focusCount}</Text>
      </InteractiveCard>
    </>
  );
}

function JourneyTab({ state }) {
  return (
    <>
      <InteractiveCard overline="JOURNEY" title="Growth log" description="Balance across body, focus, mind, and life is easier to read here.">
        <MetricBar label="Body" value={state.categoryTotals.body} max={CATEGORY_LIMITS.body} />
        <MetricBar label="Focus" value={state.categoryTotals.focus} max={CATEGORY_LIMITS.focus} />
        <MetricBar label="Mind" value={state.categoryTotals.mind} max={CATEGORY_LIMITS.mind} />
        <MetricBar label="Life" value={state.categoryTotals.life} max={CATEGORY_LIMITS.life} />
      </InteractiveCard>

      <InteractiveCard overline="TIMELINE" title="Recent history" description="Helpful actions should feel like they leave a visible trail.">
        {state.history.length === 0 ? (
          <EmptyState text="No history yet." />
        ) : (
          state.history.map((item) => (
            <HistoryRow
              key={item.id}
              title={ACTION_COPY[item.id.split("-")[0]] ?? item.label}
              meta={`${CATEGORY_COPY[item.category]} · +${item.earned} XP`}
            />
          ))
        )}
      </InteractiveCard>
    </>
  );
}

function AvatarTab({ state, selectedMood, selectedTheme, onMoodChange, onThemeChange }) {
  return (
    <>
      <InteractiveCard overline="AVATAR" title="Character settings" description="This tab now includes simple selectable states so it feels interactive right away.">
        <Text style={styles.sectionLabel}>Mood</Text>
        <View style={styles.selectionRow}>
          {AVATAR_MOODS.map((item) => (
            <SelectionChip
              key={item.id}
              label={item.label}
              active={selectedMood === item.id}
              onPress={() => onMoodChange(item.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Scene</Text>
        <View style={styles.selectionRow}>
          {SCENE_THEMES.map((item) => (
            <SelectionChip
              key={item.id}
              label={item.label}
              active={selectedTheme === item.id}
              onPress={() => onThemeChange(item.id)}
            />
          ))}
        </View>
      </InteractiveCard>

      <InteractiveCard overline="PROGRESS" title="Unlock direction" description="Growth should unlock style and expression over time.">
        <HistoryRow title="Current level" meta={`LV ${state.level} · growing toward the next reward`} />
        <HistoryRow title="Next unlock" meta="Outfit tone, expression set, and background props" />
        <HistoryRow title="Long-term edge" meta="Good real-life days shape the character's identity" />
      </InteractiveCard>
    </>
  );
}

function FooterSpace({ reflectionCount }) {
  return (
    <View style={styles.footerSpace}>
      <Text style={styles.footerText}>Reflections today: {reflectionCount}</Text>
    </View>
  );
}

function DateStrip() {
  return (
    <InteractiveCard overline="CALENDAR" title="Weekly rhythm" description="A short calendar card keeps the app feeling mobile and compact.">
      <View style={styles.calendarRow}>
        {DATE_ITEMS.map((item, index) => (
          <View key={`${item.day}-${index}`} style={styles.dayCol}>
            <Text style={[styles.dayLabel, item.active && styles.dayLabelActive]}>{WEEK_DAYS[index]}</Text>
            <View style={[styles.dayBubble, item.active && styles.dayBubbleActive]}>
              <Text style={[styles.dayText, item.active && styles.dayTextActive]}>{item.day}</Text>
            </View>
          </View>
        ))}
      </View>
    </InteractiveCard>
  );
}

function InteractiveCard({ overline, title, description, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardOverline}>{overline}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {children}
    </View>
  );
}

function QuickActionChip({ title, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickChip, active && styles.quickChipActive, pressed && styles.pressDown]}>
      <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{title}</Text>
    </Pressable>
  );
}

function PrimaryActionButton({ title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressDown]}>
      <Text style={styles.primaryActionTitle}>{title}</Text>
      <Text style={styles.primaryActionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function SecondaryActionButton({ title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressDown]}>
      <Text style={styles.secondaryActionTitle}>{title}</Text>
      <Text style={styles.secondaryActionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function ActionRow({ title, meta, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.pressDown]}>
      <View>
        <Text style={styles.actionRowTitle}>{title}</Text>
        <Text style={styles.actionRowMeta}>{meta}</Text>
      </View>
      <View style={styles.actionRowBadge}>
        <Text style={styles.actionRowBadgeText}>{value}</Text>
      </View>
    </Pressable>
  );
}

function HistoryRow({ title, meta }) {
  return (
    <View style={styles.historyRow}>
      <View style={styles.historyDot} />
      <View style={styles.historyCopy}>
        <Text style={styles.historyTitle}>{title}</Text>
        <Text style={styles.historyMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function MetricBar({ label, value, max }) {
  const ratio = Math.max(0, Math.min(1, value / max));

  return (
    <View style={styles.metricBlock}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}/{max}</Text>
      </View>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

function SelectionChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.selectionChip, active && styles.selectionChipActive, pressed && styles.pressDown]}>
      <Text style={[styles.selectionChipText, active && styles.selectionChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SmallMetricCard({ label, value }) {
  return (
    <View style={styles.smallMetricCard}>
      <Text style={styles.smallMetricLabel}>{label}</Text>
      <Text style={styles.smallMetricValue}>{value}</Text>
    </View>
  );
}

function Badge({ text }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function EmptyState({ text }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f2ee",
  },
  appShell: {
    flex: 1,
    backgroundColor: "#f4f2ee",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 18,
  },
  heroSection: {
    minHeight: 470,
    paddingTop: 12,
    paddingBottom: 16,
    overflow: "hidden",
  },
  heroGlowLarge: {
    position: "absolute",
    top: 96,
    right: -42,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: "rgba(244, 209, 187, 0.26)",
  },
  heroGlowSmall: {
    position: "absolute",
    top: 166,
    left: -20,
    width: 128,
    height: 128,
    borderRadius: 999,
    backgroundColor: "rgba(184, 198, 229, 0.22)",
  },
  headerBar: {
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: "#243247",
    fontSize: 16,
    fontWeight: "900",
  },
  brandSub: {
    marginTop: 2,
    color: "#7d8797",
    fontSize: 11,
    fontWeight: "700",
  },
  levelBubble: {
    minWidth: 88,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#243247",
    alignItems: "center",
  },
  levelBubbleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  heroCopyBlock: {
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 8,
  },
  heroTitle: {
    color: "#243247",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  heroCopy: {
    color: "#536074",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    maxWidth: 320,
  },
  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(214, 207, 197, 0.7)",
  },
  badgeText: {
    color: "#49586e",
    fontSize: 12,
    fontWeight: "800",
  },
  characterStageArea: {
    height: 260,
    marginTop: 12,
  },
  heroHint: {
    marginTop: 6,
    paddingHorizontal: 18,
    color: "#7d8797",
    fontSize: 12,
    fontWeight: "700",
  },
  sheet: {
    marginTop: -10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#f8f7f4",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  quickStatusRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  smallMetricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e0d7",
  },
  smallMetricLabel: {
    color: "#8994a4",
    fontSize: 11,
    fontWeight: "800",
  },
  smallMetricValue: {
    marginTop: 6,
    color: "#243247",
    fontSize: 18,
    fontWeight: "900",
  },
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e0d7",
  },
  cardOverline: {
    color: "#d27d69",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  cardTitle: {
    marginTop: 8,
    color: "#243247",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  cardDescription: {
    marginTop: 6,
    marginBottom: 14,
    color: "#68778c",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  quickActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  quickChip: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f4f1eb",
    borderWidth: 1,
    borderColor: "#e8dfd3",
  },
  quickChipActive: {
    backgroundColor: "#243247",
    borderColor: "#243247",
  },
  quickChipText: {
    color: "#55657a",
    fontSize: 13,
    fontWeight: "900",
  },
  quickChipTextActive: {
    color: "#ffffff",
  },
  primaryAction: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: "#243247",
  },
  primaryActionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  primaryActionSubtitle: {
    marginTop: 6,
    color: "#d6dfef",
    fontSize: 13,
    fontWeight: "700",
  },
  dualActionGrid: {
    gap: 10,
  },
  secondaryAction: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f4f1eb",
    borderWidth: 1,
    borderColor: "#e6e0d7",
  },
  secondaryActionTitle: {
    color: "#243247",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryActionSubtitle: {
    marginTop: 5,
    color: "#68778c",
    fontSize: 12,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#faf8f3",
    borderWidth: 1,
    borderColor: "#ece4d9",
    marginBottom: 10,
  },
  actionRowTitle: {
    color: "#243247",
    fontSize: 15,
    fontWeight: "900",
  },
  actionRowMeta: {
    marginTop: 4,
    color: "#7b8797",
    fontSize: 12,
    fontWeight: "700",
  },
  actionRowBadge: {
    minWidth: 54,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1d8cb",
  },
  actionRowBadgeText: {
    color: "#d27d69",
    fontSize: 12,
    fontWeight: "900",
  },
  historyRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: "#d27d69",
  },
  historyCopy: {
    flex: 1,
  },
  historyTitle: {
    color: "#243247",
    fontSize: 14,
    fontWeight: "900",
  },
  historyMeta: {
    marginTop: 4,
    color: "#6e7d91",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  metricBlock: {
    marginBottom: 14,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metricLabel: {
    color: "#243247",
    fontSize: 14,
    fontWeight: "900",
  },
  metricValue: {
    color: "#68778c",
    fontSize: 12,
    fontWeight: "800",
  },
  metricTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#ece8e1",
  },
  metricFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#243247",
  },
  sectionLabel: {
    marginTop: 4,
    marginBottom: 10,
    color: "#6e7d91",
    fontSize: 12,
    fontWeight: "900",
  },
  selectionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  selectionChip: {
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: "#f4f1eb",
    borderWidth: 1,
    borderColor: "#e7dfd5",
  },
  selectionChipActive: {
    backgroundColor: "#243247",
    borderColor: "#243247",
  },
  selectionChipText: {
    color: "#59687d",
    fontSize: 13,
    fontWeight: "900",
  },
  selectionChipTextActive: {
    color: "#ffffff",
  },
  noteText: {
    marginTop: 4,
    color: "#7d8797",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyText: {
    color: "#7d8797",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  footerSpace: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 8,
  },
  footerText: {
    color: "#8a94a2",
    fontSize: 12,
    fontWeight: "700",
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCol: {
    alignItems: "center",
    gap: 8,
  },
  dayLabel: {
    color: "#98a1af",
    fontSize: 11,
    fontWeight: "800",
  },
  dayLabelActive: {
    color: "#4d5d74",
  },
  dayBubble: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f1eb",
  },
  dayBubbleActive: {
    backgroundColor: "#243247",
  },
  dayText: {
    color: "#5c6b7f",
    fontSize: 13,
    fontWeight: "900",
  },
  dayTextActive: {
    color: "#ffffff",
  },
  pressDown: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
