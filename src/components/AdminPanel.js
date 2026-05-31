import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../constants/theme.js";

const ENERGY_OPTIONS = [
  { key: null, label: "Auto" },
  { key: 0, label: "0" },
  { key: 1, label: "1" },
  { key: 2, label: "2" },
  { key: 3, label: "3" },
  { key: 4, label: "4" },
  { key: 5, label: "5" },
  { key: 6, label: "6" },
];

const LONG_TERM_OPTIONS = [
  { key: null, label: "Auto" },
  { key: "WEAK", label: "Weak" },
  { key: "HEALTHY", label: "Healthy" },
  { key: "ACTIVE", label: "Active" },
];

const ENERGY_LABELS = {
  0: "Sitting Idle",
  1: "Yawn",
  2: "Breathing Idle",
  3: "Neutral Idle",
  4: "Walking",
  5: "Running",
  6: "Running + Special",
};

export function AdminPanel({ admin, behavior }) {
  if (!admin?.visible || !admin?.canOverride) {
    return null;
  }

  const currentEnergyLevel = behavior?.energyLevel ?? 3;
  const currentEnergyLabel = ENERGY_LABELS[currentEnergyLevel] ?? "Unknown";
  const selectedSkinTone = admin.skinTones?.find((tone) => tone.id === admin.skinToneId) ?? null;
  const forcedEnergyLevel = admin.forcedEnergyLevel ?? null;
  const forcedLongTermState = admin.forcedLongTermState ?? null;
  const energySixPool = buildChanceRows(behavior?.specialActionPool ?? []);
  const specialChanceLabel = formatSpecialChanceLabel(behavior?.specialActionPool ?? []);

  return (
    <View style={styles.shell}>
      <Text style={styles.title}>Admin Panel</Text>
      <Text style={styles.caption}>
        Energy level, long-term state, and skin tone only. Use Energy Level to preview the animation.
      </Text>

      <View style={styles.summaryCard}>
        <SummaryLine label="Current Energy" value={`${currentEnergyLevel} / ${currentEnergyLabel}`} />
        <SummaryLine label="Current Long Term" value={behavior?.longTermState ?? "Unknown"} />
        <SummaryLine label="Current Clip" value={behavior?.animationClip ?? "neutral-idle"} />
        <SummaryLine
          label="Forced Energy"
          value={forcedEnergyLevel === null ? "Auto" : `${forcedEnergyLevel} / ${ENERGY_LABELS[forcedEnergyLevel] ?? "Unknown"}`}
        />
        <SummaryLine label="Forced Long Term" value={forcedLongTermState ?? "Auto"} />
        <SummaryLine label="Skin Tone" value={selectedSkinTone ? selectedSkinTone.label : "None"} />
      </View>

      <Section title="Energy Override">
        <OptionRow items={ENERGY_OPTIONS} selected={forcedEnergyLevel} onSelect={admin.setForcedEnergyLevel} />
      </Section>

      <Section title="Long-Term State">
        <OptionRow items={LONG_TERM_OPTIONS} selected={forcedLongTermState} onSelect={admin.setForcedLongTermState} />
      </Section>

      <Section title="Energy 6 Chance">
        <Text style={styles.sectionNote}>Only used when Energy Level is 6.</Text>
        <Text style={styles.sectionNote}>{specialChanceLabel}</Text>
        {energySixPool.length ? (
          <View style={styles.chanceList}>
            {energySixPool.map((row) => (
              <View key={row.key} style={styles.chanceRow}>
                <Text style={styles.chanceLabel}>{row.label}</Text>
                <Text style={styles.chanceValue}>{row.percentLabel}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.sectionNote}>No special-action pool is available.</Text>
        )}
      </Section>

      <Section title="Skin Tone">
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

      <Pressable
        onPress={() => {
          admin.resetBehavior?.();
          admin.setSkinTone(admin.skinTones?.[0]?.id ?? null);
        }}
        style={styles.resetButton}
      >
        <Text style={styles.resetLabel}>Reset Admin Overrides</Text>
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

function OptionRow({ items, selected, onSelect }) {
  return (
    <View style={styles.optionRow}>
      {items.map((item) => {
        const active = selected === item.key;
        return (
          <Pressable
            key={String(item.key ?? "auto")}
            onPress={() => onSelect?.(item.key)}
            style={[styles.optionChip, active && styles.optionChipSelected]}
          >
            <Text style={styles.optionLabel}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function buildChanceRows(actions) {
  const validActions = actions.filter((action) => Number.isFinite(action.weight) && action.weight > 0);
  const totalWeight = validActions.reduce((sum, action) => sum + action.weight, 0);

  if (!totalWeight) return [];

  return validActions.map((action) => {
    const percent = (action.weight / totalWeight) * 100;
    return {
      key: action.key,
      label: action.label ?? action.key,
      percentLabel: `${Math.round(percent)}%`,
    };
  });
}

function formatSpecialChanceLabel(actions) {
  const validActions = actions.filter((action) => Number.isFinite(action.weight) && action.weight > 0);
  const totalWeight = validActions.reduce((sum, action) => sum + action.weight, 0);

  if (!totalWeight) return "Special action chance: not configured.";

  const specialWeight = validActions
    .filter((action) => action.key !== "energy6")
    .reduce((sum, action) => sum + action.weight, 0);

  return `Special actions total: ${Math.round((specialWeight / totalWeight) * 100)}%`;
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 320,
    maxWidth: "88%",
    borderRadius: theme.radius.xl,
    padding: 14,
    backgroundColor: "rgba(255, 250, 244, 0.96)",
    borderWidth: 1,
    borderColor: "#efd7c4",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    gap: 12,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  caption: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#efcfbc",
    gap: 7,
  },
  summaryLine: {
    gap: 2,
  },
  summaryLabel: {
    color: theme.colors.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summaryValue: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  sectionNote: {
    color: theme.colors.inkSoft,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efcfbc",
  },
  optionChipSelected: {
    backgroundColor: "#fff0e5",
    borderColor: "#b45c3a",
  },
  optionLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  chanceList: {
    gap: 8,
  },
  chanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff8f2",
    borderWidth: 1,
    borderColor: "#efd6c2",
  },
  chanceLabel: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  chanceValue: {
    color: "#9f4e33",
    fontSize: 12,
    fontWeight: "900",
  },
  skinToneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skinToneChip: {
    minWidth: 82,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#efcfbc",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skinToneChipSelected: {
    backgroundColor: "#fff0e5",
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
  resetButton: {
    marginTop: 2,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fce7d8",
  },
  resetLabel: {
    color: "#9f4e33",
    fontSize: 12,
    fontWeight: "900",
  },
});
