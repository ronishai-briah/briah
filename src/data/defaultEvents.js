import {
  toISODate,
  fromISODate,
  nthWeekdayOfMonth,
  allWeekdaysInMonth,
  addMonths,
  DAY_MS,
} from '../utils/dates';
import { generateCycleEvents } from './cycles';

// Weekday indices below match Date#getDay(): 0=Sunday ... 6=Saturday

const HOLIDAYS = [
  { id: 'h-yom-kippur-2026', name: 'יום כיפור', start: '2026-10-01', end: '2026-10-01' },
  { id: 'h-sukkot-2026', name: 'סוכות', start: '2026-10-06', end: '2026-10-12' },
  { id: 'h-hanukkah-2026', name: 'חנוכה', start: '2026-12-14', end: '2026-12-22' },
];

function makeEvent({ id, name, date, endDate, type, ganttIds, owner, notes }) {
  return {
    id,
    name,
    date: toISODate(date),
    endDate: endDate ? toISODate(endDate) : undefined,
    type,
    ganttIds,
    owner: owner || '',
    notes: notes || '',
    isDefault: true,
  };
}

// The fixed recurring events that load automatically every month, per the
// community's operating rhythm.
export function generateRecurringEventsForMonth(year, month) {
  const events = [];

  const luzDeadline = new Date(year, month, 15);
  events.push(makeEvent({
    id: `luz-deadline-${year}-${month}`,
    name: 'דד-ליין שליחת לוז לצוות',
    date: luzDeadline,
    type: 'staff',
    ganttIds: [1],
  }));

  const payroll = new Date(year, month, 10);
  events.push(makeEvent({
    id: `payroll-${year}-${month}`,
    name: 'משכורות',
    date: payroll,
    type: 'financial',
    ganttIds: [3],
  }));

  for (const d of allWeekdaysInMonth(year, month, 2)) { // Tuesday
    events.push(makeEvent({
      id: `yoga-${toISODate(d)}`,
      name: 'יוגה שבועית',
      date: d,
      type: 'community',
      ganttIds: [1],
    }));
  }

  for (const d of allWeekdaysInMonth(year, month, 0)) { // Sunday
    events.push(makeEvent({
      id: `mentor-value-${toISODate(d)}`,
      name: 'שליחת ערך בקבוצת הווטסאפ',
      date: d,
      type: 'community',
      ganttIds: [1],
      owner: 'מלווה',
    }));
  }

  const wellnessCircle = nthWeekdayOfMonth(year, month, 3, 2); // 2nd Wednesday
  if (wellnessCircle) {
    events.push(makeEvent({
      id: `wellness-circle-${year}-${month}`,
      name: 'מעגל בריאה',
      date: wellnessCircle,
      type: 'community',
      ganttIds: [1],
    }));
  }

  const lecture = nthWeekdayOfMonth(year, month, 4, 3); // 3rd Thursday
  if (lecture) {
    events.push(makeEvent({
      id: `lecture-${year}-${month}`,
      name: 'הרצאה',
      date: lecture,
      type: 'marketing',
      ganttIds: [2],
    }));
  }

  // Landing page + ad prep starts a month before the *next* month's lecture.
  const nextMonth = addMonths(year, month, 1);
  const nextLecture = nthWeekdayOfMonth(nextMonth.year, nextMonth.month, 4, 3);
  if (nextLecture) {
    const lecturePrep = new Date(nextLecture.getTime() - 30 * DAY_MS);
    if (lecturePrep.getFullYear() === year && lecturePrep.getMonth() === month) {
      events.push(makeEvent({
        id: `lecture-prep-${nextMonth.year}-${nextMonth.month}`,
        name: 'בדיקת דף נחיתה + התחלת פרסום (לקראת ההרצאה)',
        date: lecturePrep,
        type: 'marketing',
        ganttIds: [2],
      }));
    }
  }

  const campaignStrategy = new Date(year, month, 2); // 2nd of the month
  events.push(makeEvent({
    id: `campaign-strategy-${year}-${month}`,
    name: 'ישיבת אסטרטגיית קמפיינים',
    date: campaignStrategy,
    type: 'marketing',
    ganttIds: [2],
    notes: 'בחינת הגאנט החודשי קדימה, נושאים לדיון וסוגי תכנים לחודש',
  }));

  const shootDay = nthWeekdayOfMonth(year, month, 2, 3); // 3rd Tuesday
  if (shootDay) {
    events.push(makeEvent({
      id: `shoot-day-${year}-${month}`,
      name: 'יום צילום',
      date: shootDay,
      type: 'marketing',
      ganttIds: [2],
    }));
  }

  const contentMeeting = nthWeekdayOfMonth(year, month, 4, 2); // 2nd Thursday
  if (contentMeeting) {
    events.push(makeEvent({
      id: `content-meeting-${year}-${month}`,
      name: 'פגישת תוכן',
      date: contentMeeting,
      type: 'marketing',
      ganttIds: [2],
      owner: 'רוני, עינב וניצן',
    }));
  }

  const staffEvening = nthWeekdayOfMonth(year, month, 0, 2); // 2nd Sunday
  if (staffEvening) {
    events.push(makeEvent({
      id: `staff-evening-${year}-${month}`,
      name: 'ערב צוות',
      date: staffEvening,
      type: 'staff',
      ganttIds: [1],
    }));
  }

  const training = nthWeekdayOfMonth(year, month, 1, 3); // 3rd Monday
  if (training) {
    events.push(makeEvent({
      id: `training-${year}-${month}`,
      name: 'הדרכה מקצועית',
      date: training,
      type: 'staff',
      ganttIds: [1],
      owner: 'ניצן, מטפלים ומלווים',
    }));
  }

  const staffMeeting = nthWeekdayOfMonth(year, month, 1, 1); // 1st Monday
  if (staffMeeting) {
    events.push(makeEvent({
      id: `staff-meeting-${year}-${month}`,
      name: 'ישיבת צוות',
      date: staffMeeting,
      type: 'staff',
      ganttIds: [1],
      owner: 'כולם',
    }));
  }

  const ganttMeeting = nthWeekdayOfMonth(year, month, 3, 1); // 1st Wednesday
  if (ganttMeeting) {
    events.push(makeEvent({
      id: `gantt-meeting-${year}-${month}`,
      name: 'פגישת גאנטים',
      date: ganttMeeting,
      type: 'staff',
      ganttIds: [1],
      owner: 'רוני וניצן',
    }));
  }

  const budgetMeeting = nthWeekdayOfMonth(year, month, 4, 1); // 1st Thursday
  if (budgetMeeting) {
    events.push(makeEvent({
      id: `budget-meeting-${year}-${month}`,
      name: 'פגישת תקציב',
      date: budgetMeeting,
      type: 'financial',
      ganttIds: [3],
      owner: 'רוני וניצן',
    }));
  }

  const partnershipHealth = nthWeekdayOfMonth(year, month, 3, 4); // 4th Wednesday
  if (partnershipHealth) {
    events.push(makeEvent({
      id: `partnership-health-${year}-${month}`,
      name: 'בריאות השותפות',
      date: partnershipHealth,
      type: 'staff',
      ganttIds: [1],
      owner: 'רוני וניצן',
    }));
  }

  const staffWorkshop = nthWeekdayOfMonth(year, month, 1, 4); // 4th Monday
  if (staffWorkshop) {
    events.push(makeEvent({
      id: `staff-workshop-${year}-${month}`,
      name: 'סדנת צוות',
      date: staffWorkshop,
      type: 'staff',
      ganttIds: [1],
      owner: 'רוטציה',
    }));
  }

  const mentorOneOnOneMeir = nthWeekdayOfMonth(year, month, 2, 1); // 1st Tuesday
  if (mentorOneOnOneMeir) {
    events.push(makeEvent({
      id: `mentor-1on1-meir-${year}-${month}`,
      name: 'אחד-על-אחד מלווים',
      date: mentorOneOnOneMeir,
      type: 'staff',
      ganttIds: [1],
      owner: 'ניצן ומאיר',
    }));
  }

  const mentorOneOnOneShachar = nthWeekdayOfMonth(year, month, 2, 3); // 3rd Tuesday
  if (mentorOneOnOneShachar) {
    events.push(makeEvent({
      id: `mentor-1on1-shachar-${year}-${month}`,
      name: 'אחד-על-אחד מלווים',
      date: mentorOneOnOneShachar,
      type: 'staff',
      ganttIds: [1],
      owner: 'ניצן ושחר',
    }));
  }

  const therapistsMeeting = nthWeekdayOfMonth(year, month, 1, 2); // 2nd Monday
  if (therapistsMeeting) {
    events.push(makeEvent({
      id: `therapists-meeting-${year}-${month}`,
      name: 'פגישת מטפלים',
      date: therapistsMeeting,
      type: 'staff',
      ganttIds: [1],
      owner: 'רוני',
    }));
  }

  const monthStart = toISODate(new Date(year, month, 1));
  const monthEnd = toISODate(new Date(year, month + 1, 0));
  for (const h of HOLIDAYS) {
    if (h.end >= monthStart && h.start <= monthEnd) {
      events.push({
        id: h.id,
        name: h.name,
        date: h.start,
        endDate: h.end !== h.start ? h.end : undefined,
        type: 'holiday',
        ganttIds: [1],
        owner: '',
        notes: '',
        isDefault: true,
      });
    }
  }

  return events;
}

export function generateRecurringEventsForRange(startYear, startMonth, endYear, endMonth) {
  const events = [];
  let cursor = { year: startYear, month: startMonth };
  while (cursor.year < endYear || (cursor.year === endYear && cursor.month <= endMonth)) {
    events.push(...generateRecurringEventsForMonth(cursor.year, cursor.month));
    cursor = addMonths(cursor.year, cursor.month, 1);
  }
  return events;
}

// All generated (non-custom) events overlapping [rangeStartIso, rangeEndIso]:
// recurring monthly events + cycle bars/registration markers.
export function generateEventsForRange(rangeStartIso, rangeEndIso) {
  const start = fromISODate(rangeStartIso);
  const end = fromISODate(rangeEndIso);
  const recurring = generateRecurringEventsForRange(
    start.getFullYear(), start.getMonth(), end.getFullYear(), end.getMonth()
  );
  const cycles = generateCycleEvents(rangeStartIso, rangeEndIso);
  return [...cycles, ...recurring];
}

export const CALENDAR_START = { year: 2026, month: 5 }; // June 2026 — start of cycle 1
