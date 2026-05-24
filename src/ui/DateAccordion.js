import { Pressable, StyleSheet, Text, View } from "react-native";

export function DateAccordion({ items, expandedId, onToggle }) {
  const activeItem = items.find((item) => item.id === expandedId) ?? items.at(-1) ?? null;

  return (
    <View style={styles.shell}>
      <View style={styles.datesRail}>
        {items.map((item) => {
          const active = item.id === expandedId;

          return (
            <Pressable
              key={item.id}
              onPress={() => onToggle(item.id)}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>
                {getDayNumber(item.dateLabel)}
              </Text>
              <Text style={[styles.dayMeta, active && styles.dayMetaActive]}>
                {item.isToday ? "\uC624\uB298" : item.weekdayLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeItem ? (
        <View key={`${activeItem.id}-panel`} style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>
              {activeItem.dateLabel}{" "}
              {activeItem.isToday ? "\u00B7 \uC624\uB298" : `\u00B7 ${activeItem.weekdayLabel}`}
            </Text>
            <Text style={styles.panelSummary}>{activeItem.summary}</Text>
          </View>

          <View style={styles.metricsRow}>
            <MetricPill label={"\uD68D\uB4DD XP"} value={`${activeItem.xp}`} />
            <MetricPill label={"\uC644\uB8CC \uC218"} value={`${activeItem.count}\uD68C`} />
            <MetricPill label={"\uC0C1\uD0DC"} value={activeItem.mood} />
          </View>

          <View style={styles.entryList}>
            {activeItem.entries.length === 0 ? (
              <Text style={styles.emptyText}>
                {"\uC774 \uB0A0\uC9DC\uC5D0\uB294 \uC544\uC9C1 \uAE30\uB85D\uC774 \uC5C6\uC5B4\uC694."}
              </Text>
            ) : (
              activeItem.entries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.dot} />
                  <View style={styles.entryCopy}>
                    <Text style={styles.entryTitle}>{entry.label}</Text>
                    <Text style={styles.entryMeta}>{entry.meta}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function MetricPill({ label, value }) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getDayNumber(dateLabel) {
  return dateLabel.split("\uC6D4 ")[1]?.replace("\uC77C", "") ?? dateLabel;
}

const styles = StyleSheet.create({
  shell: {
    gap: 14,
  },
  datesRail: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  dayChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  dayNumber: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  dayNumberActive: {
    color: "#ffffff",
  },
  dayMeta: {
    marginTop: 1,
    color: "#9ca3af",
    fontSize: 9,
    fontWeight: "800",
  },
  dayMetaActive: {
    color: "#e5e7eb",
  },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 18,
  },
  panelHeader: {
    marginBottom: 12,
  },
  panelTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  panelSummary: {
    marginTop: 5,
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricLabel: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "800",
  },
  metricValue: {
    marginTop: 4,
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },
  entryList: {
    marginTop: 12,
    gap: 10,
  },
  entryRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#d27d69",
    marginTop: 6,
  },
  entryCopy: {
    flex: 1,
  },
  entryTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
  },
  entryMeta: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
  },
});
