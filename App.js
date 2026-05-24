import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import {
  ACTIONS,
  ACTION_LIST,
  CATEGORY_LIMITS,
  DAILY_EXP_CAP,
  applyAction,
  createGameState,
} from "./src/game.js";
import { buildHomeDatePanels } from "./src/home/buildHomeDatePanels.js";
import { BottomTabs } from "./src/ui/BottomTabs.js";
import { DateAccordion } from "./src/ui/DateAccordion.js";

const COPY = {
  nav: {
    home: "\uD648",
    today: "\uC2E4\uD589",
    focus: "\uC9D1\uC911",
    journey: "\uAE30\uB85D",
    avatar: "\uAFB8\uBBF8\uAE30",
  },
  actionHelp: {
    walkGoal: "\uAC00\uBCBD\uAC8C \uBAB8\uC744 \uAE68\uC6B0\uB294 \uAE30\uBCF8 \uD589\uB3D9",
    focusSession: "25\uBD84 \uB3D9\uC548 \uD55C \uAC00\uC9C0\uC5D0 \uBAB0\uC785",
    windDown: "\uBC24 \uB8E8\uD2F4\uC744 \uC815\uB9AC\uD558\uB294 \uD589\uB3D9",
    tidyReset: "\uACF5\uAC04\uC744 \uBE44\uC6B0\uACE0 \uB2E4\uC2DC \uC2DC\uC791",
    reflection: "\uC624\uB298\uC744 \uD55C \uC904\uB85C \uB0A8\uAE30\uAE30",
  },
  category: {
    body: "\uBC14\uB514",
    focus: "\uC9D1\uC911",
    mind: "\uB9C8\uC74C",
    life: "\uC0DD\uD65C",
  },
  moodOptions: [
    { id: "soft", label: "\uCC28\uBD84" },
    { id: "bright", label: "\uC0C1\uCF8C" },
    { id: "spark", label: "\uD65C\uAE30" },
  ],
  themeOptions: [
    { id: "morning", label: "\uC544\uCE68" },
    { id: "study", label: "\uACF5\uBD80" },
    { id: "rest", label: "\uD734\uC2DD" },
  ],
};

