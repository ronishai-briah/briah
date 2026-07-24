import { toISODate, fromISODate } from '../utils/dates';

// Everyone's birthday (month/day), recurring every year. birthYear is kept
// only for reference in the notes — the event itself repeats annually.
export const BIRTHDAYS = [
  { key: 'itzik', name: 'איציק', month: 2, day: 15, birthYear: 1991, role: 'מטופל', notes: 'אמן אהוב: פינק פלויד • עובדה מעניינת: בעלים (של קבוצת אוהדים) של קבוצת כדורגל' },
  { key: 'victor', name: 'ויקטור', month: 9, day: 28, birthYear: 1997, role: 'מטופל', notes: 'מזל מאזניים • אמן אהוב: היהודים • עובדה מעניינת: קיבל את השם שלו רק חודש אחרי שנולד' },
  { key: 'shir-yam', name: 'שיר ים', month: 6, day: 20, birthYear: 1999, role: 'מטופל', notes: 'אמן אהוב: אואזיס • עובדה מעניינת: מרוקאי שלם' },
  { key: 'lidor', name: 'לידור רובינשטיין', month: 3, day: 24, birthYear: 2002, role: 'מטופל', notes: 'מזל טלה • אמן אהוב: Labrinth / m83 • עובדה מעניינת: ירד 30 קילו' },
  { key: 'dana-ronen', name: 'דנה רונן', month: 6, day: 16, birthYear: 1995, role: 'מטופל', notes: 'מזל תאומים • אמן אהוב: Taylor Swift • עובדה מעניינת: טסה לבהאמה לשחות עם חזירים ורודים' },
  { key: 'meir', name: 'מאיר שריקי', month: 10, day: 26, birthYear: 1997, role: 'מטפל', notes: 'מזל עקרב • אמן אהוב: אביתר בנאי • עובדה מעניינת: עבר בילדות 11-12 פעמים' },
  { key: 'ofri', name: 'עופרי שירן', month: 9, day: 2, birthYear: 1994, role: 'מטפל', notes: 'אמן אהוב: אריק איינשטיין / חווה אלברשטיין • עובדה מעניינת: 15 שנה שחקן כדורסל' },
  { key: 'yaara', name: 'יערה ראוף', month: 2, day: 17, birthYear: 1994, role: 'מטפל', notes: 'אמן אהוב: אביתר בנאי • עובדה מעניינת: ייצגה את ישראל בכדורגל נשים, מקום 2 בעולם' },
  { key: 'dudan', name: 'דודן', month: 11, day: 22, birthYear: 2000, role: 'מטפל', notes: 'אמן אהוב: נתנאל גולדברג / מלטה מרטן • עובדה מעניינת: עבר בין כל אמנויות הלחימה, היום מגנן' },
  { key: 'shachar', name: 'שחר זיו אור', month: 4, day: 1, birthYear: 1996, role: 'מטפל', notes: 'מזל טלה • אמן אהוב: אביתר בנאי • עובדה מעניינת: רוקדת סלסה ובצ׳אטה' },
  { key: 'dana-tamir', name: 'דנה תמיר', month: 1, day: 13, birthYear: 1999, role: 'מטפל', notes: 'מזל גדי • אמן/ית אהוב/ה: Mac Miller • עובדה מעניינת: הייתה מתעמלת אומנותית 8 שנים' },
  { key: 'inbar', name: 'ענבר', month: 5, day: 20, birthYear: 1990, role: 'מטפל', notes: 'מזל שור • אמן אהוב: גלי עטרי • עובדה מעניינת: מורה ליוגה אשטנגה' },
  { key: 'nitzan-p', name: 'ניצן פהימה', month: 8, day: 5, birthYear: null, role: 'צוות', notes: '' },
  { key: 'einav-r', name: 'עינב רביב', month: 8, day: 5, birthYear: null, role: 'צוות', notes: '' },
  { key: 'roni-shai', name: 'רוני שי', month: 12, day: 14, birthYear: null, role: 'צוות', notes: '' },
];

export function generateBirthdayEvents(rangeStartIso, rangeEndIso) {
  const startYear = fromISODate(rangeStartIso).getFullYear();
  const endYear = fromISODate(rangeEndIso).getFullYear();
  const events = [];

  for (let year = startYear; year <= endYear; year++) {
    for (const p of BIRTHDAYS) {
      const date = new Date(year, p.month - 1, p.day);
      const iso = toISODate(date);
      if (iso < rangeStartIso || iso > rangeEndIso) continue;
      events.push({
        id: `birthday-${p.key}-${year}`,
        name: `יום הולדת — ${p.name}`,
        date: iso,
        type: 'birthday',
        ganttIds: [4],
        owner: p.role,
        notes: [p.birthYear ? `נולד/ה ב-${String(p.day).padStart(2, '0')}.${String(p.month).padStart(2, '0')}.${p.birthYear}` : '', p.notes]
          .filter(Boolean)
          .join(' • '),
        isDefault: true,
      });
    }
  }

  return events;
}
