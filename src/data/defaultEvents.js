import {
  toISODate,
  fromISODate,
  nthWeekdayOfMonth,
  allWeekdaysInMonth,
  addMonths,
  DAY_MS,
} from '../utils/dates';
import { generateCycleEvents } from './cycles';
import { generateBirthdayEvents } from './birthdays';

// Weekday indices below match Date#getDay(): 0=Sunday ... 6=Saturday

// Verified against the Hebrew calendar (hebcal), Israel day counts.
const HOLIDAYS = [
  { id: 'h-rosh-hashana-2026', name: 'ראש השנה', start: '2026-09-12', end: '2026-09-13' },
  { id: 'h-yom-kippur-2026', name: 'יום כיפור', start: '2026-09-21', end: '2026-09-21' },
  { id: 'h-sukkot-2026', name: 'סוכות', start: '2026-09-26', end: '2026-10-02' },
  { id: 'h-simchat-torah-2026', name: 'שמחת תורה', start: '2026-10-03', end: '2026-10-03' },
  { id: 'h-hanukkah-2026', name: 'חנוכה', start: '2026-12-05', end: '2026-12-12' },
  { id: 'h-tu-bishvat-2027', name: 'ט"ו בשבט', start: '2027-02-04', end: '2027-02-04' },
  { id: 'h-purim-2027', name: 'פורים', start: '2027-03-14', end: '2027-03-14' },
  { id: 'h-pesach-2027', name: 'פסח', start: '2027-03-28', end: '2027-04-03' },
  { id: 'h-yom-haatzmaut-2027', name: 'יום העצמאות', start: '2027-05-12', end: '2027-05-12' },
  { id: 'h-shavuot-2027', name: 'שבועות', start: '2027-05-17', end: '2027-05-17' },
];

// The real, community-supplied schedule for August 2026 (לוז חודש אוגוסט).
// Weekly יוגה is handled by the recurring rule above; everything else here
// is the specific one-off programming for the month.
const STATIC_COMMUNITY_EVENTS = [
  { id: 'aug26-04', name: 'ECSTATIC BRIAH', date: '2026-08-04', owner: 'DJ יערה ראוף', notes: '20:30–22:00' },
  { id: 'aug26-06', name: 'סאונד הילינג', date: '2026-08-06', owner: 'דודן', notes: '20:00–21:30' },
  { id: 'aug26-07', name: 'מדיטציה ונשימה מודעת', date: '2026-08-07', owner: 'עינב ומאיר', notes: '13:00–15:00' },
  { id: 'aug26-09', name: 'ריברסינג', date: '2026-08-09', owner: 'ניצן פהימה', notes: '20:00–22:30' },
  { id: 'aug26-11', name: 'ביטוי קולי', date: '2026-08-11', owner: 'רוני שי', notes: '20:30–22:00' },
  { id: 'aug26-12', name: 'ערב פתוח', date: '2026-08-12', owner: 'בואו להכיר אותנו :)', notes: '20:30–22:00' },
  { id: 'aug26-13', name: 'דמיון מודרך וכלים לריפוי עצמי', date: '2026-08-13', owner: 'תומר זבולון', notes: '20:00–21:30' },
  { id: 'aug26-16', name: 'מעגל בריאה', date: '2026-08-16', owner: 'צוות', notes: '20:30–22:00' },
  { id: 'aug26-18', name: 'ערב פתוח', date: '2026-08-18', owner: 'בואו להכיר אותנו :)', notes: '20:30–22:00' },
  { id: 'aug26-19', name: 'ביטוי קולי', date: '2026-08-19', owner: 'רוני שי', notes: '20:30–22:00' },
  { id: 'aug26-20', name: 'סאונד הילינג', date: '2026-08-20', owner: 'דודן', notes: '20:00–21:30' },
  { id: 'aug26-23', name: 'הרצאת אורח וערב קהילה', date: '2026-08-23', owner: 'בסטודיו | ניצן פרי', notes: '19:30–21:30' },
  { id: 'aug26-25', name: 'מסע נשימה וצלילים מרפאים', date: '2026-08-25', owner: 'עופרי', notes: '20:30–22:00' },
  { id: 'aug26-26', name: 'ערב פתוח', date: '2026-08-26', owner: 'בואו להכיר אותנו :)', notes: '20:30–22:00' },
  { id: 'aug26-28', name: 'ריברסינג', date: '2026-08-28', owner: 'ניצן פהימה', notes: '12:30–14:30' },
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

  for (const d of allWeekdaysInMonth(year, month, 1)) { // Monday
    events.push(makeEvent({
      id: `yoga-${toISODate(d)}`,
      name: 'יוגה סומטית ושירה מרפאת',
      date: d,
      type: 'community',
      ganttIds: [1],
      owner: 'רוני שי',
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

  for (const ev of STATIC_COMMUNITY_EVENTS) {
    if (ev.date >= monthStart && ev.date <= monthEnd) {
      events.push({
        id: ev.id,
        name: ev.name,
        date: ev.date,
        type: 'community',
        ganttIds: [1],
        owner: ev.owner,
        notes: ev.notes,
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
  const birthdays = generateBirthdayEvents(rangeStartIso, rangeEndIso);
  return [...cycles, ...recurring, ...birthdays];
}

export const CALENDAR_START = { year: 2026, month: 5 }; // June 2026 — start of cycle 1
