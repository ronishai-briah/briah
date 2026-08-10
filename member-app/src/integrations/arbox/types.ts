// טיפוסים בצד שלנו למה שאנחנו צריכים מארבוקס, לא שכפול של סכמת ה-API שלהם.
// המיפוי המדויק (אילו שדות באמת חוזרים מ-Membership Types / Users / Schedule / Reports)
// עדיין לא אומת מול המסמכים המלאים ב-https://arboxserver.arboxapp.com/docs/api —
// ראו docs/briah-app/arbox-integration.md. יש לעדכן את הטיפוסים האלה ברגע שיש גישת רשת אמיתית לתיעוד.

export interface ArboxMembershipStatus {
  arboxCustomerId: string
  membershipTypeName: string | null // "עוגן" / "צמיחה" / "העמקה" — טרם אומת שזה בדיוק השם שחוזר מה-API
  isActive: boolean
  sessionsUsedThisMonth: number | null
  sessionsIncludedThisMonth: number | null
}

export interface ArboxScheduleEvent {
  arboxEventId: string
  title: string
  startsAt: string // ISO
  durationMinutes: number
  locationId: string
}

export interface ArboxLeadInput {
  firstName: string
  lastName?: string
  email?: string
  phone: string
  additionalPhone?: string
  gender?: 'male' | 'female' | 'other'
  locationId: string
  sourceId?: number
  statusId?: number
  campaign?: string
  assigneeId?: number
  comment?: string
  birthday?: string
}
