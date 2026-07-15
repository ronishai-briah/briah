import {
  toISODate,
  nthWeekdayOfMonth,
  allWeekdaysInMonth,
  addMonths,
} from '../utils/dates';

// Weekday indices: 0=Monday ... 6=Sunday

const HOLIDAYS = [
  { id: 'h-yom-kippur-2026', name: 'יום כיפור', start: '2026-10-01', end: '2026-10-01' },
  { id: 'h-sukkot-2026', name: 'סוכות', start: '2026-10-06', end: '2026-10-12' },
  { id: 'h-hanukkah-2026', name: 'חנוכה', start: '2026-12-14', end: '2026-12-14' },
  { id: 'h-purim-2027', name: 'פורים', start: '2027-03-27', end: '2027-03-27' },
  { id: 'h-pesach-2027', name: 'פסח', start: '2027-04-27', end: '2027-04-27' },
  { id: 'h-rosh-hashana-2027', name: 'ראש השנה', start: '2027-09-27', end: '2027-09-27' },
];

const BIWEEKLY_REFERENCE = new Date(2026, 7, 2); // first Sunday of Aug 2026

function makeEvent({ id, name, date, endDate, type, owner, notes }) {
  return {
    id,
    name,
    date: toISODate(date),
    endDate: endDate ? toISODate(endDate) : undefined,
    type,
    owner: owner || '',
    notes: notes || '',
    isDefault: true,
  };
}

export function generateDefaultEventsForMonth(year, month) {
  const events = [];

  const cycleOpen = new Date(year, month, 1);
  events.push(makeEvent({
    id: `cycle-open-${year}-${month}`,
    name: 'פתיחת מחזור חדש',
    date: cycleOpen,
    type: 'cycle',
    owner: 'צוות ניהול',
  }));

  const regClose = new Date(year, month, 15);
  events.push(makeEvent({
    id: `reg-close-${year}-${month}`,
    name: 'סגירת הרשמה למחזור הבא',
    date: regClose,
    type: 'cycle',
    owner: 'צוות ניהול',
  }));

  for (const d of allWeekdaysInMonth(year, month, 2)) { // Tuesday
    events.push(makeEvent({
      id: `yoga-${toISODate(d)}`,
      name: 'יוגה שבועית',
      date: d,
      type: 'community',
      owner: 'מדריך/ת יוגה',
    }));
  }

  const wellnessCircle = nthWeekdayOfMonth(year, month, 3, 2); // 2nd Wednesday
  if (wellnessCircle) {
    events.push(makeEvent({
      id: `wellness-circle-${year}-${month}`,
      name: 'מעגל בריאה',
      date: wellnessCircle,
      type: 'community',
    }));
  }

  const lecture = nthWeekdayOfMonth(year, month, 4, 3); // 3rd Thursday
  if (lecture) {
    events.push(makeEvent({
      id: `lecture-${year}-${month}`,
      name: 'הרצאה',
      date: lecture,
      type: 'community',
    }));
  }

  const staffMeeting = nthWeekdayOfMonth(year, month, 1, 1); // 1st Monday
  if (staffMeeting) {
    events.push(makeEvent({
      id: `staff-meeting-${year}-${month}`,
      name: 'ישיבת צוות',
      date: staffMeeting,
      type: 'staff',
    }));
  }

  const training = nthWeekdayOfMonth(year, month, 1, 3); // 3rd Monday
  if (training) {
    events.push(makeEvent({
      id: `training-${year}-${month}`,
      name: 'הדרכה',
      date: training,
      type: 'staff',
    }));
  }

  for (const d of allWeekdaysInMonth(year, month, 0)) { // Sunday
    const weeksSinceRef = Math.round((d - BIWEEKLY_REFERENCE) / (7 * 24 * 60 * 60 * 1000));
    if (weeksSinceRef % 2 === 0) {
      events.push(makeEvent({
        id: `mentors-${toISODate(d)}`,
        name: 'פגישת מלווים',
        date: d,
        type: 'staff',
      }));
    }
  }

  for (const h of HOLIDAYS) {
    const start = h.start;
    const end = h.end;
    const monthStart = toISODate(new Date(year, month, 1));
    const monthEnd = toISODate(new Date(year, month + 1, 0));
    if (end >= monthStart && start <= monthEnd) {
      events.push({
        id: h.id,
        name: h.name,
        date: start,
        endDate: end !== start ? end : undefined,
        type: 'holiday',
        owner: '',
        notes: '',
        isDefault: true,
      });
    }
  }

  return events;
}

export function generateDefaultEventsForRange(startYear, startMonth, endYear, endMonth) {
  const events = [];
  let cursor = { year: startYear, month: startMonth };
  while (cursor.year < endYear || (cursor.year === endYear && cursor.month <= endMonth)) {
    events.push(...generateDefaultEventsForMonth(cursor.year, cursor.month));
    cursor = addMonths(cursor.year, cursor.month, 1);
  }
  return events;
}

export const CALENDAR_START = { year: 2026, month: 7 }; // August 2026
