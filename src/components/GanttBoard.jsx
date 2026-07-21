import { useMemo, useState } from 'react';
import { EVENT_TYPES } from '../data/eventTypes';
import { fromISODate, daysBetween, isToday, HEBREW_MONTHS } from '../utils/dates';
import EventModal from './EventModal';

const ROW_HEIGHT = 30;
const BAR_GAP = 4;

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function buildDays(rangeStart, totalDays) {
  const days = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(rangeStart);
    d.setDate(rangeStart.getDate() + i);
    days.push(d);
  }
  return days;
}

function buildMonthSegments(days, dayWidth) {
  const segments = [];
  for (const d of days) {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const last = segments[segments.length - 1];
    if (last && last.key === key) {
      last.count += 1;
    } else {
      segments.push({ key, label: `${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`, count: 1 });
    }
  }
  return segments.map((s) => ({ ...s, width: s.count * dayWidth }));
}

function packLanes(events, rangeStart, totalDays) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const laneEnds = [];
  const positioned = sorted.map((ev) => {
    const rawStart = daysBetween(rangeStart, fromISODate(ev.date));
    const rawEnd = daysBetween(rangeStart, fromISODate(ev.endDate || ev.date));
    const startIdx = clamp(rawStart, 0, totalDays - 1);
    const endIdx = clamp(Math.max(rawEnd, rawStart), 0, totalDays - 1);
    let lane = laneEnds.findIndex((end) => end < startIdx);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(endIdx);
    } else {
      laneEnds[lane] = endIdx;
    }
    return { ...ev, startIdx, endIdx, lane };
  });
  return { positioned, laneCount: Math.max(laneEnds.length, 1) };
}

