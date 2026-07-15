import { useState } from 'react';
import { EVENT_TYPE_ORDER, EVENT_TYPES } from '../data/eventTypes';
import { toISODate } from '../utils/dates';

export default function EventForm({ initialDate, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(initialDate ? toISODate(initialDate) : '');
  const [type, setType] = useState('community');
  const [owner, setOwner] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !date) {
      setError('נא למלא שם ותאריך');
      return;
    }
    onSubmit({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      date,
      type,
      owner: owner.trim(),
      notes: notes.trim(),
      isDefault: false,
    });
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h3>הוספת אירוע</h3>
      {error && <div className="form-error">{error}</div>}
      <label>
        שם האירוע
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <label>
        תאריך
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label>
        סוג
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {EVENT_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{EVENT_TYPES[t].label}</option>
          ))}
        </select>
      </label>
      <label>
        אחראי/ת
        <input value={owner} onChange={(e) => setOwner(e.target.value)} />
      </label>
      <label>
        הערות
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn-primary">הוספה</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  );
}
