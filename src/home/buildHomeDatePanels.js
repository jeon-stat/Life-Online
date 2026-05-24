const SAMPLE_DAYS = [
  {
    offset: 1,
    xp: 54,
    count: 3,
    mood: "차분",
    summary: "집중 세션과 하루 회고를 마무리한 날",
    entries: [
      { id: "sample-focus-1", label: "집중 세션", meta: "20 XP · 집중" },
      { id: "sample-walk-1", label: "걸음 목표", meta: "18 XP · 바디" },
      { id: "sample-reflection-1", label: "하루 회고", meta: "10 XP · 마음" },
    ],
  },
  {
    offset: 2,
    xp: 38,
    count: 2,
    mood: "개운",
    summary: "정리 리셋과 수면 준비로 리듬을 회복한 날",
    entries: [
      { id: "sample-tidy-2", label: "정리 리셋", meta: "12 XP · 생활" },
      { id: "sample-wind-2", label: "수면 준비", meta: "16 XP · 바디" },
    ],
  },
  {
    offset: 3,
    xp: 62,
    count: 4,
    mood: "몰입",
    summary: "짧지만 강하게 몰입이 잘 된 날",
    entries: [
      { id: "sample-focus-3", label: "집중 세션", meta: "20 XP · 집중" },
      { id: "sample-focus-3b", label: "집중 세션", meta: "14 XP · 집중" },
      { id: "sample-walk-3", label: "걸음 목표", meta: "18 XP · 바디" },
      { id: "sample-reflection-3", label: "하루 회고", meta: "10 XP · 마음" },
    ],
  },
  {
    offset: 4,
    xp: 24,
    count: 2,
    mood: "준비",
    summary: "가볍게 흐름만 살린 날",
    entries: [
      { id: "sample-walk-4", label: "걸음 목표", meta: "18 XP · 바디" },
      { id: "sample-reflection-4", label: "하루 회고", meta: "10 XP · 마음" },
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
      meta: `${getCategoryLabel(item.category)} · ${item.earned} XP`,
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
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatWeekday(date) {
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
}

function getCategoryLabel(category) {
  if (category === "body") return "바디";
  if (category === "focus") return "집중";
  if (category === "mind") return "마음";
  return "생활";
}
