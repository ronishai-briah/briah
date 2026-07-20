import { useMemo, useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateEventsForRange, CALENDAR_START } from './data/defaultEvents';
import { GANTTS } from './data/eventTypes';
import GanttBoard from './components/GanttBoard';
import {
  addMonths,
  isBeforeMonth,
  toISODate,
  daysBetween,
  formatMonthTitle,
} from './utils/dates';

const ZOOM_LEVELS = [
  { months: 1, dayWidth: 42, label: 'חודש' },
  { months: 3, dayWidth: 24, label: '3 חודשים' },
  { months: 6, dayWidth: 13, label: 'חצי שנה' },
  { months: 12, dayWidth: 7, label: 'שנה' },
];

function editableFields(event) {
  const { name, date, endDate, type, owner, notes } = event;
  return { name, date, endDate, type, owner, notes };
}

function App() {
  const [activeGantt, setActiveGantt] = useState(1);
  const [rangeStart, setRangeStart] = useState({ year: CALENDAR_START.year, month: CALENDAR_START.month });
  const [zoomIdx, setZoomIdx] = useState(1); // default: 3 months

  const [customEvents, setCustomEvents] = useLocalStorage('briah-custom-events', []);
  const [overrides, setOverrides] = useLocalStorage('briah-overrides', {});
  const [deletedIds, setDeletedIds] = useLocalStorage('briah-deleted-ids', []);

  const zoom = ZOOM_LEVELS[zoomIdx];
  const atStart = rangeStart.year === CALENDAR_START.year && rangeStart.month === CALENDAR_START.month;

  const rangeStartDate = useMemo(() => new Date(rangeStart.year, rangeStart.month, 1), [rangeStart]);
  const rangeEndDate = useMemo(
    () => new Date(rangeStart.year, rangeStart.month + zoom.months, 0),
    [rangeStart, zoom]
  );
  const rangeStartIso = toISODate(rangeStartDate);
  const rangeEndIso = toISODate(rangeEndDate);
  const totalDays = daysBetween(rangeStartDate, rangeEndDate) + 1;

  const rangeLabel = useMemo(() => {
    if (zoom.months === 1) return formatMonthTitle(rangeStart.year, rangeStart.month);
    const end = addMonths(rangeStart.year, rangeStart.month, zoom.months - 1);
    return `${formatMonthTitle(rangeStart.year, rangeStart.month)} – ${formatMonthTitle(end.year, end.month)}`;
  }, [rangeStart, zoom]);

  const mergedEvents = useMemo(() => {
    const generated = generateEventsForRange(rangeStartIso, rangeEndIso).map((ev) =>
      overrides[ev.id] ? { ...ev, ...overrides[ev.id] } : ev
    );
    const custom = customEvents.filter((ev) => {
      const end = ev.endDate || ev.date;
      return ev.date <= rangeEndIso && end >= rangeStartIso;
    });
    return [...generated, ...custom].filter((ev) => !deletedIds.includes(ev.id));
  }, [rangeStartIso, rangeEndIso, overrides, customEvents, deletedIds]);

  function goPrev() {
    if (atStart) return;
    const next = addMonths(rangeStart.year, rangeStart.month, -zoom.months);
    if (isBeforeMonth(next.year, next.month, CALENDAR_START.year, CALENDAR_START.month)) {
      setRangeStart({ year: CALENDAR_START.year, month: CALENDAR_START.month });
    } else {
      setRangeStart(next);
    }
  }

  function goNext() {
    setRangeStart(addMonths(rangeStart.year, rangeStart.month, zoom.months));
  }

  function goToday() {
    const t = new Date();
    if (isBeforeMonth(t.getFullYear(), t.getMonth(), CALENDAR_START.year, CALENDAR_START.month)) {
      setRangeStart({ year: CALENDAR_START.year, month: CALENDAR_START.month });
    } else {
      setRangeStart({ year: t.getFullYear(), month: t.getMonth() });
    }
  }

  function saveEvent(event) {
    if (event.id.startsWith('custom-')) {
      setCustomEvents((prev) => {
        const exists = prev.some((e) => e.id === event.id);
        return exists ? prev.map((e) => (e.id === event.id ? event : e)) : [...prev, event];
      });
    } else {
      setOverrides((prev) => ({ ...prev, [event.id]: editableFields(event) }));
    }
  }

  function deleteEvent(event) {
    if (event.id.startsWith('custom-')) {
      setCustomEvents((prev) => prev.filter((e) => e.id !== event.id));
    } else {
      setDeletedIds((prev) => (prev.includes(event.id) ? prev : [...prev, event.id]));
    }
  }

  function resetOverride(id) {
    setOverrides((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const gantt = GANTTS.find((g) => g.id === activeGantt);
  const boardEvents = mergedEvents.filter((ev) => ev.ganttIds.includes(activeGantt));

  return (
    <div className="app">
      <header className="app-header">
        <h1>בריאה</h1>
        <p className="app-subtitle">קהילת ווילנס בתל אביב — מערכת גאנטים</p>
      </header>

      <nav className="tabs">
        {GANTTS.map((g) => (
          <button
            key={g.id}
            className={`tab-btn ${activeGantt === g.id ? 'active' : ''}`}
            onClick={() => setActiveGantt(g.id)}
          >
            {g.label}
          </button>
        ))}
      </nav>

      <div className="gantt-toolbar">
        <div className="gantt-nav">
          <button className="btn-icon" onClick={goPrev} disabled={atStart} aria-label="טווח קודם">‹</button>
          <h2>{rangeLabel}</h2>
          <button className="btn-icon" onClick={goNext} aria-label="טווח הבא">›</button>
        </div>
        <div className="gantt-toolbar-actions">
          <button className="btn-secondary" onClick={goToday}>היום</button>
          <select value={zoomIdx} onChange={(e) => setZoomIdx(Number(e.target.value))}>
            {ZOOM_LEVELS.map((z, i) => (
              <option key={z.months} value={i}>{z.label}</option>
            ))}
          </select>
        </div>
      </div>

      <main className="app-main">
        <GanttBoard
          key={gantt.id}
          ganttId={gantt.id}
          label={gantt.label}
          subtitle={gantt.subtitle}
          typeOrder={gantt.types}
          events={boardEvents}
          overrides={overrides}
          rangeStart={rangeStartDate}
          totalDays={totalDays}
          dayWidth={zoom.dayWidth}
          onSaveEvent={saveEvent}
          onDeleteEvent={deleteEvent}
          onResetOverride={resetOverride}
        />
      </main>
    </div>
  );
}

export default App;
