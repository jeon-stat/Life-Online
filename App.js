import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import { ACTION_LIST, CATEGORY_LIMITS, DAILY_EXP_CAP, applyAction, createGameState } from "./src/game.js";
import { BottomTabs } from "./src/ui/BottomTabs.js";

const NAV_ITEMS = [
  { id: "today", label: "오늘", icon: "H" },
  { id: "focus", label: "집중", icon: "F" },
  { id: "journey", label: "기록", icon: "J" },
  { id: "avatar", label: "꾸미기", icon: "A" },
];

const ACTION_HELP = {
  walkGoal: "가벽게 몸을 깨우는 기본 행동",
  focusSession: "25분 동안 한 가지에 몰입",
  windDown: "밤 루틴을 정리하는 행동",
  tidyReset: "공간을 비우고 다시 시작",
  reflection: "오늘을 한 줄로 남기기",
};

const CATEGORY_COPY = {
  body: "바디",
  focus: "집중",
  mind: "마음",
  life: "생활",
};

const MOOD_OPTIONS = [
  { id: "soft", label: "차분" },
  { id: "bright", label: "상쾌" },
  { id: "spark", label: "활기" },
];

const THEME_OPTIONS = [
  { id: "morning", label: "아침" },
  { id: "study", label: "공부" },
  { id: "rest", label: "휴식" },
];

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [activeTab, setActiveTab] = useState("today");
  const [isStageDragging, setIsStageDragging] = useState(false);
  const [selectedMood, setSelectedMood] = useState("soft");
  const [selectedTheme, setSelectedTheme] = useState("morning");

  const character = CHARACTER_CLASSES[0];
  const calendar = useMemo(() => buildCalendar(new Date()), []);
  const dailyProgress = Math.round((state.dailyExp / DAILY_EXP_CAP) * 100);

  const heroStatus = useMemo(() => {
    if (state.dailyExp >= 70) {
      return "오늘 흐름이 좋아요. 한 번만 더 행동하면 성장 폭이 커져요.";
    }
    if (state.dailyExp >= 35) {
      return "리듬이 올라오고 있어요. 지금 텐션을 이어가면 좋아요.";
    }
    return "작은 행동 하나만 시작해도 캐릭터가 바로 반응하게 만들어요.";
  }, [state.dailyExp]);

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
            dailyProgress={dailyProgress}
            calendar={calendar}
            statusCopy={heroStatus}
            onInteractionChange={setIsStageDragging}
          />

          <View style={styles.sheet}>
            <SectionHeader
              title="오늘 통계"
              caption="누르는 버튼이 아니라 상태를 보는 영역"
            />
            <StatsRow
              items={[
                { label: "레벨", value: `LV ${state.level}` },
                { label: "오늘 XP", value: `${dailyProgress}%` },
                { label: "완료 수", value: `${state.count}회` },
              ]}
            />

            <CalendarCard calendar={calendar} />

            {activeTab === "today" ? (
              <TodayTab state={state} onAction={(action) => setState((current) => applyAction(current, action))} />
            ) : null}

            {activeTab === "focus" ? (
              <FocusTab state={state} onAction={(action) => setState((current) => applyAction(current, action))} />
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
        </ScrollView>

        <BottomTabs items={NAV_ITEMS} activeId={activeTab} onChange={setActiveTab} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function HeroSection({ character, level, dailyProgress, calendar, statusCopy, onInteractionChange }) {
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
          <Text style={styles.brandSub}>{calendar.headerDate}</Text>
        </View>
        <View style={styles.levelBubble}>
          <Text style={styles.levelBubbleText}>LV {level}</Text>
        </View>
      </View>

      <View style={styles.heroCopyBlock}>
        <Text style={styles.heroTitle}>{"내 캐릭터"}</Text>
        <Text style={styles.heroCopy}>{statusCopy}</Text>
        <View style={styles.heroBadgeRow}>
          <InfoBadge text={`오늘 XP ${dailyProgress}%`} />
          <InfoBadge text={character.label} />
        </View>
      </View>

      <View style={styles.characterStageArea}>
        <CharacterStage character={character} onInteractionChange={onInteractionChange} />
      </View>

      <Text style={styles.heroHint}>
        {
          "캐릭터를 드래그하면 회전하고, 아래로 스크롤하면 함께 움직여요."
        }
      </Text>
    </LinearGradient>
  );
}

function TodayTab({ state, onAction }) {
  return (
    <>
      <SectionHeader
        title="실행 버튼"
        caption="경험치를 쌓는 버튼 영역"
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
              help={ACTION_HELP[action.id]}
              xp={action.points}
              countText={`${used}/${limit}`}
              disabled={disabled}
              onPress={() => onAction(action)}
            />
          );
        })}
      </View>

      <SectionHeader
        title="오늘 상태"
        caption="실행 결과가 쌓이는 통계 영역"
      />
      <ContentCard>
        <MetricBar label="바디" value={state.categoryTotals.body} max={CATEGORY_LIMITS.body} />
        <MetricBar label="집중" value={state.categoryTotals.focus} max={CATEGORY_LIMITS.focus} />
        <MetricBar label="마음" value={state.categoryTotals.mind} max={CATEGORY_LIMITS.mind} />
        <MetricBar label="생활" value={state.categoryTotals.life} max={CATEGORY_LIMITS.life} />
      </ContentCard>

      <SectionHeader
        title="최근 기록"
        caption="방금 누른 결과를 확인하는 영역"
      />
      <ContentCard>
        <Text style={styles.logText}>{state.log}</Text>
        <View style={styles.historyList}>
          {state.history.length === 0 ? (
            <Text style={styles.emptyText}>
              {
                "아직 기록이 없어요. 위 버튼 중 하나를 눌러 시작해보세요."
              }
            </Text>
          ) : (
            state.history.map((item) => (
              <HistoryRow
                key={item.id}
                title={item.label}
                meta={`${CATEGORY_COPY[item.category]} · +${item.earned} XP`}
              />
            ))
          )}
        </View>
      </ContentCard>
    </>
  );
}

