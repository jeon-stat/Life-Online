const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NORMALIZATION_WINDOW_DAYS = 7;
const NORMALIZATION_FLOOR_DAYS = 3;

export function getMembershipDays(joinedAt, referenceDate = new Date()) {
  const joined = parseDate(joinedAt);
  const reference = normalizeDate(referenceDate);

  if (!joined || !reference) {
    return NORMALIZATION_WINDOW_DAYS;
  }

  const elapsedDays = Math.floor((reference.getTime() - joined.getTime()) / MS_PER_DAY) + 1;
  return Math.max(1, elapsedDays);
}

export function getAdjustedWeeklySteps(weeklySteps, joinedAt, referenceDate = new Date()) {
  const membershipDays = Math.min(NORMALIZATION_WINDOW_DAYS, getMembershipDays(joinedAt, referenceDate));
  const normalizedDays = Math.max(NORMALIZATION_FLOOR_DAYS, membershipDays);
  const steps = Math.max(0, Number(weeklySteps ?? 0));

  return steps * (NORMALIZATION_WINDOW_DAYS / normalizedDays);
}

export function getGroupAverageAdjustedWeeklySteps(groupMembers = [], getJoinedAtForFriend = () => null, referenceDate = new Date()) {
  if (!Array.isArray(groupMembers) || !groupMembers.length) {
    return 0;
  }

  const total = groupMembers.reduce((sum, friend) => {
    return sum + getAdjustedWeeklySteps(friend?.weeklySteps ?? 0, getJoinedAtForFriend(friend), referenceDate);
  }, 0);

  return total / groupMembers.length;
}

export function getContributionScore(weeklySteps, groupAverageWeeklySteps, joinedAt, referenceDate = new Date()) {
  const adjustedSteps = getAdjustedWeeklySteps(weeklySteps, joinedAt, referenceDate);
  const average = Math.max(0, Number(groupAverageWeeklySteps ?? 0));

  if (!Number.isFinite(adjustedSteps) || !Number.isFinite(average) || average <= 0) {
    return 0;
  }

  const ratio = adjustedSteps / average;

  if (ratio <= 0.5) {
    return 0;
  }

  if (ratio >= 1.5) {
    return 100;
  }

  if (ratio <= 1) {
    return Math.round(((ratio - 0.5) / 0.5) * 50);
  }

  return Math.round(50 + ((ratio - 1) / 0.5) * 50);
}

function normalizeDate(value) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
