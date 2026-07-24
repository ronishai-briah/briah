export const EVENT_TYPES = {
  cycle: { label: 'מחזור', color: '#3E6B8A', bg: '#DCE6EC' },
  community: { label: 'קהילה', color: '#7C8D59', bg: '#E6EBD9' },
  staff: { label: 'צוות', color: '#8A5578', bg: '#EDE0E8' },
  special: { label: 'אירוע', color: '#BD5A31', bg: '#F3DFD1' },
  holiday: { label: 'חג', color: '#A8391F', bg: '#F1DAD1' },
  marketing: { label: 'שיווק', color: '#3E8A82', bg: '#DBEBE8' },
  financial: { label: 'כלכלה', color: '#B8862E', bg: '#F1E5CB' },
  birthday: { label: 'יום הולדת', color: '#B5527A', bg: '#F3DCE6' },
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
  {
    id: 4,
    label: 'ימי הולדת',
    subtitle: 'כל ימי ההולדת של הצוות והמטופלים, כל שנה',
    types: ['birthday'],
  },
];

export function typeOrderForGantt(ganttId) {
  const gantt = GANTTS.find((g) => g.id === ganttId);
  return gantt ? gantt.types : Object.keys(EVENT_TYPES);
}
