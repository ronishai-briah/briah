import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_TEAM } from './data/defaultTeam';
import CalendarView from './components/CalendarView';
import EventsListView from './components/EventsListView';
import TeamView from './components/TeamView';

const TABS = [
  { id: 'calendar', label: 'לוח שנה' },
  { id: 'list', label: 'רשימת אירועים' },
  { id: 'team', label: 'צוות' },
];

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [customEvents, setCustomEvents] = useLocalStorage('briah-events', []);
  const [team, setTeam] = useLocalStorage('briah-team', DEFAULT_TEAM);

  function addEvent(event) {
    setCustomEvents((prev) => [...prev, event]);
  }

  function deleteEvent(id) {
    setCustomEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  function addMember(member) {
    setTeam((prev) => [...prev, member]);
  }

  function deleteMember(id) {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>בריאה</h1>
        <p className="app-subtitle">קהילת ווילנס בתל אביב — ניהול לוח שנה וצוות</p>
      </header>

      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'calendar' && (
          <CalendarView customEvents={customEvents} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
        )}
        {activeTab === 'list' && (
          <EventsListView customEvents={customEvents} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
        )}
        {activeTab === 'team' && (
          <TeamView team={team} onAddMember={addMember} onDeleteMember={deleteMember} />
        )}
      </main>
    </div>
  );
}

export default App;
