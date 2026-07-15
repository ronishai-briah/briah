import { useMemo, useState } from 'react';
import { generateDefaultEventsForRange, CALENDAR_START } from '../data/defaultEvents';
import { addMonths, formatHebrewDate, fromISODate } from '../utils/dates';
import { EVENT_TYPE_ORDER, EVENT_TYPES } from '../data/eventTypes';
import EventForm from './EventForm';

const RANGE_MONTHS = 24;

export default function EventsListView({ customEvents, onAddEvent, onDeleteEvent }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const allEvents = useMemo(() => {
    const end = addMonths(CALENDAR_START.year, CALENDAR_START.month, RANGE_MONTHS - 1);
    const defaults = generateDefaultEventsForRange(
      CALENDAR_START.year, CALENDAR_START.month, end.year, end.month
    );
    return [...defaults, ...customEvents].sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEvents.filter((ev) => {
      if (typeFilter !== 'all' && ev.type !== typeFilter) return false;
      if (!q) return true;
      return (
        ev.name.toLowerCase().includes(q) ||
        (ev.owner || '').toLowerCase().includes(q) ||
        (ev.notes || '').toLowerCase().includes(q)
      );
    });
  }, [allEvents, typeFilter, search]);

  return (
    <div className="events-list-view">
      <div className="list-toolbar">
        <div className="list-filters">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">כל הסוגים</option>
            {EVENT_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>{EVENT_TYPES[t].label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="חיפוש לפי שם, אחראי או הערה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ הוספת אירוע</button>
      </div>

      {showForm && (
        <div className="inline-form-wrap">
          <EventForm
            onSubmit={(ev) => { onAddEvent(ev); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>תאריך</th>
              <th>שם האירוע</th>
              <th>סוג</th>
              <th>אחראי/ת</th>
              <th>הערות</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev) => (
              <tr key={ev.id}>
                <td>{formatHebrewDate(fromISODate(ev.date))}{ev.endDate ? ` – ${formatHebrewDate(fromISODate(ev.endDate))}` : ''}</td>
                <td>{ev.name}</td>
                <td>
                  <span className="type-badge" style={{ background: EVENT_TYPES[ev.type].bg, color: EVENT_TYPES[ev.type].color }}>
                    {EVENT_TYPES[ev.type].label}
                  </span>
                </td>
                <td>{ev.owner || '—'}</td>
                <td>{ev.notes || '—'}</td>
                <td>
                  {!ev.isDefault && (
                    <button className="btn-delete" onClick={() => onDeleteEvent(ev.id)} aria-label="מחיקת אירוע">✕</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-note">לא נמצאו אירועים</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
