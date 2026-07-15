import { useState } from 'react';
import { formatHebrewDate, fromISODate } from '../utils/dates';

function TeamMemberForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('נא למלא שם ותפקיד');
      return;
    }
    onSubmit({
      id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      role: role.trim(),
      birthday,
    });
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h3>הוספת איש/אשת צוות</h3>
      {error && <div className="form-error">{error}</div>}
      <label>
        שם מלא
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </label>
      <label>
        תפקיד
        <input value={role} onChange={(e) => setRole(e.target.value)} />
      </label>
      <label>
        יום הולדת
        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn-primary">הוספה</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>ביטול</button>
      </div>
    </form>
  );
}

export default function TeamView({ team, onAddMember, onDeleteMember }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="team-view">
      <div className="list-toolbar">
        <h2>צוות בריאה</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ הוספת איש/אשת צוות</button>
      </div>

      {showForm && (
        <div className="inline-form-wrap">
          <TeamMemberForm
            onSubmit={(m) => { onAddMember(m); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="team-grid">
        {team.map((member) => (
          <div key={member.id} className="team-card">
            <button className="btn-delete card-delete" onClick={() => onDeleteMember(member.id)} aria-label="מחיקה">✕</button>
            <div className="team-avatar">{member.name.charAt(0)}</div>
            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>
            {member.birthday && (
              <p className="team-birthday">🎂 {formatHebrewDate(fromISODate(member.birthday))}</p>
            )}
          </div>
        ))}
        {team.length === 0 && <p className="empty-note">אין עדיין אנשי צוות</p>}
      </div>
    </div>
  );
}
