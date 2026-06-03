import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { theme } from "../constants/theme.js";

const LONG_TERM_META = {
  WEAK: {
    label: "허약",
    description: "아직은 자주 쉬고 싶어해요.",
    color: "#555555",
    softBg: "#f5f5f3",
    border: "#e7e7e4",
    icon: "○",
  },
  HEALTHY: {
    label: "건강",
    description: "안정적으로 산책할 수 있어요.",
    color: "#111111",
    softBg: "#f7f7f5",
    border: "#e7e7e4",
    icon: "◌",
  },
  ACTIVE: {
    label: "활발",
    description: "움직임이 가볍고 에너지가 넘쳐요.",
    color: "#111111",
    softBg: "#f3f3f1",
    border: "#e7e7e4",
    icon: "✦",
  },
};

const CUSTOMIZATION_SLOTS = [
  { key: "hair", label: "헤어", note: "준비 중" },
  { key: "clothes", label: "의상", note: "준비 중" },
  { key: "expression", label: "표정", note: "준비 중" },
  { key: "background", label: "배경", note: "준비 중" },
];

export function CharacterScreen() {
  const { currentUser, signOut } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });

  const profileName = currentUser?.nickname?.trim() || "내 산책 파트너";
  const profileHandle = currentUser?.handle ? `@${currentUser.handle}` : "@walk";
  const longTermMeta = LONG_TERM_META[viewState.longTermState] ?? LONG_TERM_META.HEALTHY;
  const growth = viewState.growth ?? {};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageTitleWrap}>
        <Text style={styles.pageTitle}>캐릭터</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileCopy}>
            <Text style={styles.profileKicker}>내 캐릭터</Text>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileHandle}>{profileHandle}</Text>
          </View>

          <View style={[styles.stateBadge, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
            <Text style={styles.stateBadgeLabel}>{longTermMeta.icon}</Text>
            <Text style={[styles.stateBadgeValue, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
          </View>
        </View>

        <View style={styles.profileGrid}>
          <MiniStat icon="👣" label="누적" value={`${formatNumber(growth.lifetimeSteps ?? 0)}보`} />
          <MiniStat icon="🏁" label="달성" value={`${growth.achievedDays ?? 0}일`} />
          <MiniStat icon="🔥" label="연속" value={`${growth.streak ?? 0}일`} />
        </View>

        <View style={styles.profileFooter}>
          <Pressable onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutLabel}>로그아웃</Text>
          </Pressable>
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
          <MetricCard icon="👣" label="누적" value={`${formatNumber(growth.lifetimeSteps ?? 0)}보`} />
          <MetricCard icon="🏁" label="달성" value={`${growth.achievedDays ?? 0}일`} />
          <MetricCard icon="🔥" label="연속" value={`${growth.streak ?? 0}일`} />
          <MetricCard icon="✨" label="기록" value={growth.growthLabel ?? "성장 중"} />
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="피부 톤" />

        <View style={styles.skinToneGrid}>
          {(admin.skinTones ?? []).map((tone) => {
            const selected = admin.skinToneId === tone.id;

            return (
              <Pressable
                key={tone.id}
                onPress={() => admin.setSkinTone?.(tone.id)}
                style={[styles.skinToneChip, selected && styles.skinToneChipSelected]}
              >
                <View style={[styles.skinToneSwatch, { backgroundColor: tone.color }]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="준비 중" />

        <View style={styles.customizationGrid}>
          {CUSTOMIZATION_SLOTS.map((slot) => (
            <View key={slot.key} style={styles.placeholderCard}>
              <Text style={styles.placeholderLabel}>{slot.label}</Text>
              <Text style={styles.placeholderNote}>{slot.note}</Text>
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

function MiniStat({ icon, label, value }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTileLabel}>
        {icon} {label}
      </Text>
      <Text style={styles.infoTileValue}>{value}</Text>
    </View>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>
        {icon} {label}
      </Text>
      <Text style={styles.metricValue}>{value}</Text>
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
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  profileKicker: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  profileName: {
    color: theme.colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  profileHandle: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
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
  stateBadgeLabel: {
    fontSize: 14,
    fontWeight: "900",
  },
  stateBadgeValue: {
    fontSize: 13,
    fontWeight: "900",
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoTile: {
    width: "31.8%",
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  infoTileLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
  },
  infoTileValue: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  profileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  profileFooterText: {
    flex: 1,
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: "#111111",
  },
  signOutLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
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
  },
  sectionSubtitle: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
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
  },
  longTermBannerDescription: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
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
  },
  metricValue: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
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
  },
  placeholderNote: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
  },
});
