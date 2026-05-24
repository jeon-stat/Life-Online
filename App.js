import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { CharacterStage } from "./src/CharacterStage";
import { CHARACTER_CLASSES } from "./src/characters.js";
import { ACTION_LIST, CATEGORY_LIMITS, DAILY_EXP_CAP, applyAction, createGameState } from "./src/game.js";
import { STAGE_LAYOUT } from "./src/scene/stageConfig.js";
import { ActionGrid } from "./src/ui/ActionGrid.js";
import { BottomTabs } from "./src/ui/BottomTabs.js";
import { StatRow } from "./src/ui/StatRow.js";

const NAV_ITEMS = [
  { id: "today", label: "Today", icon: "O" },
  { id: "focus", label: "Focus", icon: "[]" },
  { id: "journey", label: "Journey", icon: "~" },
  { id: "avatar", label: "Avatar", icon: "*" },
];

const TODAY_PLAN = [
  { id: "morning", title: "아침 리셋", text: "기상 후 물, 햇빛, 가벼운 정리로 하루 시작" },
  { id: "focus", title: "집중 블록", text: "25~50분 깊은 집중 세션 1회 이상 달성" },
  { id: "night", title: "밤 마감", text: "수면 준비와 회고로 하루를 부드럽게 종료" },
];

const FOCUS_STACK = [
  { title: "오늘의 메인 세션", detail: "오전 9:00 - 10:00 / 공부 또는 딥워크 1회" },
  { title: "집중 규칙", detail: "허용 앱만 사용, 끝나면 한 줄 회고 남기기" },
  { title: "권장 흐름", detail: "25분 집중 -> 5분 쉬기 -> 25분 집중" },
];

const AVATAR_UNLOCKS = [
  { level: 2, reward: "기본 의상 색상 해금" },
  { level: 3, reward: "표정 변화와 모션 강화" },
  { level: 4, reward: "방 배경 슬롯 해금" },
  { level: 5, reward: "작은 펫 또는 소품 해금" },
];

