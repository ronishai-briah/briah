import { toISODate, fromISODate, DAY_MS } from '../utils/dates';

// Explicit cycles as defined by the community. `end` is the day the cycle
// hands off to the next one (exclusive) — bars are drawn one day short of it.
export const CYCLES = [
  { id: 'cycle-1', name: 'מחזור 1', start: '2026-06-01', end: '2026-09-01', regClose: null },
  { id: 'cycle-2', name: 'מחזור 2', start: '2026-09-01', end: '2026-12-01', regClose: '2026-08-15' },
  { id: 'cycle-3', name: 'מחזור 3', start: '2027-01-01', end: '2027-04-01', regClose: '2026-12-15' },
  { id: 'cycle-4', name: 'מחזור 4', start: '2027-02-01', end: '2027-05-01', regClose: '2027-01-15' },
];

const ROLLING_CYCLES_START = new Date(2027, 0, 1); // 1.1.27, "מחזור 5" ואילך — מחזור חדש כל חודש

// Generates the monthly rolling cycles (5, 6, 7…) up to (and including) horizonIso.
function generateRollingCycles(horizonIso) {
  const horizon = fromISODate(horizonIso);
  const cycles = [];
  let cursor = new Date(ROLLING_CYCLES_START);
  let idx = CYCLES.length + 1;
  while (cursor <= horizon) {
    const start = new Date(cursor);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const regClose = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 15);
    cycles.push({
      id: `cycle-${idx}`,
      name: `מחזור ${idx}`,
      start: toISODate(start),
      end: toISODate(end),
      regClose: toISODate(regClose),
    });
    idx += 1;
    cursor = end;
  }
  return cycles;
}

export function getAllCycles(horizonIso) {
  const rolling = generateRollingCycles(horizonIso);
  const seen = new Set(CYCLES.map((c) => c.id));
  return [...CYCLES, ...rolling.filter((c) => !seen.has(c.id))];
}

// Builds gantt-ready events (cycle bar + registration-close marker) for every
// cycle overlapping [rangeStartIso, rangeEndIso]. These appear on all 3 boards.
export function generateCycleEvents(rangeStartIso, rangeEndIso) {
  const cycles = getAllCycles(rangeEndIso);
  const events = [];

  for (const cycle of cycles) {
    const displayEnd = toISODate(new Date(fromISODate(cycle.end).getTime() - DAY_MS));
    if (cycle.end < rangeStartIso || cycle.start > rangeEndIso) continue;

    events.push({
      id: `${cycle.id}-bar`,
      name: cycle.name,
      date: cycle.start,
      endDate: displayEnd,
      type: 'cycle',
      owner: '',
      notes: `פתיחה: ${cycle.start} · סגירה: ${cycle.end}`,
      isDefault: true,
      ganttIds: [1, 2, 3],
    });

    if (cycle.regClose && cycle.regClose >= rangeStartIso && cycle.regClose <= rangeEndIso) {
      events.push({
        id: `${cycle.id}-regclose`,
        name: `סגירת הרשמה — ${cycle.name}`,
        date: cycle.regClose,
        type: 'cycle',
        owner: '',
        notes: '',
        isDefault: true,
        ganttIds: [1, 2, 3],
      });
    }
  }

  return events;
}
