import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../constants/theme.js";
import { getActionKindLabel } from "../game/behavior.js";

const STATE_LABELS = {
  LOW_ENERGY: "낮음",
  NORMAL_ENERGY: "보통",
  HIGH_ENERGY: "높음",
  WEAK: "허약",
  HEALTHY: "건강",
  ACTIVE: "활발",
};

const ACTION_LABELS_KO = {
  idle: "서 있기",
  tired: "앉기",
  standingUp: "일어서기",
  startWalking: "걷기 시작",
  stopWalking: "걷기 멈춤",
  runToStop: "뛰기 멈춤",
  slowWalk: "느리게 걷기",
  walk: "걷기",
  fastWalk: "빠르게 걷기",
  run: "뛰기",
  sleepyIdle: "졸린 서 있기",
  lookingDown: "아래 보기",
  slowTiredWalk: "피곤한 느린 걷기",
  stretchSitting: "앉아서 스트레칭",
  idleBreathing: "호흡하기",
  yawn: "하품",
  weightShift: "중심 옮기기",
  stopAndRest: "멈추고 쉬기",
  headNod: "고개 끄덕이기",
  slowTurn: "천천히 돌기",
  relaxedIdle: "편안한 서 있기",
  casualWalk: "평범하게 걷기",
  exploreWalk: "둘러보기 걷기",
  stretch: "스트레칭",
  lightJog: "가벼운 조깅",
  lookAround: "주변 보기",
  turnLeftRight: "좌우 보기",
  smallPause: "짧은 멈춤",
  footTap: "발 톡톡",
  idleTransition: "서 있기 전환",
  quickTurn: "빠른 회전",
  bounceIdle: "들썩이기",
  fastStop: "빠른 멈춤",
  lookAroundFast: "빠르게 주변 보기",
  shortHop: "짧은 점프",
  happyRun: "신나는 뛰기",
  energeticWalk: "활기찬 걷기",
  dashStart: "달리기 시작",
  excitedIdle: "신난 서 있기",
  activePatrol: "활동적인 배회",
};