export default function App() {
  const [state, setState] = useState(() => createGameState());
  const [selectedId] = useState(CHARACTER_CLASSES[0]?.id ?? "pongo");
  const [activeTab, setActiveTab] = useState("today");
  const [isStageDragging, setIsStageDragging] = useState(false);

  const selectedCharacter =
    CHARACTER_CLASSES.find((item) => item.id === selectedId) ?? CHARACTER_CLASSES[0];

  const dailyProgress = Math.round((state.dailyExp / DAILY_EXP_CAP) * 100);
  const nextLevelExp = state.level * 60;
  const levelProgress = Math.round(((state.exp % 60) / 60) * 100);

  const avatarStage = useMemo(() => {
    if (state.level >= 5) return "빛나는 성장형";
    if (state.level >= 3) return "루틴 안정형";
    return "새싹 시작형";
  }, [state.level]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appShell}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!isStageDragging}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <View style={styles.topbar}>
              <View>
                <Text style={styles.brand}>Life Online</Text>
                <Text style={styles.brandSub}>Healthy growth game prototype · build 2026-05-24-b</Text>
              </View>
              <View style={styles.levelPill}>
                <Text style={styles.levelText}>LV {state.level}</Text>
              </View>
            </View>

            {activeTab === "today" ? (
              <TodayTab
                character={selectedCharacter}
                dailyProgress={dailyProgress}
                levelProgress={levelProgress}
                nextLevelExp={nextLevelExp}
                state={state}
                onAction={(action) => setState((current) => applyAction(current, action))}
                onInteractionChange={setIsStageDragging}
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
                character={selectedCharacter}
                state={state}
                avatarStage={avatarStage}
                onInteractionChange={setIsStageDragging}
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

function TodayTab({ character, dailyProgress, levelProgress, nextLevelExp, state, onAction, onInteractionChange }) {
  return (
    <>
      <Text style={styles.heading}>오늘의 성장</Text>
      <Text style={styles.subtitle}>{character.label}</Text>
      <Text style={styles.blurb}>
        현실에서 실제 도움이 되는 행동을 채우고, 하루 XP 상한 안에서 균형 있게 성장하세요.
      </Text>

      <SectionCard style={styles.heroCard}>
        <View style={[styles.heroStage, { height: STAGE_LAYOUT.heroHeight }]}>
          <CharacterStage character={character} onInteractionChange={onInteractionChange} />
        </View>
        <Text style={styles.helperText}>
          캐릭터 주변을 드래그해서 회전할 수 있어요. 성장 표현은 레벨과 해금 요소로 확장됩니다.
        </Text>
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="DAILY LOOP" title="오늘의 성장 바" />
        <ProgressBar value={dailyProgress} />
        <Text style={styles.progressCopy}>오늘 성장치 {state.dailyExp} / {DAILY_EXP_CAP}</Text>
        <ProgressBar value={levelProgress} tone="dark" />
        <Text style={styles.progressCopy}>다음 레벨 목표 총 XP {nextLevelExp}</Text>
      </SectionCard>

      <View style={styles.surface}>
        <StatRow
          items={[
            { label: "XP TODAY", value: `${state.dailyExp}` },
            { label: "MOOD", value: state.mood },
            { label: "ACTIONS", value: String(state.count) },
          ]}
        />
      </View>

      <SectionCard>
        <SectionLabel overline="PLAN" title="오늘 추천 루틴" />
        {TODAY_PLAN.map((item) => (
          <InfoRow key={item.id} title={item.title} text={item.text} />
        ))}
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="VERIFY" title="현실 행동 기록" />
        <ActionGrid actions={ACTION_LIST} onAction={onAction} />
        <Text style={styles.smallNote}>
          프로토타입에서는 버튼으로 시뮬레이션하지만, 실제 서비스는 자동/반자동 인증 구조를 목표로 합니다.
        </Text>
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="STATUS" title="지금의 한 줄 로그" />
        <Text style={styles.logText}>{state.log}</Text>
      </SectionCard>
    </>
  );
}

function FocusTab({ state, onAction }) {
  return (
    <>
      <Text style={styles.heading}>집중</Text>
      <Text style={styles.blurb}>
        공부를 직접 증명하려 하기보다, 집중 세션과 끝난 뒤의 짧은 회고를 중심으로 설계합니다.
      </Text>

      <SectionCard>
        <SectionLabel overline="FOCUS LOOP" title="오늘의 집중 설계" />
        {FOCUS_STACK.map((item) => (
          <InfoRow key={item.title} title={item.title} text={item.detail} />
        ))}
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="READY" title="지금 할 수 있는 세션" />
        <View style={styles.focusActionRow}>
          <PrimaryAction
            title="집중 세션 완료"
            subtitle="25~50분 딥워크 보상"
            onPress={() => onAction(ACTION_LIST.find((item) => item.id === "focusSession"))}
          />
          <PrimaryAction
            title="하루 회고 남기기"
            subtitle="세션 종료 후 기록"
            onPress={() => onAction(ACTION_LIST.find((item) => item.id === "reflection"))}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="RULES" title="향후 인증 구조" />
        <InfoRow title="자동" text="타이머, 앱 사용 패턴, 세션 길이 데이터를 함께 반영" />
        <InfoRow title="반자동" text="시작 전에 목표를 정하고, 종료 후 한 줄 회고를 남김" />
        <InfoRow title="악용 방지" text="같은 세션 반복 보상 감소, 하루 카테고리 상한 적용" />
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="PROGRESS" title="오늘의 집중 누적" />
        <Text style={styles.bigMetric}>{state.categoryTotals.focus} / {CATEGORY_LIMITS.focus}</Text>
        <Text style={styles.smallNote}>Focus 카테고리는 하루 최대 30 XP까지 반영됩니다.</Text>
      </SectionCard>
    </>
  );
}

function JourneyTab({ state }) {
  return (
    <>
      <Text style={styles.heading}>기록</Text>
      <Text style={styles.blurb}>
        단순한 통계보다, 내가 어떻게 살았는지 돌아볼 수 있는 라이프로그가 중요합니다.
      </Text>

      <SectionCard>
        <SectionLabel overline="BALANCE" title="카테고리 성장 현황" />
        <CategoryMeter label="Body" value={state.categoryTotals.body} limit={CATEGORY_LIMITS.body} />
        <CategoryMeter label="Focus" value={state.categoryTotals.focus} limit={CATEGORY_LIMITS.focus} />
        <CategoryMeter label="Mind" value={state.categoryTotals.mind} limit={CATEGORY_LIMITS.mind} />
        <CategoryMeter label="Life" value={state.categoryTotals.life} limit={CATEGORY_LIMITS.life} />
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="TIMELINE" title="최근 완료 기록" />
        {state.history.length === 0 ? (
          <Text style={styles.emptyCopy}>아직 오늘의 행동 기록이 없어요.</Text>
        ) : (
          state.history.map((item) => (
            <InfoRow
              key={item.id}
              title={`${item.label} +${item.earned}`}
              text={`${item.category.toUpperCase()} 카테고리에 반영됨`}
            />
          ))
        )}
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="REFLECTION" title="주간 리포트 방향" />
        <InfoRow title="균형 점수" text="한 가지 반복보다 여러 카테고리를 채우는 날을 더 높게 평가" />
        <InfoRow title="회복 흐름" text="낮은 에너지 날에도 작은 행동으로 이어갈 수 있는 설계" />
        <InfoRow title="기억 보관" text="사진, 한 줄 회고, 감정 흐름이 추억처럼 쌓이는 구조" />
      </SectionCard>
    </>
  );
}

function AvatarTab({ character, state, avatarStage, onInteractionChange }) {
  return (
    <>
      <Text style={styles.heading}>아바타</Text>
      <Text style={styles.blurb}>
        처음에는 하나의 기본 캐릭터에 집중하고, 레벨과 플레이 스타일에 따라 진화와 꾸미기를 해금합니다.
      </Text>

      <SectionCard style={styles.heroCard}>
        <View style={[styles.heroStage, { height: STAGE_LAYOUT.heroHeight }]}>
          <CharacterStage character={character} onInteractionChange={onInteractionChange} />
        </View>
        <Text style={styles.helperText}>현재 성장 단계: {avatarStage}</Text>
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="EVOLUTION" title="다음 성장 보상" />
        {AVATAR_UNLOCKS.map((item) => (
          <InfoRow
            key={item.level}
            title={`LV ${item.level}`}
            text={item.reward + (state.level >= item.level ? " · 해금됨" : " · 잠금 중")}
          />
        ))}
      </SectionCard>

      <SectionCard>
        <SectionLabel overline="STYLE" title="장기 방향" />
        <InfoRow title="초기" text="하나의 캐릭터를 완성도 있게 키우고 표정과 실루엣을 진화" />
        <InfoRow title="중기" text="헤어, 의상, 방 배경, 작은 소품을 해금" />
        <InfoRow title="후기" text="행동 패턴에 따라 성향형 진화 분기와 시즌 꾸미기 확장" />
      </SectionCard>
    </>
  );
}

function SectionCard({ children, style }) {
  return <View style={[styles.surfaceCard, style]}>{children}</View>;
}

function SectionLabel({ overline, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.overline}>{overline}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({ title, text }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function ProgressBar({ value, tone = "light" }) {
  return (
    <View style={[styles.progressTrack, tone === "dark" && styles.progressTrackDark]}>
      <View
        style={[
          styles.progressFill,
          tone === "dark" && styles.progressFillDark,
          { width: `${Math.max(6, Math.min(100, value))}%` },
        ]}
      />
    </View>
  );
}

function PrimaryAction({ title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}>
      <Text style={styles.primaryActionTitle}>{title}</Text>
      <Text style={styles.primaryActionText}>{subtitle}</Text>
    </Pressable>
  );
}

function CategoryMeter({ label, value, limit }) {
  return (
    <View style={styles.categoryMeter}>
      <View style={styles.categoryMeterTop}>
        <Text style={styles.categoryLabel}>{label}</Text>
        <Text style={styles.categoryValue}>{value} / {limit}</Text>
      </View>
      <ProgressBar value={(value / limit) * 100} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  appShell: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#f5f7fb",
  },
  screen: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#f5f7fb",
  },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    color: "#243042",
    fontSize: 14,
    fontWeight: "900",
  },
  brandSub: {
    marginTop: 2,
    color: "#7a8799",
    fontSize: 12,
    fontWeight: "700",
  },
  levelPill: {
    minWidth: 84,
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
    lineHeight: 22,
    maxWidth: 360,
  },
  surface: {
    marginTop: 10,
  },
  surfaceCard: {
    marginTop: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e7edf4",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heroCard: {
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  heroStage: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  overline: {
    color: "#7c8796",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  sectionTitle: {
    marginTop: 4,
    color: "#1f2c42",
    fontSize: 20,
    fontWeight: "800",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#eaf0f6",
    overflow: "hidden",
    marginTop: 6,
  },
  progressTrackDark: {
    backgroundColor: "#e8ecf3",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7fb1ff",
  },
  progressFillDark: {
    backgroundColor: "#27364d",
  },
  progressCopy: {
    marginTop: 8,
    marginBottom: 6,
    color: "#657286",
    fontSize: 13,
    fontWeight: "700",
  },
  helperText: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    color: "#6a7585",
    fontSize: 13,
    lineHeight: 18,
  },
  smallNote: {
    marginTop: 12,
    color: "#778597",
    fontSize: 12,
    lineHeight: 17,
  },
  logText: {
    color: "#5d6879",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  infoRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  infoTitle: {
    color: "#243042",
    fontSize: 15,
    fontWeight: "800",
  },
  infoText: {
    marginTop: 4,
    color: "#667487",
    fontSize: 13,
    lineHeight: 19,
  },
  focusActionRow: {
    gap: 10,
  },
  primaryAction: {
    borderRadius: 18,
    backgroundColor: "#27364d",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  primaryActionPressed: {
    opacity: 0.9,
  },
  primaryActionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  primaryActionText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 17,
  },
  bigMetric: {
    color: "#1f2c42",
    fontSize: 34,
    fontWeight: "900",
  },
  categoryMeter: {
    marginTop: 8,
  },
  categoryMeterTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryLabel: {
    color: "#243042",
    fontSize: 14,
    fontWeight: "800",
  },
  categoryValue: {
    color: "#6b7888",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCopy: {
    color: "#778597",
    fontSize: 13,
    lineHeight: 18,
  },
});
