import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import { ACTION_LIST, CATEGORY_LIMITS, DAILY_EXP_CAP, applyAction, createGameState } from "./src/game.js";
import { BottomTabs } from "./src/ui/BottomTabs.js";

const NAV_ITEMS = [
  { id: "today", label: "Today", icon: "○" },
  { id: "focus", label: "Focus", icon: "┃" },
  { id: "journey", label: "Journey", icon: "≈" },
  { id: "avatar", label: "Avatar", icon: "✦" },
];

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const DATE_ITEMS = [
  { day: "10", active: false },
  { day: "11", active: true },
  { day: "12", active: false },
  { day: "13", active: false },
  { day: "14", active: false },
  { day: "15", active: false },
  { day: "16", active: false },
];

const FOCUS_GUIDE = [
  "한 번에 하나만 끝내기",
  "25분 집중 후 5분 쉬기",
  "끝난 뒤 한 줄 회고 남기기",
];

const JOURNEY_POINTS = [
  "몸, 집중, 마음, 생활의 균형 보기",
  "오늘 한 행동이 어떤 하루를 만들었는지 기록",
  "일주일 흐름을 캐릭터 성장과 함께 보기",
];

const AVATAR_POINTS = [
  "레벨이 오르면 표정과 분위기 변화",
  "의상, 방 배경, 작은 소품 해금",
  "현실 루틴이 캐릭터 개성으로 이어짐",
];

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [activeTab, setActiveTab] = useState("today");
  const [isStageDragging, setIsStageDragging] = useState(false);

  const character = CHARACTER_CLASSES[0];
  const dailyProgress = Math.round((state.dailyExp / DAILY_EXP_CAP) * 100);

  const statusCopy = useMemo(() => {
    if (state.dailyExp >= 70) return "오늘 흐름이 아주 좋아요";
    if (state.dailyExp >= 35) return "조금씩 리듬이 올라오고 있어요";
    return "작은 행동 하나로 오늘을 시작해보세요";
  }, [state.dailyExp]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appShell}>
        <FixedCharacterBackdrop
          character={character}
          level={state.level}
          statusCopy={statusCopy}
          onInteractionChange={setIsStageDragging}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isStageDragging}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stageSpacer} />

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <TopSummaryCard level={state.level} dailyProgress={dailyProgress} statusCopy={statusCopy} />

            {activeTab === "today" ? (
              <TodayTab state={state} onAction={(action) => setState((current) => applyAction(current, action))} />
            ) : null}

            {activeTab === "focus" ? (
              <FocusTab state={state} onAction={(action) => setState((current) => applyAction(current, action))} />
            ) : null}

            {activeTab === "journey" ? <JourneyTab state={state} /> : null}

            {activeTab === "avatar" ? <AvatarTab state={state} /> : null}
          </View>
        </ScrollView>

        <BottomTabs items={NAV_ITEMS} activeId={activeTab} onChange={setActiveTab} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function FixedCharacterBackdrop({ character, level, statusCopy, onInteractionChange }) {
  return (
    <View style={styles.fixedStageLayer}>
      <LinearGradient
        colors={["#fbfaf8", "#f5f3ef", "#eef1f8"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowLarge} />
      <View style={styles.glowSmall} />

      <View style={styles.headerBar}>
        <View>
          <Text style={styles.brand}>Life Online</Text>
          <Text style={styles.brandSub}>growth companion</Text>
        </View>
        <View style={styles.levelBubble}>
          <Text style={styles.levelBubbleText}>LV {level}</Text>
        </View>
      </View>

      <View style={styles.stageCopyBlock}>
        <Text style={styles.heroTitle}>오늘의 성장</Text>
        <Text style={styles.heroSubtitle}>{character.label}</Text>
        <Text style={styles.heroCopy}>{statusCopy}</Text>
      </View>

      <View style={styles.fixedStage}>
        <CharacterStage character={character} onInteractionChange={onInteractionChange} />
      </View>
    </View>
  );
}

function TopSummaryCard({ level, dailyProgress, statusCopy }) {
  return (
    <View style={styles.summaryCard}>
      <View>
        <Text style={styles.summaryOverline}>TODAY STATUS</Text>
        <Text style={styles.summaryTitle}>{statusCopy}</Text>
      </View>
      <View style={styles.summaryRight}>
        <Text style={styles.summaryMetric}>{dailyProgress}%</Text>
        <Text style={styles.summaryMeta}>LV {level}</Text>
      </View>
    </View>
  );
}

function TodayTab({ state, onAction }) {
  return (
    <>
      <DateStrip />

      <TaskCard
        title="오늘 루프"
        tone="blue"
        items={[
          { label: "집중 세션 1회", checked: state.categoryTotals.focus > 0 },
          { label: "물 마시기", checked: false },
          { label: "짧은 회고 남기기", checked: state.categoryTotals.mind > 0 },
        ]}
      />

      <TaskCard
        title="실행 가능한 행동"
        tone="peach"
        items={ACTION_LIST.map((action) => ({
          label: action.label,
          checked: false,
          action,
        }))}
        onAction={onAction}
      />

      <SoftCard title="오늘 성장 로그" overline="RECAP">
        <Text style={styles.logText}>{state.log}</Text>
      </SoftCard>
    </>
  );
}

function FocusTab({ state, onAction }) {
  return (
    <>
      <SoftCard title="집중 플로우" overline="FOCUS">
        {FOCUS_GUIDE.map((item) => (
          <ChecklistRow key={item} label={item} checked={false} compact />
        ))}
      </SoftCard>

      <View style={styles.dualActions}>
        <ActionPill
          title="집중 세션 완료"
          meta={`${state.categoryTotals.focus}/${CATEGORY_LIMITS.focus} XP`}
          onPress={() => onAction(ACTION_LIST.find((item) => item.id === "focusSession"))}
        />
        <ActionPill
          title="하루 회고 남기기"
          meta="짧은 기록"
          onPress={() => onAction(ACTION_LIST.find((item) => item.id === "reflection"))}
        />
      </View>
    </>
  );
}

function JourneyTab({ state }) {
  return (
    <>
      <SoftCard title="오늘의 균형" overline="JOURNEY">
        <MetricRow label="Body" value={`${state.categoryTotals.body}/${CATEGORY_LIMITS.body}`} />
        <MetricRow label="Focus" value={`${state.categoryTotals.focus}/${CATEGORY_LIMITS.focus}`} />
        <MetricRow label="Mind" value={`${state.categoryTotals.mind}/${CATEGORY_LIMITS.mind}`} />
        <MetricRow label="Life" value={`${state.categoryTotals.life}/${CATEGORY_LIMITS.life}`} />
      </SoftCard>

      <SoftCard title="기록 방향" overline="NOTES">
        {JOURNEY_POINTS.map((item) => (
          <ChecklistRow key={item} label={item} checked={true} compact />
        ))}
      </SoftCard>
    </>
  );
}

function AvatarTab({ state }) {
  return (
    <>
      <SoftCard title="캐릭터 성장" overline="AVATAR">
        <Text style={styles.avatarLead}>레벨 {state.level} 기준으로 캐릭터 분위기와 꾸미기 해금이 이어집니다.</Text>
        {AVATAR_POINTS.map((item) => (
          <ChecklistRow key={item} label={item} checked={true} compact />
        ))}
      </SoftCard>
    </>
  );
}

function DateStrip() {
  return (
    <SoftCard title="2025년 2월" overline="CALENDAR">
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
    </SoftCard>
  );
}

function TaskCard({ title, tone, items, onAction }) {
  return (
    <SoftCard title={title} overline={tone === "blue" ? "TODAY" : "ACTION"} accentTone={tone}>
      {items.map((item) => (
        <ChecklistRow
          key={item.label}
          label={item.label}
          checked={item.checked}
          onPress={item.action && onAction ? () => onAction(item.action) : undefined}
        />
      ))}
    </SoftCard>
  );
}

function SoftCard({ title, overline, children, accentTone = "neutral" }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardOverline, accentTone === "blue" && styles.cardOverlineBlue, accentTone === "peach" && styles.cardOverlinePeach]}>
          {overline}
        </Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ChecklistRow({ label, checked, onPress, compact = false }) {
  const row = (
    <View style={[styles.checkRow, compact && styles.checkRowCompact]}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
      <Text style={styles.rowDots}>⋯</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.rowButton, pressed && styles.rowButtonPressed]}>
        {row}
      </Pressable>
    );
  }

  return row;
}

