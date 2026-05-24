const SAMPLE_DAYS = [
  {
    offset: 1,
    xp: 54,
    count: 3,
    mood: "\uCC28\uBD84",
    summary: "\uC9D1\uC911 \uC138\uC158\uACFC \uD558\uB8E8 \uD68C\uACE0\uB97C \uB9C8\uBB34\uB9AC\uD55C \uB0A0",
    entries: [
      { id: "sample-focus-1", label: "\uC9D1\uC911 \uC138\uC158", meta: "20 XP \u00B7 \uC9D1\uC911" },
      { id: "sample-walk-1", label: "\uAC78\uC74C \uBAA9\uD45C", meta: "18 XP \u00B7 \uBC14\uB514" },
      { id: "sample-reflection-1", label: "\uD558\uB8E8 \uD68C\uACE0", meta: "10 XP \u00B7 \uB9C8\uC74C" },
    ],
  },
  {
    offset: 2,
    xp: 38,
    count: 2,
    mood: "\uAC1C\uC6B4",
    summary: "\uC815\uB9AC \uB9AC\uC14B\uACFC \uC218\uBA74 \uC900\uBE44\uB85C \uB9AC\uB4EC\uC744 \uD68C\uBCF5\uD55C \uB0A0",
    entries: [
      { id: "sample-tidy-2", label: "\uC815\uB9AC \uB9AC\uC14B", meta: "12 XP \u00B7 \uC0DD\uD65C" },
      { id: "sample-wind-2", label: "\uC218\uBA74 \uC900\uBE44", meta: "16 XP \u00B7 \uBC14\uB514" },
    ],
  },
  {
    offset: 3,
    xp: 62,
    count: 4,
    mood: "\uBAB0\uC785",
    summary: "\uC9E7\uC9C0\uB9CC \uAC15\uD558\uAC8C \uBAB0\uC785\uC774 \uC798 \uB41C \uB0A0",
    entries: [
      { id: "sample-focus-3", label: "\uC9D1\uC911 \uC138\uC158", meta: "20 XP \u00B7 \uC9D1\uC911" },
      { id: "sample-focus-3b", label: "\uC9D1\uC911 \uC138\uC158", meta: "14 XP \u00B7 \uC9D1\uC911" },
      { id: "sample-walk-3", label: "\uAC78\uC74C \uBAA9\uD45C", meta: "18 XP \u00B7 \uBC14\uB514" },
      { id: "sample-reflection-3", label: "\uD558\uB8E8 \uD68C\uACE0", meta: "10 XP \u00B7 \uB9C8\uC74C" },
    ],
  },
  {
    offset: 4,
    xp: 24,
    count: 2,
    mood: "\uC900\uBE44",
    summary: "\uAC00\uBCBD\uAC8C \uD750\uB984\uB9CC \uC0B4\uB9B0 \uB0A0",
    entries: [
      { id: "sample-walk-4", label: "\uAC78\uC74C \uBAA9\uD45C", meta: "18 XP \u00B7 \uBC14\uB514" },
      { id: "sample-reflection-4", label: "\uD558\uB8E8 \uD68C\uACE0", meta: "10 XP \u00B7 \uB9C8\uC74C" },
    ],
  },
];

export function buildHomeDatePanels(now, state) {
  const today = new Date(now);

  const todayPanel = {
    id: formatDateKey(today),
    isToday: true,
    dateLabel: formatDateLabel(today),
    weekdayLabel: formatWeekday(today),
    summary: state.log,
    xp: state.dailyExp,
    count: state.count,
    mood: state.mood,
    entries: state.history.map((item) => ({
      id: item.id,
      label: item.label,
      meta: `${getCategoryLabel(item.category)} \u00B7 ${item.earned} XP`,
    })),
  };

  const previousPanels = SAMPLE_DAYS.map((sample) => {
    const date = new Date(today);
    date.setDate(today.getDate() - sample.offset);

    return {
      id: formatDateKey(date),
      isToday: false,
      dateLabel: formatDateLabel(date),
      weekdayLabel: formatWeekday(date),
      summary: sample.summary,
      xp: sample.xp,
      count: sample.count,
      mood: sample.mood,
      entries: sample.entries,
    };
  });

  return [todayPanel, ...previousPanels];
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date) {
  return `${date.getMonth() + 1}\uC6D4 ${date.getDate()}\uC77C`;
}

function formatWeekday(date) {
  return ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"][date.getDay()];
}

function getCategoryLabel(category) {
  if (category === "body") return "\uBC14\uB514";
  if (category === "focus") return "\uC9D1\uC911";
  if (category === "mind") return "\uB9C8\uC74C";
  return "\uC0DD\uD65C";
}