function FocusTab({ state, onAction }) {
  const focusAction = ACTION_LIST.find((item) => item.id === "focusSession");
  const reflectionAction = ACTION_LIST.find((item) => item.id === "reflection");
  const tidyAction = ACTION_LIST.find((item) => item.id === "tidyReset");

  return (
    <>
      <SectionHeader
        title="집중 실행"
        caption="지금 바로 누를 수 있는 핵심 버튼"
      />
      <View style={styles.focusStack}>
        <WideActionCard
          title="집중 세션 완료"
          subtitle="25분 몰입 후 눌러서 기록"
          countText={`${state.actionCounts[focusAction.id] ?? 0}/${focusAction.dailyLimit}`}
          disabled={(state.actionCounts[focusAction.id] ?? 0) >= focusAction.dailyLimit}
          onPress={() => onAction(focusAction)}
        />
        <View style={styles.secondaryActionRow}>
          <MiniActionCard
            title="하루 회고"
            countText={`${state.actionCounts[reflectionAction.id] ?? 0}/${reflectionAction.dailyLimit}`}
            disabled={(state.actionCounts[reflectionAction.id] ?? 0) >= reflectionAction.dailyLimit}
            onPress={() => onAction(reflectionAction)}
          />
          <MiniActionCard
            title="정리 리셋"
            countText={`${state.actionCounts[tidyAction.id] ?? 0}/${tidyAction.dailyLimit}`}
            disabled={(state.actionCounts[tidyAction.id] ?? 0) >= tidyAction.dailyLimit}
            onPress={() => onAction(tidyAction)}
          />
        </View>
      </View>

      <SectionHeader
        title="집중 통계"
        caption="눌리는 버튼과 구분된 결과 영역"
      />
      <ContentCard>
        <MetricBar label="집중 XP" value={state.categoryTotals.focus} max={CATEGORY_LIMITS.focus} />
        <MetricBar label="마음 XP" value={state.categoryTotals.mind} max={CATEGORY_LIMITS.mind} />
        <MetricBar label="생활 XP" value={state.categoryTotals.life} max={CATEGORY_LIMITS.life} />
      </ContentCard>
    </>
  );
}

