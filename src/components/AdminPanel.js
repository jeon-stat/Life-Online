import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../constants/theme.js";
import { ADMIN_STEP_PRESETS } from "../data/mockStepData.js";
import { LEVEL_REWARDS } from "../game/levelRewards.js";

export function AdminPanel({ admin, onClose }) {
  const [selectedDate, setSelectedDate] = useState(admin?.selectedTodayDate ?? "");
  const [stepInput, setStepInput] = useState("0");
  const [levelInput, setLevelInput] = useState("1");
  const [pointInput, setPointInput] = useState("0");
  const recentRewards = useMemo(() => LEVEL_REWARDS.slice(0, 10), []);

  useEffect(() => {
    setSelectedDate(admin?.selectedTodayDate ?? "");
  }, [admin?.selectedTodayDate]);

  if (!admin?.visible || !admin?.canOverride) {
    return null;
  }

  return (
    <View style={styles.shell}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>개발자 패널</Text>
          <Text style={styles.caption}>성장 로직, 날짜 이동, 마이그레이션을 실제 앱 상태에서 바로 시험할 수 있어요.</Text>
        </View>

        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonLabel}>×</Text>
        </Pressable>
      </View>

      <Section title="오늘 걸음 빠른 설정">
        <View style={styles.optionRow}>
          {ADMIN_STEP_PRESETS.map((preset) => (
            <Pressable key={preset.id} onPress={() => admin.setTodaySteps?.(preset.steps)} style={styles.optionChip}>
              <Text style={styles.optionLabel}>{preset.label}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="날짜별 걸음 수정">
        <View style={styles.controlCard}>
          <Text style={styles.controlHint}>수정 날짜</Text>
          <View style={styles.optionRow}>
            {(admin.dates ?? []).map((dateKey) => {
              const selected = selectedDate === dateKey;
              return (
                <Pressable
                  key={dateKey}
                  onPress={() => setSelectedDate(dateKey)}
                  style={[styles.optionChip, selected && styles.optionChipSelected]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{dateKey.slice(5)}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={stepInput}
            onChangeText={setStepInput}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="걸음 수"
          />

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => admin.setPastSteps?.(selectedDate, Number(stepInput))}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonLabel}>과거 날짜 저장</Text>
            </Pressable>
            <Pressable onPress={() => admin.advanceDay?.()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonLabel}>하루 넘기기</Text>
            </Pressable>
          </View>
        </View>
      </Section>

      <Section title="성장 수동 조정">
        <View style={styles.controlCard}>
          <Text style={styles.controlHint}>현재 레벨</Text>
          <TextInput
            value={levelInput}
            onChangeText={setLevelInput}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="레벨"
          />
          <Pressable onPress={() => admin.setCurrentLevel?.(Number(levelInput))} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>레벨 적용</Text>
          </Pressable>

          <Text style={styles.controlHint}>성장 포인트</Text>
          <TextInput
            value={pointInput}
            onChangeText={setPointInput}
            keyboardType="number-pad"
            style={styles.input}
            placeholder="포인트"
          />
          <Pressable onPress={() => admin.setGrowthPoints?.(Number(pointInput))} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>포인트 적용</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="휴식권 / 판정 처리">
        <View style={styles.actionRow}>
          <Pressable onPress={() => admin.processPendingResults?.()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>완료 날짜 처리</Text>
          </Pressable>
          <Pressable onPress={() => admin.rebuildGrowth?.()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonLabel}>전체 재계산</Text>
          </Pressable>
        </View>
        <View style={styles.actionRow}>
          <Pressable onPress={() => admin.setWeeklyRestUsed?.(true)} style={styles.optionChip}>
            <Text style={styles.optionLabel}>휴식권 사용 처리</Text>
          </Pressable>
          <Pressable onPress={() => admin.setWeeklyRestUsed?.(false)} style={styles.optionChip}>
            <Text style={styles.optionLabel}>휴식권 초기화</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="보상 강제 잠금 해제">
        <View style={styles.rewardList}>
          {recentRewards.map((reward) => (
            <Pressable key={reward.id} onPress={() => admin.unlockReward?.(reward.id)} style={styles.rewardRow}>
              <View>
                <Text style={styles.rewardName}>Lv.{reward.requiredLevel} · {reward.name}</Text>
                <Text style={styles.rewardMeta}>{reward.type}</Text>
              </View>
              <Text style={styles.rewardAction}>해금</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="데이터 초기화 / 마이그레이션">
        <View style={styles.actionRow}>
          <Pressable onPress={() => admin.resetGrowthData?.()} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonLabel}>성장 데이터 초기화</Text>
          </Pressable>
          <Pressable onPress={() => admin.simulateMigration?.()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>v2 마이그레이션 재현</Text>
          </Pressable>
        </View>
      </Section>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: "rgba(255, 251, 245, 0.97)",
    borderWidth: 1,
    borderColor: "#edd8c2",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  caption: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  closeButtonLabel: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efd3b5",
  },
  optionChipSelected: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  optionLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  optionLabelSelected: {
    color: "#ffffff",
  },
  controlCard: {
    gap: 8,
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#f1ddc9",
  },
  controlHint: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  input: {
    minHeight: 42,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
    paddingHorizontal: 12,
  },
  primaryButtonLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff4e8",
    borderWidth: 1,
    borderColor: "#efcfaa",
    paddingHorizontal: 12,
  },
  secondaryButtonLabel: {
    color: "#8d512a",
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  rewardList: {
    gap: 8,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#f1ddc9",
  },
  rewardName: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
  rewardMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: theme.fonts.body,
  },
  rewardAction: {
    color: "#8d512a",
    fontSize: 11,
    fontWeight: "900",
    fontFamily: theme.fonts.body,
  },
});
