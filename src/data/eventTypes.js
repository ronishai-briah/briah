export const EVENT_TYPES = {
  cycle: { label: 'מחזור', color: '#2563eb', bg: '#dbeafe' },
  community: { label: 'קהילה', color: '#16a34a', bg: '#dcfce7' },
  staff: { label: 'צוות', color: '#7c3aed', bg: '#ede9fe' },
  special: { label: 'אירוע', color: '#ea580c', bg: '#ffedd5' },
  holiday: { label: 'חג', color: '#dc2626', bg: '#fee2e2' },
  marketing: { label: 'שיווק', color: '#0d9488', bg: '#ccfbf1' },
  financial: { label: 'כלכלה', color: '#ca8a04', bg: '#fef9c3' },
};

// GANTTS defines the three boards and which event types appear (as rows) on each.
// 'cycle' events are included on every board as a shared reference row, since
// campaigns/targets/budgets are all planned "per cycle".
export const GANTTS = [
  {
    id: 1,
    label: 'צוות וניהול',
    subtitle: 'מחזורים, צוות, קהילה וחגים',
    types: ['cycle', 'staff', 'community', 'holiday', 'special'],
  },
  {
    id: 2,
    label: 'שיווק ותוכן',
    subtitle: 'קמפיינים, הרצאות ותוכן לפי מחזור',
    types: ['cycle', 'marketing', 'special'],
  },
  {
    id: 3,
    label: 'כלכלי',
    subtitle: 'יעדים, הוצאות והכנסות לפי מחזור',
    types: ['cycle', 'financial', 'special'],
  },
];

export function typeOrderForGantt(ganttId) {
  const gantt = GANTTS.find((g) => g.id === ganttId);
  return gantt ? gantt.types : Object.keys(EVENT_TYPES);
}
