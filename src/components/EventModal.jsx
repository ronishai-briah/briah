import { useState } from 'react';
import { EVENT_TYPES } from '../data/eventTypes';
import { formatHebrewDate, fromISODate } from '../utils/dates';

function emptyForm(defaultDate, defaultType) {
  return {
    name: '',
    date: defaultDate || '',
    endDate: '',
    multiDay: false,
    type: defaultType,
    owner: '',
    notes: '',
  };
}

function formFromEvent(event) {
  return {
    name: event.name,
    date: event.date,
    endDate: event.endDate || '',
    multiDay: Boolean(event.endDate),
    type: event.type,
    owner: event.owner || '',
    notes: event.notes || '',
  };
}

export default function EventModal({ event, typeOrder, defaultDate, hasOverride, onClose, onSave, onDelete, onReset }) {
  const isNew = !event;
  const [mode, setMode] = useState(isNew ? 'edit' : 'view');
  const [form, setForm] = useState(() =>
    isNew ? emptyForm(defaultDate, typeOrder.find((t) => t !== 'cycle') || typeOrder[0]) : formFromEvent(event)
  );
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.date) {
      setError('נא למלא שם ותאריך');
      return;
    }
    if (form.multiDay && form.endDate && form.endDate < form.date) {
      setError('תאריך הסיום לא יכול להיות לפני תאריך ההתחלה');
      return;
    }
    onSave({
      id: event ? event.id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: form.name.trim(),
      date: form.date,
      endDate: form.multiDay && form.endDate ? form.endDate : undefined,
      type: form.type,
      owner: form.owner.trim(),
      notes: form.notes.trim(),
      isDefault: event ? event.isDefault : false,
      ganttIds: event ? event.ganttIds : undefined,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {mode === 'view' && event && (
          <>
            <div className="modal-header">
              <span className="type-badge" style={{ background: EVENT_TYPES[event.type].bg, color: EVENT_TYPES[event.type].color }}>
                {EVENT_TYPES[event.type].label}
              </span>
              <button className="btn-icon" onClick={onClose} aria-label="סגירה">✕</button>
            </div>
            <h3 className="modal-title">{event.name}</h3>
            <p className="modal-date">
              {formatHebrewDate(fromISODate(event.date))}
              {event.endDate ? ` – ${formatHebrewDate(fromISODate(event.endDate))}` : ''}
            </p>
            {event.owner && <p className="modal-field"><strong>אחראי/ת:</strong> {event.owner}</p>}
            {event.notes && <p className="modal-field"><strong>הערות:</strong> {event.notes}</p>}
            {event.isDefault && <p className="modal-note">אירוע קבוע שנטען אוטומטית</p>}
            <div className="form-actions">
              <button className="btn-primary" onClick={() => setMode('edit')}>עריכה</button>
              <button className="btn-secondary" onClick={() => onDelete(event)}>מחיקה</button>
              {event.isDefault && hasOverride && (
                <button className="btn-secondary" onClick={() => onReset(event.id)}>שחזור לברירת מחדל</button>
              )}
            </div>
          </>
        )}

        {mode === 'edit' && (
          <form className="event-form event-form-modal" onSubmit={handleSave}>
            <h3>{isNew ? 'הוספת אירוע' : 'עריכת אירוע'}</h3>
            {error && <div className="form-error">{error}</div>}
            <label>
              שם האירוע
              <input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
            </label>
            <label>
              תאריך התחלה
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.multiDay} onChange={(e) => set('multiDay', e.target.checked)} />
              אירוע רב-יומי
            </label>
            {form.multiDay && (
              <label>
                תאריך סיום
                <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </label>
            )}
            <label>
              סוג
              <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                {typeOrder.map((t) => (
                  <option key={t} value={t}>{EVENT_TYPES[t].label}</option>
                ))}
              </select>
            </label>
            <label>
              אחראי/ת
              <input value={form.owner} onChange={(e) => set('owner', e.target.value)} />
            </label>
            <label>
              הערות
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary">שמירה</button>
              <button type="button" className="btn-secondary" onClick={isNew ? onClose : () => setMode('view')}>ביטול</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
