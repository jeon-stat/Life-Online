import { Pressable, StyleSheet, Text, View } from "react-native";

export function DateAccordion({ items, expandedId, onToggle }) {
  return (
    <View style={styles.stack}>
      {items.map((item) => {
        const expanded = item.id === expandedId;

        return (
          <View key={item.id} style={styles.card}>
            <Pressable onPress={() => onToggle(expanded ? null : item.id)} style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.dateText}>
                  {item.dateLabel} {item.isToday ? "· 오늘" : `· ${item.weekdayLabel}`}
                </Text>
                <Text style={styles.summaryText}>{item.summary}</Text>
              </View>
              <Text style={styles.chevron}>{expanded ? "−" : "+"}</Text>
            </Pressable>

            {expanded ? (
              <View style={styles.body}>
                <View style={styles.metricsRow}>
                  <MetricPill label="획득 XP" value={`${item.xp}`} />
                  <MetricPill label="완료 수" value={`${item.count}회`} />
                  <MetricPill label="상태" value={item.mood} />
                </View>

                <View style={styles.entryList}>
                  {item.entries.length === 0 ? (
                    <Text style={styles.emptyText}>이 날짜에는 아직 기록이 없어요.</Text>
                  ) : (
                    item.entries.map((entry) => (
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
      })}
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

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e3ddd4",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  dateText: {
    color: "#243247",
    fontSize: 14,
    fontWeight: "900",
  },
  summaryText: {
    marginTop: 4,
    color: "#6c7888",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  chevron: {
    color: "#243247",
    fontSize: 22,
    fontWeight: "600",
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: "#ede7df",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#f3f5f8",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricLabel: {
    color: "#7b8798",
    fontSize: 11,
    fontWeight: "800",
  },
  metricValue: {
    marginTop: 4,
    color: "#243247",
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
    color: "#243247",
    fontSize: 13,
    fontWeight: "900",
  },
  entryMeta: {
    marginTop: 2,
    color: "#6e7d91",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: "#7d8797",
    fontSize: 12,
    fontWeight: "700",
  },
});