export function AdminPanel({ admin, behavior }) {
  if (!admin?.visible || !admin?.canOverride) {
    return null;
  }

  const shortState = admin.forcedShortTermState ?? behavior?.energyState ?? "LOW_ENERGY";
  const longState = admin.forcedLongTermState ?? behavior?.longTermState ?? "WEAK";
  const backgroundState = admin.forcedBackgroundState ?? behavior?.backgroundState ?? shortState;
  const forcedAction = admin.forcedActionKey ?? "자동";
  const selectedSkinTone = admin.skinTones?.find((tone) => tone.id === admin.skinToneId) ?? null;

  return (
    <View style={styles.shell}>
      <Text style={styles.title}>행동 테스트 패널</Text>
      <Text style={styles.caption}>
        개발자 전용 패널입니다. 상태, 행동, 시간, 속도, 배경 분위기를 빠르게 테스트할 수 있습니다.
      </Text>

      <View style={styles.summaryCard}>
        <SummaryLine label="현재 단기 상태" value={formatState(shortState)} />
        <SummaryLine label="현재 장기 상태" value={formatState(longState)} />
        <SummaryLine label="현재 배경 분위기" value={formatState(backgroundState)} />
        <SummaryLine label="현재 강제 행동" value={forcedAction} />
        <SummaryLine
          label="현재 피부색"
          value={selectedSkinTone ? selectedSkinTone.label : "미선택"}
        />
      </View>

      <Pressable onPress={() => admin.setForcedActionKey(null)} style={styles.clearActionButton}>
        <Text style={styles.clearActionLabel}>강제 행동 해제</Text>
      </Pressable>

      <Section title="1. 단기 상태 강제 변경">
        <ButtonRow
          items={[
            { key: "LOW_ENERGY", label: "낮음" },
            { key: "NORMAL_ENERGY", label: "보통" },
            { key: "HIGH_ENERGY", label: "높음" },
          ]}
          selected={admin.forcedShortTermState}
          onSelect={(value) => admin.setForcedShortTermState(value)}
          onClear={() => admin.setForcedShortTermState(null)}
        />
      </Section>

      <Section title="2. 장기 상태 강제 변경">
        <ButtonRow
          items={[
            { key: "WEAK", label: "허약" },
            { key: "HEALTHY", label: "건강" },
            { key: "ACTIVE", label: "활발" },
          ]}
          selected={admin.forcedLongTermState}
          onSelect={(value) => admin.setForcedLongTermState(value)}
          onClear={() => admin.setForcedLongTermState(null)}
        />
      </Section>

      <Section title="3. 배경 분위기 강제 적용">
        <ButtonRow
          items={[
            { key: "LOW_ENERGY", label: "낮음" },
            { key: "NORMAL_ENERGY", label: "보통" },
            { key: "HIGH_ENERGY", label: "높음" },
          ]}
          selected={admin.forcedBackgroundState}
          onSelect={(value) => admin.setForcedBackgroundState(value)}
          onClear={() => admin.setForcedBackgroundState(null)}
        />
      </Section>

      <Section title="4. 행동 테스트">
        <Text style={styles.poolTitle}>메인 행동 풀</Text>
        <ActionPool
          actions={behavior?.mainActions ?? []}
          forcedActionKey={admin.forcedActionKey}
          onForceAction={admin.setForcedActionKey}
          onAdjustWeight={admin.adjustWeightOverride}
        />

        <Text style={[styles.poolTitle, { marginTop: 12 }]}>전환 행동 풀</Text>
        <ActionPool
          actions={behavior?.transitionActions ?? []}
          forcedActionKey={admin.forcedActionKey}
          onForceAction={admin.setForcedActionKey}
          onAdjustWeight={admin.adjustWeightOverride}
        />
      </Section>

      <Section title="5. 속도 테스트">
        <RangeEditor
          label="걷기 속도 배수"
          value={admin.walkingSpeedMultiplier}
          onChange={admin.setWalkingSpeedMultiplier}
          step={0.1}
        />
        <RangeEditor
          label="뛰기 속도 배수"
          value={admin.runningSpeedMultiplier}
          onChange={admin.setRunningSpeedMultiplier}
          step={0.1}
        />
        <RangeEditor
          label="애니메이션 속도 배수"
          value={admin.animationSpeedMultiplier}
          onChange={admin.setAnimationSpeedMultiplier}
          step={0.1}
        />
      </Section>

      <Section title="6. 시간 테스트">
        <RangeEditor
          label="메인 행동 지속 시간"
          value={admin.mainDurationRange}
          onChange={(min, max) => admin.setMainDurationRange(min, max)}
          pair
        />
        <RangeEditor
          label="전환 행동 지속 시간"
          value={admin.transitionDurationRange}
          onChange={(min, max) => admin.setTransitionDurationRange(min, max)}
          pair
        />
        <RangeEditor
          label="랜덤 대기 시간"
          value={admin.waitDurationRange}
          onChange={(min, max) => admin.setWaitDurationRange(min, max)}
          pair
        />
      </Section>

      <Section title="7. 가중치 테스트">
        <View style={styles.actionGrid}>
          {(behavior?.allActions ?? []).map((action) => {
            const selected = admin.forcedActionKey === action.key;

            return (
              <View key={action.key} style={[styles.actionCard, selected && styles.actionCardSelected]}>
                <Text style={styles.actionName}>{getAdminActionLabel(action.key, action.label)}</Text>
                <Text style={styles.actionMeta}>
                  {`${getActionKindLabel(action.type) === "Transition" ? "전환" : "메인"} · ${action.available ? "실제 클립" : "임시 항목"}`}
                </Text>
                <Text style={styles.actionMeta}>{`가중치 ${formatWeight(action.weight)}`}</Text>
                <View style={styles.actionButtonRow}>
                  <Pressable onPress={() => admin.adjustWeightOverride(action.key, -1)} style={styles.miniButton}>
                    <Text style={styles.miniButtonLabel}>-</Text>
                  </Pressable>
                  <Pressable onPress={() => admin.adjustWeightOverride(action.key, 1)} style={styles.miniButton}>
                    <Text style={styles.miniButtonLabel}>+</Text>
                  </Pressable>
                  <Pressable onPress={() => admin.setForcedActionKey(action.key)} style={styles.forceButton}>
                    <Text style={styles.forceButtonLabel}>강제</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="8. 피부색 설정">
        <View style={styles.skinToneGrid}>
          {(admin.skinTones ?? []).map((tone) => {
            const selected = admin.skinToneId === tone.id;
            return (
              <Pressable
                key={tone.id}
                onPress={() => admin.setSkinTone(tone.id)}
                style={[styles.skinToneChip, selected && styles.skinToneChipSelected]}
              >
                <View style={[styles.skinToneSwatch, { backgroundColor: tone.color }]} />
                <Text style={styles.skinToneLabel}>{tone.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Pressable onPress={admin.resetBehavior} style={styles.resetButton}>
        <Text style={styles.resetLabel}>행동 설정 초기화</Text>
      </Pressable>

      <Pressable onPress={admin.resetMock} style={styles.resetButtonSecondary}>
        <Text style={styles.resetLabelSecondary}>모의 데이터 초기화</Text>
      </Pressable>
    </View>
  );
}

function SummaryLine({ label, value }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{String(value)}</Text>
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

function ButtonRow({ items, selected, onSelect, onClear }) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const active = selected === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            style={[styles.button, active && styles.buttonSelected]}
          >
            <Text style={styles.buttonLabel}>{item.label}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onClear} style={styles.button}>
        <Text style={styles.buttonLabel}>해제</Text>
      </Pressable>
    </View>
  );
}

function ActionPool({ actions, forcedActionKey, onForceAction, onAdjustWeight }) {
  return (
    <View style={styles.poolWrap}>
      {actions.map((action) => {
        const selected = forcedActionKey === action.key;

        return (
          <View key={action.key} style={[styles.poolRow, selected && styles.poolRowSelected]}>
            <View style={styles.poolText}>
              <Text style={styles.poolName}>{getAdminActionLabel(action.key, action.label)}</Text>
              <Text style={styles.poolMeta}>
                {`${getActionKindLabel(action.type) === "Transition" ? "전환" : "메인"} · ${action.available ? "실제 클립" : "임시 항목"} · 가중치 ${formatWeight(action.weight)}`}
              </Text>
            </View>
            <View style={styles.poolControls}>
              <Pressable onPress={() => onAdjustWeight(action.key, -1)} style={styles.miniButton}>
                <Text style={styles.miniButtonLabel}>-</Text>
              </Pressable>
              <Pressable onPress={() => onAdjustWeight(action.key, 1)} style={styles.miniButton}>
                <Text style={styles.miniButtonLabel}>+</Text>
              </Pressable>
              <Pressable onPress={() => onForceAction(action.key)} style={styles.forceButton}>
                <Text style={styles.forceButtonLabel}>강제</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RangeEditor({ label, value, onChange, step = 0.1, pair = false }) {
  const [localMin, localMax] = pair ? value : [value, value];

  return (
    <View style={styles.rangeBlock}>
      <Text style={styles.rangeLabel}>{label}</Text>
      {pair ? (
        <View style={styles.rangeRow}>
          <TextInput
            value={String(localMin)}
            keyboardType="decimal-pad"
            style={styles.input}
            onChangeText={(text) => onChange(parseFloat(text || "0"), localMax)}
          />
          <Text style={styles.rangeDash}>~</Text>
          <TextInput
            value={String(localMax)}
            keyboardType="decimal-pad"
            style={styles.input}
            onChangeText={(text) => onChange(localMin, parseFloat(text || "0"))}
          />
        </View>
      ) : (
        <View style={styles.rangeRow}>
          <Pressable onPress={() => onChange(roundToOne((Number(value) || 1) - step))} style={styles.smallAdjust}>
            <Text style={styles.smallAdjustLabel}>-</Text>
          </Pressable>
          <TextInput
            value={String(value)}
            keyboardType="decimal-pad"
            style={styles.input}
            onChangeText={(text) => onChange(parseFloat(text || "1"))}
          />
          <Pressable onPress={() => onChange(roundToOne((Number(value) || 1) + step))} style={styles.smallAdjust}>
            <Text style={styles.smallAdjustLabel}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function formatWeight(value) {
  return Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, "") : "0";
}

function roundToOne(value) {
  return Math.round(value * 10) / 10;
}

function formatState(value) {
  return STATE_LABELS[value] ?? value;
}

function getAdminActionLabel(actionKey, fallbackLabel) {
  return ACTION_LABELS_KO[actionKey] ?? fallbackLabel;
}

const styles = StyleSheet.create({
  shell: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: "#fff4ef",
    borderWidth: 1,
    borderColor: "#f0d6c3",
    gap: 14,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  caption: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: theme.radius.md,
    backgroundColor: "#fffaf5",
    borderWidth: 1,
    borderColor: "#f2ddcb",
    padding: 12,
    gap: 8,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  summaryValue: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  poolTitle: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efcbb1",
  },
  buttonSelected: {
    backgroundColor: "#fff2e9",
    borderColor: "#b45c3a",
  },
  buttonLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  poolWrap: {
    gap: 8,
  },
  poolRow: {
    borderRadius: theme.radius.md,
    padding: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efd1bd",
    gap: 8,
  },
  poolRowSelected: {
    backgroundColor: "#fff4ee",
    borderColor: "#b45c3a",
  },
  poolText: {
    gap: 2,
  },
  poolName: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  poolMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  poolControls: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionGrid: {
    gap: 8,
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skinToneChip: {
    minWidth: 78,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efd1bd",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skinToneChipSelected: {
    backgroundColor: "#fff4ee",
    borderColor: "#b45c3a",
  },
  skinToneSwatch: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  skinToneLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  actionCard: {
    borderRadius: theme.radius.md,
    padding: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efd1bd",
    gap: 6,
  },
  actionCardSelected: {
    backgroundColor: "#fff4ee",
    borderColor: "#b45c3a",
  },
  actionName: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  actionMeta: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  actionButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  miniButton: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8f2",
    borderWidth: 1,
    borderColor: "#efcbb1",
  },
  miniButtonLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  forceButton: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "#fce7d8",
  },
  forceButtonLabel: {
    color: "#9f4e33",
    fontSize: 11,
    fontWeight: "900",
  },
  rangeBlock: {
    gap: 6,
  },
  rangeLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    minWidth: 72,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efcbb1",
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  rangeDash: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  smallAdjust: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8f2",
    borderWidth: 1,
    borderColor: "#efcbb1",
  },
  smallAdjustLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  resetButton: {
    marginTop: 4,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fce7d8",
  },
  resetButtonSecondary: {
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff7f0",
    borderWidth: 1,
    borderColor: "#f0d6c3",
  },
  clearActionButton: {
    borderRadius: theme.radius.md,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: "#fff7f0",
    borderWidth: 1,
    borderColor: "#f0d6c3",
  },
  clearActionLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  resetLabel: {
    color: "#9f4e33",
    fontSize: 12,
    fontWeight: "900",
  },
  resetLabelSecondary: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
});