export default function GanttBoard({
  ganttId,
  label,
  subtitle,
  typeOrder,
  events,
  overrides,
  rangeStart,
  totalDays,
  dayWidth,
  onSaveEvent,
  onDeleteEvent,
  onResetOverride,
}) {
  const [activeTypes, setActiveTypes] = useState(() => new Set(typeOrder));
  const [selected, setSelected] = useState(null); // event being viewed/edited, or 'new'

  const days = useMemo(() => buildDays(rangeStart, totalDays), [rangeStart, totalDays]);
  const monthSegments = useMemo(() => buildMonthSegments(days, dayWidth), [days, dayWidth]);
  const todayIdx = useMemo(() => {
    const idx = daysBetween(rangeStart, new Date(new Date().setHours(0, 0, 0, 0)));
    return idx >= 0 && idx < totalDays ? idx : null;
  }, [rangeStart, totalDays]);

  const groups = useMemo(() => {
    return typeOrder
      .filter((t) => activeTypes.has(t))
      .map((type) => {
        const typeEvents = events.filter((ev) => ev.type === type);
        const { positioned, laneCount } = packLanes(typeEvents, rangeStart, totalDays);
        return { type, positioned, laneCount };
      });
  }, [typeOrder, activeTypes, events, rangeStart, totalDays]);

  function toggleType(type) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function closeModal() {
    setSelected(null);
  }

  function handleSave(event) {
    onSaveEvent(event);
    closeModal();
  }

  function handleDelete(event) {
    onDeleteEvent(event);
    closeModal();
  }

  function handleReset(id) {
    onResetOverride(id);
    closeModal();
  }

  const totalWidth = totalDays * dayWidth;
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className="gantt-board">
      <div className="gantt-board-head">
        <div>
          <h2>{label}</h2>
          <p className="gantt-subtitle">{subtitle}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setSelected('new')}
        >
          + הוספת אירוע
        </button>
      </div>

      <div className="legend legend-filter">
        {typeOrder.map((t) => (
          <button
            key={t}
            className={`legend-item legend-toggle ${activeTypes.has(t) ? '' : 'off'}`}
            onClick={() => toggleType(t)}
          >
            <span className="dot" style={{ background: EVENT_TYPES[t].color }} />
            {EVENT_TYPES[t].label}
          </button>
        ))}
      </div>

      <div className="gantt-body">
        <div className="gantt-sidebar">
          <div className="gantt-sidebar-spacer" />
          {groups.map((g) => (
            <div
              key={g.type}
              className="gantt-row-label"
              style={{ height: g.laneCount * ROW_HEIGHT }}
            >
              <span className="dot" style={{ background: EVENT_TYPES[g.type].color }} />
              <span>{EVENT_TYPES[g.type].label}</span>
              <span className="gantt-row-count">{g.positioned.length}</span>
            </div>
          ))}
        </div>

        <div className="gantt-scroll">
          <div className="gantt-timeline" style={{ width: totalWidth }}>
            <div className="gantt-header">
              <div className="gantt-header-months">
                {monthSegments.map((seg) => (
                  <div key={seg.key} className="gantt-month-seg" style={{ width: seg.width }}>
                    {seg.label}
                  </div>
                ))}
              </div>
              <div className="gantt-header-days">
                {days.map((d) => {
                  const iso = d.toISOString().slice(0, 10);
                  const weekend = d.getDay() === 5 || d.getDay() === 6;
                  return (
                    <div
                      key={iso}
                      className={`gantt-day-cell ${weekend ? 'weekend' : ''} ${isToday(d) ? 'today' : ''}`}
                      style={{ width: dayWidth }}
                    >
                      {dayWidth >= 16 ? d.getDate() : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {todayIdx !== null && (
              <div
                className="gantt-today-line"
                style={{ right: todayIdx * dayWidth + dayWidth / 2 }}
                title={`היום — ${todayIso}`}
              />
            )}

            {groups.map((g) => (
              <div key={g.type} className="gantt-track" style={{ height: g.laneCount * ROW_HEIGHT }}>
                <div className="gantt-track-grid">
                  {days.map((d) => (
                    <div
                      key={d.toISOString()}
                      className={`gantt-grid-cell ${d.getDay() === 5 || d.getDay() === 6 ? 'weekend' : ''}`}
                      style={{ width: dayWidth }}
                    />
                  ))}
                </div>
                {g.positioned.length === 0 && (
                  <div className="gantt-empty-row">אין אירועים בטווח זה</div>
                )}
                {g.positioned.map((ev) => {
                  const spanDays = ev.endIdx - ev.startIdx + 1;
                  const width = spanDays * dayWidth - BAR_GAP;
                  const isMilestone = width < 56;
                  if (isMilestone) {
                    const center = ev.startIdx * dayWidth + (spanDays * dayWidth) / 2;
                    return (
                      <button
                        key={ev.id}
                        className="gantt-milestone"
                        style={{
                          right: center - 6,
                          top: ev.lane * ROW_HEIGHT + 9,
                          background: EVENT_TYPES[ev.type].color,
                        }}
                        onClick={() => setSelected(ev)}
                        title={ev.name}
                        aria-label={ev.name}
                      />
                    );
                  }
                  return (
                    <button
                      key={ev.id}
                      className="gantt-bar"
                      style={{
                        right: ev.startIdx * dayWidth + BAR_GAP / 2,
                        width: Math.max(width, 6),
                        top: ev.lane * ROW_HEIGHT + 3,
                        background: EVENT_TYPES[ev.type].bg,
                        color: EVENT_TYPES[ev.type].color,
                        borderColor: EVENT_TYPES[ev.type].color,
                      }}
                      onClick={() => setSelected(ev)}
                      title={ev.name}
                    >
                      {ev.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <EventModal
          event={selected === 'new' ? null : selected}
          typeOrder={typeOrder}
          defaultDate={todayIso}
          hasOverride={selected !== 'new' && Boolean(overrides[selected.id])}
          onClose={closeModal}
          onSave={(ev) => handleSave({ ...ev, ganttIds: ev.ganttIds || [ganttId] })}
          onDelete={handleDelete}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
