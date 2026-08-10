// נתוני דמו לפיתוח/הדגמה בלבד — לא נתונים אמיתיים של חברות.
// שמות הצוות מבוססים על docs/briah-app/business-context.md, אך התוכן (הערות, סיכומים) בדוי לגמרי.
import type { AppData } from '../domain/types'

const today = new Date()
const daysAgo = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function buildSeedData(): AppData {
  return {
    users: [
      // מייסדות — שלושתן owner, רק רוני מחזיקה גם 'finance' (תנאי העסקה/תשלומים/מסמכים).
      { id: 'roni', name: 'רוני שי', email: 'roni@briah.me', roles: ['owner', 'finance'] },
      { id: 'nitzan', name: 'ניצן פהימה', email: 'nitzan@briah.me', roles: ['owner', 'melave', 'workshop_facilitator'] },
      { id: 'einav', name: 'עינב רביב', email: 'einav@briah.me', roles: ['owner', 'workshop_facilitator'] },
      // מלווים
      { id: 'meir', name: 'מאיר שריקי', email: 'meir@briah.me', roles: ['melave'] },
      { id: 'shachar', name: 'שחר זיו אור', email: 'shachar@briah.me', roles: ['melave'] },
      // קולקטיב מטפלים 1:1
      { id: 'ofri', name: 'עופרי שירן', email: 'ofri@briah.me', roles: ['matargel'] },
      { id: 'tomer', name: 'תומר זבולון', email: 'tomer@briah.me', roles: ['matargel'] },
      { id: 'inbar', name: 'ענבר עזרי חפר', email: 'inbar@briah.me', roles: ['matargel'] },
      { id: 'dana', name: 'דנה טמיר', email: 'dana@briah.me', roles: ['matargel'] },
      // קולקטיב מנחי סדנאות קבוצתיות
      { id: 'yaara', name: 'יערה ראוף', email: 'yaara@briah.me', roles: ['workshop_facilitator'] },
      { id: 'dandan', name: 'דן דן', email: 'dandan@briah.me', roles: ['workshop_facilitator'] },
    ],
    chevrot: [
      {
        id: 'c1',
        name: 'דנה כהן',
        phone: '050-0000001',
        track: 'growth',
        cycleId: 'cycle2',
        melaveId: 'meir',
        joinedAt: daysAgo(60),
        status: 'active',
      },
      {
        id: 'c2',
        name: 'איתי לוי',
        phone: '050-0000002',
        track: 'anchor',
        cycleId: 'cycle2',
        melaveId: 'meir',
        joinedAt: daysAgo(10),
        status: 'active',
      },
      {
        id: 'c3',
        name: 'נועה ברק',
        phone: '050-0000003',
        track: 'deepening',
        cycleId: 'cycle1',
        melaveId: 'shachar',
        joinedAt: daysAgo(120),
        status: 'active',
      },
    ],
    cycles: [
      { id: 'cycle1', startDate: '2026-06-01', endDate: '2026-09-01' },
      { id: 'cycle2', startDate: '2026-09-01', endDate: '2026-12-01' },
    ],
    sessions: [
      {
        id: 's1',
        type: 'individual_session',
        layer: 'integration',
        facilitatorId: 'ofri',
        date: daysAgo(5),
        durationMinutes: 60,
        chevraId: 'c1',
      },
      {
        id: 's2',
        type: 'individual_session',
        layer: 'integration',
        facilitatorId: 'tomer',
        date: daysAgo(2),
        durationMinutes: 60,
        chevraId: 'c3',
      },
      {
        id: 's3',
        type: 'group_workshop',
        layer: 'release',
        facilitatorId: 'yaara',
        date: daysAgo(1),
        durationMinutes: 90,
        attendeeIds: ['c1', 'c2', 'c3'],
      },
    ],
    notes: [
      {
        id: 'n1',
        chevraId: 'c1',
        authorId: 'meir',
        content: 'פגישת מלווה ראשונה — בנינו יחד תוכנית סביב רובד הקרקוע והאינטגרציה.',
        visibility: 'team_wide',
        sharedWith: [],
        criticalFlag: false,
        createdAt: daysAgo(55),
      },
      {
        id: 'n2',
        chevraId: 'c1',
        authorId: 'meir',
        content: 'שיחה אישית שעלתה בפגישה — נשארת בינינו כרגע.',
        visibility: 'limited',
        sharedWith: ['nitzan'],
        criticalFlag: false,
        createdAt: daysAgo(20),
      },
      {
        id: 'n3',
        chevraId: 'c2',
        authorId: 'ofri',
        content: 'שווה שכל הצוות שישים לב — עברה תקופה רגישה, כדאי לגשת בעדינות.',
        visibility: 'limited',
        sharedWith: [],
        criticalFlag: true,
        createdAt: daysAgo(1),
      },
    ],
    matargelSummaries: [
      {
        id: 'ms1',
        chevraId: 'c1',
        matargelId: 'ofri',
        sessionId: 's1',
        goal: 'עיבוד חוויה מהסדנה האחרונה',
        whatCameUp: 'התנגדות ראשונית שהתפוגגה במהלך הפגישה',
        recommendations: 'להמשיך במפגשים דו-שבועיים',
        createdAt: daysAgo(5),
      },
    ],
    personalPlans: [
      {
        chevraId: 'c1',
        layers: { grounding: 'יוגה סומטית שבועית', integration: 'מפגשי 1:1 עם עופרי' },
        melaveNotes: 'להתמקד בהתחלה ברובד הקרקוע לפני מעבר לפריקה.',
      },
    ],
    agreements: [
      {
        id: 'ag1',
        practitionerId: 'ofri',
        agreementType: 'per_session',
        rate: 300,
        currency: 'ILS',
        paymentTerms: 'שוטף + 30, העברה בנקאית',
        startDate: '2026-01-01',
        endDate: null,
        notes: '',
      },
      {
        id: 'ag2',
        practitionerId: 'tomer',
        agreementType: 'per_session',
        rate: 280,
        currency: 'ILS',
        paymentTerms: 'שוטף + 30',
        startDate: '2026-03-01',
        endDate: null,
        notes: '',
      },
    ],
    submissions: [
      {
        id: 'sub1',
        practitionerId: 'ofri',
        month: today.getMonth() === 0 ? 12 : today.getMonth(),
        year: today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear(),
        items: [
          { id: 'i1', date: daysAgo(20), kind: 'מפגש 1:1', note: 'דנה כהן' },
          { id: 'i2', date: daysAgo(12), kind: 'מפגש 1:1', note: 'נועה ברק' },
        ],
        receipts: [],
        paymentStatus: 'paid',
        markedBy: 'roni',
        markedAt: daysAgo(3),
        ownerNote: 'שולם בהעברה ב-1.8',
        createdAt: daysAgo(25),
        submittedAt: daysAgo(25),
      },
      {
        id: 'sub2',
        practitionerId: 'tomer',
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        items: [{ id: 'i3', date: daysAgo(2), kind: 'מפגש 1:1', note: 'נועה ברק' }],
        receipts: [],
        paymentStatus: 'unpaid',
        markedBy: null,
        markedAt: null,
        ownerNote: '',
        createdAt: daysAgo(1),
        submittedAt: daysAgo(1),
      },
    ],
    documents: [],
  }
}
