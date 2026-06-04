import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { theme } from "../constants/theme.js";

const LONG_TERM_META = {
  WEAK: {
    label: "허약",
    description: "아직은 천천히 쉬어가며 자라는 단계예요.",
    icon: "◌",
    softBg: "#f5f5f3",
    border: "#e7e7e4",
    color: "#555555",
  },
  HEALTHY: {
    label: "건강",
    description: "안정적으로 산책을 이어가는 상태예요.",
    icon: "◎",
    softBg: "#f7f7f5",
    border: "#e7e7e4",
    color: "#111111",
  },
  ACTIVE: {
    label: "활발",
    description: "걸음과 움직임이 가볍고 생기가 넘쳐요.",
    icon: "●",
    softBg: "#f3f3f1",
    border: "#e4e4df",
    color: "#111111",
  },
};

const CUSTOMIZATION_SLOTS = [
  { key: "hair", label: "헤어" },
  { key: "clothes", label: "의상" },
  { key: "expression", label: "표정" },
  { key: "background", label: "배경" },
];

export function CharacterScreen() {
  const { today, history, goal, admin } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });

  const longTermMeta = LONG_TERM_META[viewState.longTermState] ?? LONG_TERM_META.HEALTHY;
  const growth = viewState.growth ?? {};
  const skinTones = admin?.skinTones ?? [];
  const mainActions = viewState.behavior?.mainActions ?? [];
  const specialActions = viewState.behavior?.specialActions ?? [];
  const activeActionKey = viewState.currentAction?.key ?? viewState.animationState;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>캐릭터</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>현재 상태</Text>
            <Text style={styles.heroTitle}>{viewState.statusLabel}</Text>
            <Text style={styles.heroSubtitle}>{viewState.currentAction?.label ?? viewState.animationClip}</Text>
          </View>

          <View style={[styles.stateBadge, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
            <Text style={styles.stateBadgeIcon}>{longTermMeta.icon}</Text>
            <Text style={[styles.stateBadgeLabel, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
          </View>
        </View>

        <View style={styles.heroMetrics}>
          <MetricChip label="누적" value={`${formatNumber(growth.lifetimeSteps ?? 0)}보`} />
          <MetricChip label="연속" value={`${growth.streak ?? 0}일`} />
          <MetricChip label="달성" value={`${growth.achievedDays ?? 0}일`} />
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="장기 상태" />
        <View style={[styles.longTermBanner, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
          <Text style={styles.longTermIcon}>{longTermMeta.icon}</Text>
          <View style={styles.longTermCopy}>
            <Text style={[styles.longTermBannerLabel, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
            <Text style={styles.longTermBannerDescription}>{longTermMeta.description}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="성장 기록" />
        <View style={styles.metricGrid}>
          <MetricCard label="누적 걸음" value={`${formatNumber(growth.lifetimeSteps ?? 0)}보`} />
          <MetricCard label="달성일" value={`${growth.achievedDays ?? 0}일`} />
          <MetricCard label="연속일" value={`${growth.streak ?? 0}일`} />
          <MetricCard label="성장 단계" value={growth.growthLabel ?? "성장 중"} />
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="획득한 행동" />
        <View style={styles.actionGrid}>
          {mainActions.map((action) => (
            <ActionChip key={action.key} label={action.label} active={action.key === activeActionKey} />
          ))}
          {specialActions.map((action) => (
            <ActionChip key={action.key} label={action.label} active={action.key === activeActionKey} muted />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="피부 톤" />
        <View style={styles.skinToneGrid}>
          {skinTones.map((tone) => {
            const selected = admin?.skinToneId === tone.id;

            return (
              <Pressable
                key={tone.id}
                onPress={() => admin?.setSkinTone?.(tone.id)}
                style={[styles.skinToneChip, selected && styles.skinToneChipSelected]}
              >
                <View style={[styles.skinToneSwatch, { backgroundColor: tone.color }]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="꾸미기" />
        <View style={styles.customizationGrid}>
          {CUSTOMIZATION_SLOTS.map((slot) => (
            <View key={slot.key} style={styles.placeholderCard}>
              <Text style={styles.placeholderLabel}>{slot.label}</Text>
              <Text style={styles.placeholderNote}>준비 중</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function MetricChip({ label, value }) {
  return (
    <View style={styles.metricChip}>
      <Text style={styles.metricChipLabel}>{label}</Text>
      <Text style={styles.metricChipValue}>{value}</Text>
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ActionChip({ label, active = false, muted = false }) {
  return (
    <View style={[styles.actionChip, active && styles.actionChipActive, muted && styles.actionChipMuted]}>
      <Text style={[styles.actionChipLabel, active && styles.actionChipLabelActive]}>{label}</Text>
    </View>
  );
}

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ko-KR");
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
  pageTitleWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  pageTitle: {
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.6,
    fontFamily: theme.fonts.display,
  },
  heroCard: {
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 14,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroKicker: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontFamily: theme.fonts.body,
  },
  heroTitle: {
    color: theme.colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  heroSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  stateBadge: {
    minWidth: 96,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 2,
    alignItems: "flex-start",
  },
  stateBadgeIcon: {
    fontSize: 14,
    fontWeight: "900",
  },
  stateBadgeLabel: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  heroMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricChip: {
    flex: 1,
    minWidth: "30%",
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  metricChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  metricChipValue: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  card: {
    borderRadius: theme.radius.xl,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  longTermBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
  },
  longTermIcon: {
    fontSize: 22,
  },
  longTermCopy: {
    flex: 1,
    gap: 2,
  },
  longTermBannerLabel: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  longTermBannerDescription: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: theme.fonts.body,
  },
  metricValue: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionChipActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  actionChipMuted: {
    backgroundColor: "#f7f7f5",
  },
  actionChipLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  actionChipLabelActive: {
    color: "#ffffff",
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skinToneChip: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skinToneChipSelected: {
    borderColor: "#111111",
    backgroundColor: "#f7f7f5",
  },
  skinToneSwatch: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  customizationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  placeholderCard: {
    width: "48.5%",
    minHeight: 92,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "space-between",
  },
  placeholderLabel: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  placeholderNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
});
