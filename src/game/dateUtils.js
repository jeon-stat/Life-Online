export function startOfLocalDay(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return startOfLocalDay(new Date());
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

export function createLocalDateFromKey(dateKey) {
  if (typeof dateKey !== "string") {
    return startOfLocalDay(new Date());
  }

  const [year, month, day] = dateKey.split("-").map((value) => Number(value));
  if (!year || !month || !day) {
    return startOfLocalDay(new Date());
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDateKey(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatDateKey(new Date());
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDateKey(value, fallbackDate = new Date()) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return formatDateKey(value ?? fallbackDate);
}

export function addDays(value, amount) {
  const date = value instanceof Date ? new Date(value) : createLocalDateFromKey(value);
  date.setDate(date.getDate() + Number(amount ?? 0));
  return date;
}

export function compareDateKeys(left, right) {
  return String(left ?? "").localeCompare(String(right ?? ""));
}

export function isBeforeDateKey(left, right) {
  return compareDateKeys(left, right) < 0;
}

export function isTodayDateKey(dateKey, now = new Date()) {
  return normalizeDateKey(dateKey, now) === formatDateKey(now);
}

export function getWeekKey(value) {
  const date = value instanceof Date ? startOfLocalDay(value) : startOfLocalDay(createLocalDateFromKey(value));
  const day = date.getDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - distanceFromMonday);
  return formatDateKey(date);
}

export function formatDisplayDate(dateKey, locale = "ko-KR") {
  const date = createLocalDateFromKey(dateKey);
  return date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function uniqueDateRecords(records = []) {
  const byDate = new Map();

  for (const record of Array.isArray(records) ? records : []) {
    if (!record?.date) {
      continue;
    }

    byDate.set(record.date, record);
  }

  return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date));
}