function JourneyTab({ state }) {
  return (
    <>
      <SectionHeader
        title="성장 통계"
        caption="오늘 누적된 결과를 보는 영역"
      />
      <ContentCard>
        <StatsRow
          items={[
            { label: "총 XP", value: `${state.exp}` },
            { label: "오늘 XP", value: `${state.dailyExp}` },
            { label: "상태", value: state.mood },
          ]}
        />
      </ContentCard>

      <SectionHeader
        title="기록 이력"
        caption="행동 순서대로 확인하는 영역"
      />
      <ContentCard>
        {state.history.length === 0 ? (
          <Text style={styles.emptyText}>아직 쌓인 기록이 없어요.</Text>
        ) : (
          state.history.map((item) => (
            <HistoryRow
              key={item.id}
              title={item.label}
              meta={`${CATEGORY_COPY[item.category]} · +${item.earned} XP`}
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
        title="캐릭터 반응"
        caption="경험치와는 별개인 선택형 영역"
      />
      <ContentCard>
        <Text style={styles.subLabel}>무드 선택</Text>
        <View style={styles.selectionRow}>
          {MOOD_OPTIONS.map((item) => (
            <SelectionChip
              key={item.id}
              label={item.label}
              active={selectedMood === item.id}
              onPress={() => onMoodChange(item.id)}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>배경 테마</Text>
        <View style={styles.selectionRow}>
          {THEME_OPTIONS.map((item) => (
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
        title="성장 방향"
        caption="다음 해금 포인트를 보는 영역"
      />
      <ContentCard>
        <HistoryRow title="현재 레벨" meta={`LV ${state.level} · ${state.title}`} />
        <HistoryRow
          title="다음 보상"
          meta="의상 톤 변화 · 표정 세트 · 배경 소품"
        />
      </ContentCard>
    </>
  );
}

function CalendarCard({ calendar }) {
  return (
    <>
      <SectionHeader
        title="현재 날짜"
        caption="오늘 날짜에 맞춰 자동으로 바뀼는 영역"
      />
      <ContentCard>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>{calendar.monthLabel}</Text>
          <Text style={styles.calendarMeta}>{calendar.todayLabel}</Text>
        </View>
        <View style={styles.calendarRow}>
          {calendar.weekDays.map((item) => (
            <View key={`${item.label}-${item.day}`} style={styles.dayCol}>
              <Text style={[styles.dayLabel, item.active && styles.dayLabelActive]}>{item.label}</Text>
              <View style={[styles.dayBubble, item.active && styles.dayBubbleActive]}>
                <Text style={[styles.dayText, item.active && styles.dayTextActive]}>{item.day}</Text>
              </View>
            </View>
          ))}
        </View>
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
        <Text style={[styles.actionCardTitle, disabled && styles.actionCardTitleDisabled]}>{title}</Text>
        <View style={[styles.countBadge, disabled && styles.countBadgeDisabled]}>
          <Text style={[styles.countBadgeText, disabled && styles.countBadgeTextDisabled]}>{countText}</Text>
        </View>
      </View>
      <Text style={[styles.actionHelp, disabled && styles.actionHelpDisabled]}>{help}</Text>
      <View style={styles.actionFooter}>
        <Text style={[styles.actionXp, disabled && styles.actionXpDisabled]}>+{xp} XP</Text>
        <Text style={[styles.actionState, disabled && styles.actionStateDisabled]}>
          {disabled ? "오늘 완료" : "눌러서 기록"}
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
        <Text style={[styles.wideActionTitle, disabled && styles.actionCardTitleDisabled]}>{title}</Text>
        <View style={[styles.countBadge, disabled && styles.countBadgeDisabled]}>
          <Text style={[styles.countBadgeText, disabled && styles.countBadgeTextDisabled]}>{countText}</Text>
        </View>
      </View>
      <Text style={[styles.wideActionSubtitle, disabled && styles.actionHelpDisabled]}>{subtitle}</Text>
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
      <Text style={[styles.miniActionTitle, disabled && styles.actionCardTitleDisabled]}>{title}</Text>
      <View style={[styles.countBadge, disabled && styles.countBadgeDisabled]}>
        <Text style={[styles.countBadgeText, disabled && styles.countBadgeTextDisabled]}>{countText}</Text>
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
        <Text style={styles.metricValue}>
          {value}/{max}
        </Text>
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
      style={({ pressed }) => [styles.selectionChip, active && styles.selectionChipActive, pressed && styles.selectionChipPressed]}
    >
      <Text style={[styles.selectionChipText, active && styles.selectionChipTextActive]}>{label}</Text>
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

function buildCalendar(date) {
  const weekLabels = ["월", "화", "수", "목", "금", "토", "일"];
  const current = new Date(date);
  const day = current.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);

    return {
      label: weekLabels[index],
      day: String(next.getDate()),
      active: sameDay(next, current),
    };
  });

  return {
    headerDate: `${current.getFullYear()}년 ${current.getMonth() + 1}월 ${current.getDate()}일`,
    monthLabel: `${current.getFullYear()}년 ${current.getMonth() + 1}월`,
    todayLabel: `오늘 ${weekLabels[day === 0 ? 6 : day - 1]}`,
    weekDays,
  };
}

function sameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
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
  infoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(214, 207, 197, 0.7)",
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
  sectionHeader: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#243247",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
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
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  calendarTitle: {
    color: "#243247",
    fontSize: 18,
    fontWeight: "900",
  },
  calendarMeta: {
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
