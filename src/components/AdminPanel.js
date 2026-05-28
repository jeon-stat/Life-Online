import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { theme } from "../constants/theme.js";
import { getActionKindLabel } from "../game/behavior.js";

export function AdminPanel({ admin, behavior }) {
  if (!admin?.visible || !admin?.canOverride) {
    return null;
  }

  const shortState = admin.forcedShortTermState ?? behavior?.energyState ?? "LOW_ENERGY";
  const longState = admin.forcedLongTermState ?? behavior?.longTermState ?? "WEAK";
  const backgroundState = admin.forcedBackgroundState ?? behavior?.backgroundState ?? shortState;
  const forcedAction = admin.forcedActionKey ?? "auto";

  return (
    <View style={styles.shell}>
      <Text style={styles.title}>Behavior Dev Panel</Text>
      <Text style={styles.caption}>
        Dev-only controls for testing states, actions, timing, weights, speed, and background mood.
      </Text>

      <View style={styles.summaryCard}>
        <SummaryLine label="Current Short Term State" value={shortState} />
        <SummaryLine label="Current Long Term State" value={longState} />
        <SummaryLine label="Current Background Mood" value={backgroundState} />
        <SummaryLine label="Current Forced Action" value={forcedAction} />
      </View>

      <Pressable onPress={() => admin.setForcedActionKey(null)} style={styles.clearActionButton}>
        <Text style={styles.clearActionLabel}>Clear Forced Action</Text>
      </Pressable>

      <Section title="1. Force Short Term State">
        <ButtonRow
          items={[
            { key: "LOW_ENERGY", label: "LOW" },
            { key: "NORMAL_ENERGY", label: "NORMAL" },
            { key: "HIGH_ENERGY", label: "HIGH" },
          ]}
          selected={admin.forcedShortTermState}
          onSelect={(value) => admin.setForcedShortTermState(value)}
          onClear={() => admin.setForcedShortTermState(null)}
        />
      </Section>

      <Section title="2. Force Long Term State">
        <ButtonRow
          items={[
            { key: "WEAK", label: "WEAK" },
            { key: "HEALTHY", label: "HEALTHY" },
            { key: "ACTIVE", label: "ACTIVE" },
          ]}
          selected={admin.forcedLongTermState}
          onSelect={(value) => admin.setForcedLongTermState(value)}
          onClear={() => admin.setForcedLongTermState(null)}
        />
      </Section>

      <Section title="3. Force Background Mood">
        <ButtonRow
          items={[
            { key: "LOW_ENERGY", label: "LOW" },
            { key: "NORMAL_ENERGY", label: "NORMAL" },
            { key: "HIGH_ENERGY", label: "HIGH" },
          ]}
          selected={admin.forcedBackgroundState}
          onSelect={(value) => admin.setForcedBackgroundState(value)}
          onClear={() => admin.setForcedBackgroundState(null)}
        />
      </Section>

      <Section title="4. Action Testing">
        <Text style={styles.poolTitle}>Main Action Pool</Text>
        <ActionPool
          actions={behavior?.mainActions ?? []}
          forcedActionKey={admin.forcedActionKey}
          onForceAction={admin.setForcedActionKey}
          onAdjustWeight={admin.adjustWeightOverride}
        />

        <Text style={[styles.poolTitle, { marginTop: 12 }]}>Transition Action Pool</Text>
        <ActionPool
          actions={behavior?.transitionActions ?? []}
          forcedActionKey={admin.forcedActionKey}
          onForceAction={admin.setForcedActionKey}
          onAdjustWeight={admin.adjustWeightOverride}
        />
      </Section>

      <Section title="5. Speed Testing">
        <RangeEditor
          label="Walking speed multiplier"
          value={admin.walkingSpeedMultiplier}
          onChange={admin.setWalkingSpeedMultiplier}
          step={0.1}
        />
        <RangeEditor
          label="Running speed multiplier"
          value={admin.runningSpeedMultiplier}
          onChange={admin.setRunningSpeedMultiplier}
          step={0.1}
        />
        <RangeEditor
          label="Animation speed multiplier"
          value={admin.animationSpeedMultiplier}
          onChange={admin.setAnimationSpeedMultiplier}
          step={0.1}
        />
      </Section>

      <Section title="6. Time Testing">
        <RangeEditor
          label="Main action duration"
          value={admin.mainDurationRange}
          onChange={(min, max) => admin.setMainDurationRange(min, max)}
          pair
        />
        <RangeEditor
          label="Transition duration"
          value={admin.transitionDurationRange}
          onChange={(min, max) => admin.setTransitionDurationRange(min, max)}
          pair
        />
        <RangeEditor
          label="Random wait duration"
          value={admin.waitDurationRange}
          onChange={(min, max) => admin.setWaitDurationRange(min, max)}
          pair
        />
      </Section>

      <Section title="7. Weight Testing">
        <View style={styles.actionGrid}>
          {(behavior?.allActions ?? []).map((action) => {
            const selected = admin.forcedActionKey === action.key;

            return (
              <View key={action.key} style={[styles.actionCard, selected && styles.actionCardSelected]}>
                <Text style={styles.actionName}>{action.label}</Text>
                <Text style={styles.actionMeta}>
                  {`${getActionKindLabel(action.type)} • ${action.available ? "clip" : "placeholder"}`}
                </Text>
                <Text style={styles.actionMeta}>{`weight ${formatWeight(action.weight)}`}</Text>
                <View style={styles.actionButtonRow}>
                  <Pressable onPress={() => admin.adjustWeightOverride(action.key, -1)} style={styles.miniButton}>
                    <Text style={styles.miniButtonLabel}>-</Text>
                  </Pressable>
                  <Pressable onPress={() => admin.adjustWeightOverride(action.key, 1)} style={styles.miniButton}>
                    <Text style={styles.miniButtonLabel}>+</Text>
                  </Pressable>
                  <Pressable onPress={() => admin.setForcedActionKey(action.key)} style={styles.forceButton}>
                    <Text style={styles.forceButtonLabel}>Force</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      <Pressable onPress={admin.resetBehavior} style={styles.resetButton}>
        <Text style={styles.resetLabel}>Reset Behavior Overrides</Text>
      </Pressable>

      <Pressable onPress={admin.resetMock} style={styles.resetButtonSecondary}>
        <Text style={styles.resetLabelSecondary}>Reset Mock Data</Text>
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
        <Text style={styles.buttonLabel}>Clear</Text>
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
              <Text style={styles.poolName}>{action.label}</Text>
              <Text style={styles.poolMeta}>
                {`${getActionKindLabel(action.type)} • ${action.available ? "clip" : "placeholder"} • weight ${formatWeight(action.weight)}`}
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
                <Text style={styles.forceButtonLabel}>Force</Text>
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
          <Text style={styles.rangeDash}>to</Text>
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
