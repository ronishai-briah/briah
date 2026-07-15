import { useMemo, useState } from 'react';
import {
  getMonthGrid,
  isSameMonth,
  isToday,
  toISODate,
  formatMonthTitle,
  formatHebrewDate,
  addMonths,
  isBeforeMonth,
  HEBREW_WEEKDAYS_SHORT,
} from '../utils/dates';
import { generateDefaultEventsForMonth, CALENDAR_START } from '../data/defaultEvents';
import { EVENT_TYPES } from '../data/eventTypes';
import EventForm from './EventForm';

function eventsForDay(events, iso) {
  return events.filter((ev) => {
    if (ev.endDate) return iso >= ev.date && iso <= ev.endDate;
    return ev.date === iso;
  });
}

export default function CalendarView({ customEvents, onAddEvent, onDeleteEvent }) {
  const [year, setYear] = useState(CALENDAR_START.year);
  const [month, setMonth] = useState(CALENDAR_START.month);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const monthEvents = useMemo(() => {
    const defaults = generateDefaultEventsForMonth(year, month);
    const custom = customEvents.filter((ev) => {
      const [y, m] = ev.date.split('-').map(Number);
      return y === year && m - 1 === month;
    });
    return [...defaults, ...custom];
  }, [year, month, customEvents]);

  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const atStart = year === CALENDAR_START.year && month === CALENDAR_START.month;

  function goPrev() {
    if (atStart) return;
    const next = addMonths(year, month, -1);
    if (isBeforeMonth(next.year, next.month, CALENDAR_START.year, CALENDAR_START.month)) return;
    setYear(next.year);
    setMonth(next.month);
    setSelectedDay(null);
  }

  function goNext() {
    const next = addMonths(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
    setSelectedDay(null);
  }

  function goToday() {
    const t = new Date();
    if (isBeforeMonth(t.getFullYear(), t.getMonth(), CALENDAR_START.year, CALENDAR_START.month)) {
      setYear(CALENDAR_START.year);
      setMonth(CALENDAR_START.month);
    } else {
      setYear(t.getFullYear());
      setMonth(t.getMonth());
    }
    setSelectedDay(null);
  }

  const selectedIso = selectedDay ? toISODate(selectedDay) : null;
  const selectedEvents = selectedIso ? eventsForDay(monthEvents, selectedIso) : [];

  return (
    <div className="calendar-view">
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="btn-icon" onClick={goPrev} disabled={atStart} aria-label="חודש קודם">‹</button>
          <h2>{formatMonthTitle(year, month)}</h2>
          <button className="btn-icon" onClick={goNext} aria-label="חודש הבא">›</button>
        </div>
        <div className="calendar-actions">
          <button className="btn-secondary" onClick={goToday}>היום</button>
          <button className="btn-primary" onClick={() => { setSelectedDay(new Date()); setShowForm(true); }}>
            + הוספת אירוע
          </button>
        </div>
      </div>

      <div className="legend">
        {Object.entries(EVENT_TYPES).map(([key, t]) => (
          <span key={key} className="legend-item">
            <span className="dot" style={{ background: t.color }} />
            {t.label}
          </span>
        ))}
      </div>

      <div className="calendar-grid">
        {HEBREW_WEEKDAYS_SHORT.map((w) => (
          <div key={w} className="weekday-header">{w}</div>
        ))}
        {grid.map((day) => {
          const iso = toISODate(day);
          const dayEvents = eventsForDay(monthEvents, iso);
          const inMonth = isSameMonth(day, year, month);
          return (
            <div
              key={iso}
              className={`day-cell ${inMonth ? '' : 'outside'} ${isToday(day) ? 'today' : ''} ${selectedIso === iso ? 'selected' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="day-number">{day.getDate()}</div>
              <div className="day-events">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="event-chip" style={{ background: EVENT_TYPES[ev.type].bg, color: EVENT_TYPES[ev.type].color }}>
                    {ev.name}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="event-more">+{dayEvents.length - 3} נוספים</div>}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="day-detail">
          <div className="day-detail-header">
            <h3>{formatHebrewDate(selectedDay)}</h3>
            <button className="btn-secondary" onClick={() => setShowForm(true)}>+ הוספת אירוע ליום זה</button>
          </div>
          {selectedEvents.length === 0 && !showForm && <p className="empty-note">אין אירועים ביום זה</p>}
          <ul className="day-events-list">
            {selectedEvents.map((ev) => (
              <li key={ev.id}>
                <span className="dot" style={{ background: EVENT_TYPES[ev.type].color }} />
                <div className="day-event-info">
                  <strong>{ev.name}</strong>
                  <span className="event-type-label">{EVENT_TYPES[ev.type].label}</span>
                  {ev.owner && <span className="event-owner">אחראי/ת: {ev.owner}</span>}
                  {ev.notes && <span className="event-notes">{ev.notes}</span>}
                </div>
                {!ev.isDefault && (
                  <button className="btn-delete" onClick={() => onDeleteEvent(ev.id)} aria-label="מחיקת אירוע">✕</button>
                )}
              </li>
            ))}
          </ul>
          {showForm && (
            <EventForm
              initialDate={selectedDay}
              onSubmit={(ev) => { onAddEvent(ev); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
