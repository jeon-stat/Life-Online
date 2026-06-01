import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth/AuthProvider.js";
import { useStepData } from "../data/stepDataProvider.js";
import { buildCharacterViewModel } from "../game/characterState.js";
import { theme } from "../constants/theme.js";

const LONG_TERM_META = {
  WEAK: {
    label: "허약",
    description: "아직은 자주 쉬고 싶어해요.",
    color: "#b06d57",
    softBg: "#fff3ee",
    border: "#f0d1c5",
  },
  HEALTHY: {
    label: "건강",
    description: "안정적으로 산책할 수 있어요.",
    color: "#4f7a57",
    softBg: "#eef8ee",
    border: "#cfe8cf",
  },
  ACTIVE: {
    label: "활발",
    description: "움직임이 가볍고 에너지가 넘쳐요.",
    color: "#c06b3e",
    softBg: "#fff2e4",
    border: "#f3d0b0",
  },
};

const CUSTOMIZATION_SLOTS = [
  { key: "hair", label: "헤어", blurb: "준비 중" },
  { key: "clothes", label: "의상", blurb: "준비 중" },
  { key: "expression", label: "표정", blurb: "준비 중" },
  { key: "background", label: "배경", blurb: "준비 중" },
];

export function CharacterScreen() {
  const { currentUser, signOut } = useAuth();
  const { today, history, goal, admin } = useStepData();
  const viewState = buildCharacterViewModel({ todayRecord: today, history, goal, admin });
  const profileName = currentUser?.nickname?.trim() || "내 산책 파트너";
  const profileHandle = currentUser?.handle ? `@${currentUser.handle}` : "@walk";
  const longTermMeta = LONG_TERM_META[viewState.longTermState] ?? LONG_TERM_META.HEALTHY;
  const growthLabel = viewState.growthLabel ?? "장기 성장";
  const growthDescription = viewState.growthDescription ?? "누적 기록을 바탕으로 캐릭터의 생활감이 자라나요.";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileCopy}>
            <Text style={styles.profileKicker}>내 산책 파트너</Text>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileHandle}>{profileHandle}</Text>
          </View>

          <View style={[styles.stateBadge, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
            <Text style={styles.stateBadgeLabel}>장기 상태</Text>
            <Text style={[styles.stateBadgeValue, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
          </View>
        </View>

        <View style={styles.profileGrid}>
          <InfoTile label="누적 걸음 수" value={`${formatNumber(viewState.growth.lifetimeSteps)}보`} />
          <InfoTile label="목표 달성일" value={`${viewState.growth.achievedDays}일`} />
          <InfoTile label="연속 산책일" value={`${viewState.growth.streak}일`} />
          <InfoTile label="장기 성장" value={growthLabel} />
        </View>

        <View style={styles.profileFooter}>
          <Text style={styles.profileFooterText}>RPG 성장표 대신, 캐릭터의 생활 기록을 차곡차곡 보여줘요.</Text>
          <Pressable onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutLabel}>로그아웃</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader title="장기 상태" subtitle="누적 걸음 기반으로 허약, 건강, 활발의 느낌을 보여줘요." />

        <View style={[styles.longTermBanner, { backgroundColor: longTermMeta.softBg, borderColor: longTermMeta.border }]}>
          <Text style={[styles.longTermBannerLabel, { color: longTermMeta.color }]}>{longTermMeta.label}</Text>
          <Text style={styles.longTermBannerDescription}>{longTermMeta.description}</Text>
        </View>

        <View style={styles.stateLegendRow}>
          {Object.entries(LONG_TERM_META).map(([key, meta]) => {
            const active = key === viewState.longTermState;
            return (
              <View key={key} style={[styles.stateLegendChip, active && styles.stateLegendChipActive]}>
                <Text style={[styles.stateLegendChipLabel, active && styles.stateLegendChipLabelActive]}>{meta.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="장기 성장 정보"
          subtitle="현재는 누적 생활 기록 중심으로만 보여주고, 앞으로 확장될 기반을 남겨둬요."
        />

        <View style={styles.metricGrid}>
          <MetricCard label="누적 걸음 수" value={`${formatNumber(viewState.growth.lifetimeSteps)}보`} />
          <MetricCard label="목표 달성일" value={`${viewState.growth.achievedDays}일`} />
          <MetricCard label="연속 산책일" value={`${viewState.growth.streak}일`} />
          <MetricCard label="성장 단계" value={growthLabel} />
        </View>

        <View style={styles.summarySentenceCard}>
          <Text style={styles.summarySentence}>{growthDescription}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="피부색"
          subtitle="관리자 상태를 재사용해서 캐릭터 바디 전체에 반영해요."
        />

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
                <View style={styles.skinToneTextBlock}>
                  <Text style={styles.skinToneLabel}>{tone.label}</Text>
                  <Text style={styles.skinToneNote}>{selected ? "선택됨" : "적용"}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <SectionHeader
          title="커스터마이징"
          subtitle="헤어, 의상, 표정, 배경은 나중에 파츠형으로 확장할 수 있게 자리만 마련해뒀어요."
        />

        <View style={styles.customizationGrid}>
          {CUSTOMIZATION_SLOTS.map((slot) => (
            <View key={slot.key} style={styles.placeholderCard}>
              <Text style={styles.placeholderLabel}>{slot.label}</Text>
              <Text style={styles.placeholderTitle}>{slot.blurb}</Text>
              <Text style={styles.placeholderText}>추후 해금/컬렉션/유료화 구조로 이어질 수 있는 자리예요.</Text>
            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function InfoTile({ label, value }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTileLabel}>{label}</Text>
      <Text style={styles.infoTileValue}>{value}</Text>
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
  profileCard: {
    borderRadius: theme.radius.xl,
    padding: 20,
    backgroundColor: "#fffaf2",
    borderWidth: 1,
    borderColor: "#f0dcc3",
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 16,
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
    color: "#c57c3a",
    fontSize: 12,
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
    minWidth: 102,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 2,
    alignItems: "flex-start",
  },
  stateBadgeLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  stateBadgeValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoTile: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTileLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  infoTileValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  profileFooter: {
    gap: 10,
  },
  profileFooterText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  signOutButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
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
  card: {
    borderRadius: theme.radius.xl,
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    gap: 6,
    marginBottom: 12,
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
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  longTermBannerLabel: {
    fontSize: 24,
    fontWeight: "900",
  },
  longTermBannerDescription: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  stateLegendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  stateLegendChip: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateLegendChipActive: {
    backgroundColor: "#fff2e8",
    borderColor: "#e2b79e",
  },
  stateLegendChipLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  stateLegendChipLabelActive: {
    color: theme.colors.ink,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#ecdac5",
  },
  metricLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  metricValue: {
    marginTop: 8,
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  summarySentenceCard: {
    borderRadius: theme.radius.lg,
    padding: 16,
    backgroundColor: "#fffefc",
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 10,
  },
  summarySentence: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800",
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skinToneChip: {
    width: "48.5%",
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skinToneChipSelected: {
    backgroundColor: "#fff2e8",
    borderColor: "#d99d78",
  },
  skinToneSwatch: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  skinToneTextBlock: {
    flex: 1,
    gap: 2,
  },
  skinToneLabel: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  skinToneNote: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  customizationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  placeholderCard: {
    width: "48.5%",
    minHeight: 118,
    borderRadius: theme.radius.lg,
    padding: 14,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  placeholderLabel: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  placeholderTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  placeholderText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
