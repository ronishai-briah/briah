export const DAY_MS = 24 * 60 * 60 * 1000;

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export const HEBREW_WEEKDAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

// local YYYY-MM-DD, no timezone shifting
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addMonths(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isBeforeMonth(year, month, refYear, refMonth) {
  return year < refYear || (year === refYear && month < refMonth);
}

export function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// nth weekday (0=Sunday..6=Saturday, matches Date#getDay) occurrence in a given month; n is 1-based
export function nthWeekdayOfMonth(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  const result = new Date(year, month, day);
  if (result.getMonth() !== month) return null;
  return result;
}

// every occurrence of a weekday (0=Sunday..6=Saturday) within a given month
export function allWeekdaysInMonth(year, month, weekday) {
  const results = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (d.getDay() === weekday) results.push(d);
  }
  return results;
}

export function daysBetween(a, b) {
  return Math.round((b - a) / DAY_MS);
}

export function formatHebrewDate(date) {
  return `${date.getDate()} ב${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthTitle(year, month) {
  return `${HEBREW_MONTHS[month]} ${year}`;
}