const NAV_ITEMS = [
  { id: "home", label: COPY.nav.home, icon: "H" },
  { id: "today", label: COPY.nav.today, icon: "T" },
  { id: "focus", label: COPY.nav.focus, icon: "F" },
  { id: "journey", label: COPY.nav.journey, icon: "J" },
  { id: "avatar", label: COPY.nav.avatar, icon: "A" },
];

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [activeTab, setActiveTab] = useState("home");
  const [isStageDragging, setIsStageDragging] = useState(false);
  const [selectedMood, setSelectedMood] = useState("soft");
  const [selectedTheme, setSelectedTheme] = useState("morning");

  const character = CHARACTER_CLASSES[0];
  const now = useMemo(() => new Date(), []);
  const headerDate = formatHeaderDate(now);
  const dailyProgress = Math.round((state.dailyExp / DAILY_EXP_CAP) * 100);
  const homeDatePanels = useMemo(() => buildHomeDatePanels(now, state), [now, state]);
  const [expandedDateId, setExpandedDateId] = useState(() => homeDatePanels.at(-1)?.id ?? null);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appShell}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isStageDragging}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "home" ? (
            <HomeTab
              character={character}
              headerDate={headerDate}
              level={state.level}
              dailyProgress={dailyProgress}
              state={state}
              datePanels={homeDatePanels}
              expandedDateId={expandedDateId}
              onExpandDate={setExpandedDateId}
              onInteractionChange={setIsStageDragging}
            />
          ) : null}

          {activeTab !== "home" ? (
            <View style={styles.sheet}>
              {activeTab === "today" ? (
                <TodayTab
                  state={state}
                  onAction={(action) => setState((current) => applyAction(current, action))}
                />
              ) : null}

              {activeTab === "focus" ? (
                <FocusTab
                  state={state}
                  onAction={(action) => setState((current) => applyAction(current, action))}
                />
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
            </View>
          ) : null}
        </ScrollView>

        <BottomTabs items={NAV_ITEMS} activeId={activeTab} onChange={setActiveTab} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function HomeTab({
  character,
  headerDate,
  level,
  dailyProgress,
  state,
  datePanels,
  expandedDateId,
  onExpandDate,
  onInteractionChange,
}) {
  return (
    <>
      <View style={styles.heroSection}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.brand}>Life Online</Text>
            <Text style={styles.brandSub}>{headerDate}</Text>
          </View>
          <View style={styles.levelBubble}>
            <Text style={styles.levelBubbleText}>{`LV ${level}`}</Text>
          </View>
        </View>

        <View style={styles.heroCopyBlock}>
          <Text style={styles.heroTitle}>{"\uB0B4 \uCE90\uB9AD\uD130"}</Text>
          <Text style={styles.heroCopy}>{getHeroStatus(state.dailyExp)}</Text>
          <View style={styles.heroBadgeRow}>
            <InfoBadge text={`\uC624\uB298 XP ${dailyProgress}%`} />
            <InfoBadge text={character.label} />
          </View>
        </View>

        <View style={styles.characterStageArea}>
          <CharacterStage character={character} onInteractionChange={onInteractionChange} />
        </View>

        <Text style={styles.heroHint}>
          {
            "\uCE90\uB9AD\uD130\uB97C \uB4DC\uB798\uADF8\uD558\uBA74 \uD68C\uC804\uD574\uC694. \uD648\uC5D0\uC11C \uC624\uB298 \uD750\uB984\uACFC \uB0A0\uC9DC\uBCC4 \uB0B4\uC6A9\uC744 \uD568\uAED8 \uBCFC \uC218 \uC788\uC5B4\uC694."
          }
        </Text>
      </View>

      <View style={styles.sheet}>
        <SectionHeader
          title={`${formatMonthDay(nowMonthDate())} \uD1B5\uACC4`}
          caption={"\uACF5\uD1B5 \uC815\uBCF4\uB294 \uD648\uC5D0\uC11C\uB9CC \uD655\uC778\uD574\uC694"}
        />
        <StatsRow
          items={[
            { label: "\uB808\uBCA8", value: `LV ${state.level}` },
            { label: "\uC624\uB298 XP", value: `${dailyProgress}%` },
            { label: "\uC644\uB8CC \uC218", value: `${state.count}\uD68C` },
          ]}
        />

        <SectionHeader
          title={"\uB0A0\uC9DC"}
          caption={"\uB0A0\uC9DC\uB97C \uB204\uB974\uBA74 \uADF8\uB0A0\uC758 \uC815\uBCF4\uC640 \uAE30\uB85D\uC774 \uD3BC\uCCD0\uC838\uC694"}
        />
        <DateAccordion items={datePanels} expandedId={expandedDateId} onToggle={onExpandDate} />
      </View>
    </>
  );
}

function TodayTab({ state, onAction }) {
  return (
    <>
      <SectionHeader
        title={"\uC2E4\uD589 \uBC84\uD2BC"}
        caption={"\uD589\uB3D9\uC744 \uB204\uB974\uBA74 \uAE30\uB85D\uACFC \uACBD\uD5D8\uCE58\uAC00 \uC313\uC5EC\uC694"}
      />
      <View style={styles.actionGrid}>
        {ACTION_LIST.map((action) => {
          const used = state.actionCounts[action.id] ?? 0;
          const limit = action.dailyLimit ?? 3;
          const disabled = used >= limit;

          return (
            <ActionCard
              key={action.id}
              title={action.label}
              help={COPY.actionHelp[action.id]}
              xp={action.points}
              countText={`${used}/${limit}`}
              disabled={disabled}
              onPress={() => onAction(action)}
            />
          );
        })}
      </View>

      <SectionHeader
        title={"\uCD5C\uADFC \uAE30\uB85D"}
        caption={"\uBC29\uAE08 \uB204\uB978 \uACB0\uACFC\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD574\uC694"}
      />
      <ContentCard>
        <Text style={styles.logText}>{state.log}</Text>
        <View style={styles.historyList}>
          {state.history.length === 0 ? (
            <Text style={styles.emptyText}>
              {"\uC544\uC9C1 \uAE30\uB85D\uC774 \uC5C6\uC5B4\uC694. \uBC84\uD2BC\uC744 \uB20C\uB7EC \uC2DC\uC791\uD574\uBCF4\uC138\uC694."}
            </Text>
          ) : (
            state.history.map((item) => (
              <HistoryRow
                key={item.id}
                title={item.label}
                meta={`${COPY.category[item.category]} \u00B7 ${item.earned} XP`}
              />
            ))
          )}
        </View>
      </ContentCard>
    </>
  );
}

function FocusTab({ state, onAction }) {
  const focusAction = ACTIONS.focusSession;
  const reflectionAction = ACTIONS.reflection;
  const tidyAction = ACTIONS.tidyReset;

  return (
    <>
      <SectionHeader
        title={"\uC9D1\uC911 \uC2E4\uD589"}
        caption={"\uBAB0\uC785\uACFC \uD68C\uACE0\uC5D0 \uB9DE\uCD98 \uBE60\uB978 \uC2E4\uD589 \uC601\uC5ED"}
      />
      <View style={styles.focusStack}>
        <WideActionCard
          title={"\uC9D1\uC911 \uC138\uC158 \uC644\uB8CC"}
          subtitle={"25\uBD84 \uBAB0\uC785 \uD6C4 \uB20C\uB7EC\uC11C \uAE30\uB85D"}
          countText={`${state.actionCounts[focusAction.id] ?? 0}/${focusAction.dailyLimit}`}
          disabled={(state.actionCounts[focusAction.id] ?? 0) >= focusAction.dailyLimit}
          onPress={() => onAction(focusAction)}
        />
        <View style={styles.secondaryActionRow}>
          <MiniActionCard
            title={"\uD558\uB8E8 \uD68C\uACE0"}
            countText={`${state.actionCounts[reflectionAction.id] ?? 0}/${reflectionAction.dailyLimit}`}
            disabled={(state.actionCounts[reflectionAction.id] ?? 0) >= reflectionAction.dailyLimit}
            onPress={() => onAction(reflectionAction)}
          />
          <MiniActionCard
            title={"\uC815\uB9AC \uB9AC\uC14B"}
            countText={`${state.actionCounts[tidyAction.id] ?? 0}/${tidyAction.dailyLimit}`}
            disabled={(state.actionCounts[tidyAction.id] ?? 0) >= tidyAction.dailyLimit}
            onPress={() => onAction(tidyAction)}
          />
        </View>
      </View>

      <SectionHeader
        title={"\uC9D1\uC911 \uD1B5\uACC4"}
        caption={"\uC9D1\uC911 \uCE74\uD14C\uACE0\uB9AC\uC758 \uD750\uB984\uB9CC \uB530\uB85C \uBD10\uC694"}
      />
      <ContentCard>
        <MetricBar label={"\uC9D1\uC911 XP"} value={state.categoryTotals.focus} max={CATEGORY_LIMITS.focus} />
        <MetricBar label={"\uB9C8\uC74C XP"} value={state.categoryTotals.mind} max={CATEGORY_LIMITS.mind} />
        <MetricBar label={"\uC0DD\uD65C XP"} value={state.categoryTotals.life} max={CATEGORY_LIMITS.life} />
      </ContentCard>
    </>
  );
}

function JourneyTab({ state }) {
  return (
    <>
      <SectionHeader
        title={"\uC131\uC7A5 \uD1B5\uACC4"}
        caption={"\uB204\uC801 \uACB0\uACFC\uC640 \uCD5C\uADFC \uC774\uB825\uC744 \uBCF4\uB294 \uC601\uC5ED"}
      />
      <ContentCard>
        <StatsRow
          items={[
            { label: "\uCD1D XP", value: `${state.exp}` },
            { label: "\uC624\uB298 XP", value: `${state.dailyExp}` },
            { label: "\uC0C1\uD0DC", value: state.mood },
          ]}
        />
      </ContentCard>

      <SectionHeader
        title={"\uAE30\uB85D \uC774\uB825"}
        caption={"\uD589\uB3D9 \uC21C\uC11C\uB300\uB85C \uC313\uC778 \uB0B4\uC6A9\uC744 \uD655\uC778\uD574\uC694"}
      />
      <ContentCard>
        {state.history.length === 0 ? (
          <Text style={styles.emptyText}>{"\uC544\uC9C1 \uC313\uC778 \uAE30\uB85D\uC774 \uC5C6\uC5B4\uC694."}</Text>
        ) : (
          state.history.map((item) => (
            <HistoryRow
              key={item.id}
              title={item.label}
              meta={`${COPY.category[item.category]} \u00B7 ${item.earned} XP`}
            />
          ))
        )}
      </ContentCard>
    </>
  );
}

function AvatarTab({ state, selectedMood, selectedTheme, onMoodChange, onThemeChange }) {
  return (
    <>
      <SectionHeader
        title={"\uCE90\uB9AD\uD130 \uBC18\uC751"}
        caption={"\uBB34\uB4DC\uC640 \uD14C\uB9C8\uB97C \uBBF8\uB9AC \uBCF4\uB294 \uC120\uD0DD\uD615 \uC601\uC5ED"}
      />
      <ContentCard>
        <Text style={styles.subLabel}>{"\uBB34\uB4DC \uC120\uD0DD"}</Text>
        <View style={styles.selectionRow}>
          {COPY.moodOptions.map((item) => (
            <SelectionChip
              key={item.id}
              label={item.label}
              active={selectedMood === item.id}
              onPress={() => onMoodChange(item.id)}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>{"\uBC30\uACBD \uD14C\uB9C8"}</Text>
        <View style={styles.selectionRow}>
          {COPY.themeOptions.map((item) => (
            <SelectionChip
              key={item.id}
              label={item.label}
              active={selectedTheme === item.id}
              onPress={() => onThemeChange(item.id)}
            />
          ))}
        </View>
      </ContentCard>

      <SectionHeader
        title={"\uC131\uC7A5 \uBC29\uD5A5"}
        caption={"\uB2E4\uC74C \uD574\uAE08 \uD3EC\uC778\uD2B8\uB97C \uBCF4\uB294 \uC601\uC5ED"}
      />
      <ContentCard>
        <HistoryRow title={"\uD604\uC7AC \uB808\uBCA8"} meta={`LV ${state.level} \u00B7 ${state.title}`} />
        <HistoryRow
          title={"\uB2E4\uC74C \uBCF4\uC0C1"}
          meta={"\uC758\uC0C1 \uD1A4 \uBCC0\uD654 \u00B7 \uD45C\uC815 \uC138\uD2B8 \u00B7 \uBC30\uACBD \uC18C\uD488"}
        />
      </ContentCard>
    </>
  );
}

function SectionHeader({ title, caption }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCaption}>{caption}</Text>
    </View>
  );
}

function StatsRow({ items }) {
  return (
    <View style={styles.statsRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.statCard}>
          <Text style={styles.statLabel}>{item.label}</Text>
          <Text style={styles.statValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

function ContentCard({ children }) {
  return <View style={styles.contentCard}>{children}</View>;
}

function ActionCard({ title, help, xp, countText, disabled, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionCard,
        disabled && styles.actionCardDisabled,
        pressed && !disabled && styles.actionCardPressed,
      ]}
    >
      <View style={styles.actionCardTop}>
        <Text style={[styles.actionCardTitle, disabled && styles.actionCardTitleDisabled]}>
          {title}
        </Text>
        <View style={[styles.countBadge, disabled && styles.countBadgeDisabled]}>
          <Text style={[styles.countBadgeText, disabled && styles.countBadgeTextDisabled]}>
            {countText}
          </Text>
        </View>
      </View>
      <Text style={[styles.actionHelp, disabled && styles.actionHelpDisabled]}>{help}</Text>
      <View style={styles.actionFooter}>
        <Text style={[styles.actionXp, disabled && styles.actionXpDisabled]}>+{xp} XP</Text>
        <Text style={[styles.actionState, disabled && styles.actionStateDisabled]}>
          {disabled ? "\uC624\uB298 \uC644\uB8CC" : "\uB20C\uB7EC\uC11C \uAE30\uB85D"}
        </Text>
      </View>
    </Pressable>
  );
}

function WideActionCard({ title, subtitle, countText, disabled, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wideActionCard,
        disabled && styles.actionCardDisabled,
        pressed && !disabled && styles.actionCardPressed,
      ]}
    >
      <View style={styles.actionCardTop}>
        <Text style={[styles.wideActionTitle, disabled && styles.actionCardTitleDisabled]}>
          {title}
        </Text>
        <View style={[styles.countBadge, disabled && styles.countBadgeDisabled]}>
          <Text style={[styles.countBadgeText, disabled && styles.countBadgeTextDisabled]}>
            {countText}
          </Text>
        </View>
      </View>
      <Text style={[styles.wideActionSubtitle, disabled && styles.actionHelpDisabled]}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function MiniActionCard({ title, countText, disabled, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.miniActionCard,
        disabled && styles.actionCardDisabled,
        pressed && !disabled && styles.actionCardPressed,
      ]}
    >
      <Text style={[styles.miniActionTitle, disabled && styles.actionCardTitleDisabled]}>
        {title}
      </Text>
      <View style={[styles.countBadge, disabled && styles.countBadgeDisabled]}>
        <Text style={[styles.countBadgeText, disabled && styles.countBadgeTextDisabled]}>
          {countText}
        </Text>
      </View>
    </Pressable>
  );
}

function MetricBar({ label, value, max }) {
  const ratio = Math.max(0, Math.min(1, value / max));

  return (
    <View style={styles.metricBlock}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{`${value}/${max}`}</Text>
      </View>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
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

function SelectionChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectionChip,
        active && styles.selectionChipActive,
        pressed && styles.selectionChipPressed,
      ]}
    >
      <Text style={[styles.selectionChipText, active && styles.selectionChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function InfoBadge({ text }) {
  return (
    <View style={styles.infoBadge}>
      <Text style={styles.infoBadgeText}>{text}</Text>
    </View>
  );
}

function getHeroStatus(dailyExp) {
  if (dailyExp >= 70) {
    return "\uC624\uB298 \uD750\uB984\uC774 \uC88B\uC544\uC694. \uD55C \uBC88\uB9CC \uB354 \uD589\uB3D9\uD558\uBA74 \uC131\uC7A5 \uD3ED\uC774 \uCEE4\uC838\uC694.";
  }

  if (dailyExp >= 35) {
    return "\uB9AC\uB4EC\uC774 \uC62C\uB77C\uC624\uACE0 \uC788\uC5B4\uC694. \uC9C0\uAE08 \uD150\uC158\uC744 \uC774\uC5B4\uAC00\uBA74 \uC88B\uC544\uC694.";
  }

  return "\uC791\uC740 \uD589\uB3D9 \uD558\uB098\uB9CC \uC2DC\uC791\uD574\uB3C4 \uCE90\uB9AD\uD130\uAC00 \uBC14\uB85C \uBC18\uC751\uD558\uAC8C \uB9CC\uB4E4\uC5B4\uC694.";
}

function formatHeaderDate(date) {
  return `${date.getFullYear()}\uB144 ${date.getMonth() + 1}\uC6D4 ${date.getDate()}\uC77C`;
}

function nowMonthDate() {
  return new Date();
}

function formatMonthDay(date) {
  return `${date.getMonth() + 1}\uC6D4 ${date.getDate()}\uC77C`;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  appShell: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
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
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoBadgeText: {
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
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
  },
  sheet: {
    marginTop: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#243247",
    fontSize: 20,
    fontWeight: "900",
  },
  sectionCaption: {
    marginTop: 4,
    color: "#8a94a2",
    fontSize: 12,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#eef1f5",
    borderWidth: 1,
    borderColor: "#dde2ea",
  },
  statLabel: {
    color: "#738196",
    fontSize: 11,
    fontWeight: "800",
  },
  statValue: {
    marginTop: 6,
    color: "#243247",
    fontSize: 18,
    fontWeight: "900",
  },
  contentCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6e0d7",
  },
  actionGrid: {
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#243247",
    borderWidth: 1,
    borderColor: "#243247",
  },
  actionCardDisabled: {
    backgroundColor: "#dfe4eb",
    borderColor: "#d8dde6",
  },
  actionCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  actionCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  actionCardTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  actionCardTitleDisabled: {
    color: "#677487",
  },
  countBadge: {
    minWidth: 52,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  countBadgeDisabled: {
    backgroundColor: "#f4f6f9",
  },
  countBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  countBadgeTextDisabled: {
    color: "#6f7d90",
  },
  actionHelp: {
    marginTop: 10,
    color: "#cfd7e5",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  actionHelpDisabled: {
    color: "#7b8797",
  },
  actionFooter: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionXp: {
    color: "#ffdfbe",
    fontSize: 13,
    fontWeight: "900",
  },
  actionXpDisabled: {
    color: "#8a94a2",
  },
  actionState: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  actionStateDisabled: {
    color: "#6f7d90",
  },
  focusStack: {
    gap: 10,
    marginBottom: 14,
  },
  wideActionCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#243247",
    borderWidth: 1,
    borderColor: "#243247",
  },
  wideActionTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
  },
  wideActionSubtitle: {
    marginTop: 8,
    color: "#d6deea",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  miniActionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7deea",
  },
  miniActionTitle: {
    marginBottom: 12,
    color: "#243247",
    fontSize: 15,
    fontWeight: "900",
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
  logText: {
    color: "#4f5c70",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  historyList: {
    marginTop: 10,
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
  emptyText: {
    color: "#7d8797",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  subLabel: {
    marginBottom: 10,
    color: "#7a8798",
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
  selectionChipPressed: {
    transform: [{ scale: 0.98 }],
  },
  selectionChipText: {
    color: "#59687d",
    fontSize: 13,
    fontWeight: "900",
  },
  selectionChipTextActive: {
    color: "#ffffff",
  },
});