function ActionPill({ title, meta, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionPill, pressed && styles.rowButtonPressed]}>
      <Text style={styles.actionPillTitle}>{title}</Text>
      <Text style={styles.actionPillMeta}>{meta}</Text>
    </Pressable>
  );
}

function MetricRow({ label, value }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
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
  fixedStageLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 420,
    zIndex: 3,
    overflow: "hidden",
  },
  glowLarge: {
    position: "absolute",
    top: 92,
    right: -32,
    width: 188,
    height: 188,
    borderRadius: 999,
    backgroundColor: "rgba(244, 209, 187, 0.28)",
  },
  glowSmall: {
    position: "absolute",
    top: 170,
    left: -18,
    width: 126,
    height: 126,
    borderRadius: 999,
    backgroundColor: "rgba(184, 198, 229, 0.22)",
  },
  headerBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    color: "#253247",
    fontSize: 15,
    fontWeight: "900",
  },
  brandSub: {
    marginTop: 2,
    color: "#7d8797",
    fontSize: 11,
    fontWeight: "700",
  },
  levelBubble: {
    minWidth: 86,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#253247",
    alignItems: "center",
  },
  levelBubbleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  stageCopyBlock: {
    paddingHorizontal: 18,
    paddingTop: 18,
    maxWidth: 280,
  },
  heroTitle: {
    color: "#243042",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#253247",
    fontSize: 18,
    fontWeight: "800",
  },
  heroCopy: {
    marginTop: 8,
    color: "#697789",
    fontSize: 14,
    lineHeight: 20,
  },
  fixedStage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -12,
    height: 290,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  stageSpacer: {
    height: 300,
  },
  sheet: {
    marginTop: 8,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "rgba(248, 247, 244, 0.96)",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    minHeight: 720,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#d8d2c9",
    marginBottom: 14,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ebe5dc",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryOverline: {
    color: "#8d97a6",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  summaryTitle: {
    marginTop: 4,
    color: "#243042",
    fontSize: 17,
    fontWeight: "800",
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  summaryMetric: {
    color: "#243042",
    fontSize: 24,
    fontWeight: "900",
  },
  summaryMeta: {
    marginTop: 2,
    color: "#8a95a5",
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ebe5dc",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardHeader: {
    marginBottom: 6,
  },
  cardOverline: {
    color: "#999082",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  cardOverlineBlue: {
    color: "#7891c6",
  },
  cardOverlinePeach: {
    color: "#d29a87",
  },
  cardTitle: {
    marginTop: 4,
    color: "#283346",
    fontSize: 17,
    fontWeight: "800",
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 4,
  },
  dayCol: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    color: "#8b95a3",
    fontSize: 11,
    fontWeight: "800",
  },
  dayLabelActive: {
    color: "#5c8af7",
  },
  dayBubble: {
    marginTop: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f7",
  },
  dayBubbleActive: {
    backgroundColor: "#5c8af7",
  },
  dayText: {
    color: "#334055",
    fontSize: 13,
    fontWeight: "900",
  },
  dayTextActive: {
    color: "#ffffff",
  },
  rowButton: {
    borderRadius: 16,
  },
  rowButtonPressed: {
    opacity: 0.88,
  },
  checkRow: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#faf9f6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkRowCompact: {
    minHeight: 46,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#d3d9e4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: "#5c8af7",
    borderColor: "#5c8af7",
  },
  checkboxTick: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  checkLabel: {
    flex: 1,
    marginLeft: 10,
    color: "#2a3345",
    fontSize: 14,
    fontWeight: "700",
  },
  rowDots: {
    color: "#a9b0bc",
    fontSize: 18,
    lineHeight: 18,
  },
  dualActions: {
    marginTop: 12,
    gap: 10,
  },
  actionPill: {
    borderRadius: 22,
    backgroundColor: "#253247",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionPillTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  actionPillMeta: {
    marginTop: 4,
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "700",
  },
  metricRow: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "#faf9f6",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    color: "#2a3345",
    fontSize: 14,
    fontWeight: "800",
  },
  metricValue: {
    color: "#7d8797",
    fontSize: 12,
    fontWeight: "900",
  },
  avatarLead: {
    color: "#657286",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  logText: {
    color: "#5f6a7a",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
});
