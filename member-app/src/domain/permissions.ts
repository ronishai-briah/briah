// מנוע ההרשאות — המקור האמת היחיד ל"מי רואה/כותב מה".
// כל פונקציה כאן ממופה לשורה/עמודה במטריצה ב-docs/briah-app/permissions-model.md.
// כשעוברים ל-Supabase, מדיניות ה-RLS צריכה לשקף בדיוק את הלוגיקה הזו — לא להמציא כללים חדשים כאן.

import type { AppData, Chevra, Note, PractitionerAgreement, PractitionerSubmission, Role, User } from './types'

export function hasRole(user: User, role: Role): boolean {
  return user.roles.includes(role)
}

export function isOwner(user: User): boolean {
  return hasRole(user, 'owner')
}

/** "רואה כספים" — רק Owner (רוני/ניצן). */
export function canViewFinance(user: User): boolean {
  return isOwner(user)
}

/** "רואה את כל החברות" — רק Owner. כולם האחרים רואים תת-קבוצה (visibleChevraIds). */
export function canViewAllChevrot(user: User): boolean {
  return isOwner(user)
}

/**
 * "רואה רק חברות משובצות אליו" — לפי תפקיד:
 * מלווה: חברות שהיא ה-melave הראשית שלהן.
 * מתרגל/ת 1:1: חברות שיש להן איתו/ה מפגש 1:1.
 * מנחה סדנה: חברות שמשתתפות בסדנה/מעגל שהוא מנחה.
 * Owner: הכל.
 */
export function visibleChevraIds(user: User, data: AppData): Set<string> {
  if (isOwner(user)) {
    return new Set(data.chevrot.map((c) => c.id))
  }
  const ids = new Set<string>()
  if (hasRole(user, 'melave')) {
    for (const c of data.chevrot) {
      if (c.melaveId === user.id) ids.add(c.id)
    }
  }
  if (hasRole(user, 'matargel')) {
    for (const s of data.sessions) {
      if (s.type === 'individual_session' && s.facilitatorId === user.id && s.chevraId) {
        ids.add(s.chevraId)
      }
    }
  }
  if (hasRole(user, 'workshop_facilitator')) {
    for (const s of data.sessions) {
      if (s.facilitatorId === user.id && s.attendeeIds) {
        for (const chevraId of s.attendeeIds) ids.add(chevraId)
      }
    }
  }
  return ids
}

export function canViewChevra(user: User, chevraId: string, data: AppData): boolean {
  return visibleChevraIds(user, data).has(chevraId)
}

/** "כותב הערה" — Owner, מלווה, מתרגל/ת. מנחה סדנה: לא ברור בבריינסטורם (ראו permissions-model.md), כרגע לא מאפשרים. */
export function canWriteNote(user: User): boolean {
  return isOwner(user) || hasRole(user, 'melave') || hasRole(user, 'matargel')
}

/** "קובע toggle נראות" — כל מי שכותב הערה קובע את הנראות שלה. */
export function canSetNoteVisibility(user: User): boolean {
  return canWriteNote(user)
}

/** "קריטי להעביר הלאה" — רק מתרגל/ת 1:1 יכול/ה להגדיר. */
export function canSetCriticalFlag(user: User): boolean {
  return hasRole(user, 'matargel')
}

/**
 * מי רואה הערה נתונה:
 * - הכותב/ת תמיד רואה את שלו/ה.
 * - Owner רואה הכל.
 * - הערה "קריטי" נראית לכולם (מלווה/מתרגל/מנחה) — זו כל המטרה של הדגל.
 * - "כלל-צוותי" נראית למלוות ומתרגלים, לא למנחי סדנה (הם רואים רק קריטי/משותף-מפורש).
 * - "מוגבל" נראית רק למי שברשימת ה-sharedWith.
 * (הבדיקה הזו לא מחליפה בדיקת canViewChevra — יש להריץ את שתיהן.)
 */
export function canViewNote(user: User, note: Note): boolean {
  if (isOwner(user)) return true
  if (note.authorId === user.id) return true
  if (note.criticalFlag) return true
  if (note.visibility === 'team_wide') {
    return hasRole(user, 'melave') || hasRole(user, 'matargel')
  }
  return note.sharedWith.includes(user.id)
}

/** סיכום מפגש מתרגל — נראה כברירת מחדל רק לניצן (Owner) ולכותב/ת עצמו/ה. */
export function canViewMatargelSummary(user: User, summaryMatargelId: string): boolean {
  return isOwner(user) || summaryMatargelId === user.id
}

export function canWriteMatargelSummary(user: User): boolean {
  return hasRole(user, 'matargel')
}

/** תנאי העסקה: רק Owner עורך/ת; המתרגל/ת רואה רק את שלו/ה, קריאה בלבד; אף אחד אחר לא. */
export function canEditAgreement(user: User): boolean {
  return isOwner(user)
}

export function canViewAgreement(user: User, agreement: PractitionerAgreement): boolean {
  return isOwner(user) || agreement.practitionerId === user.id
}

/** דיווח חודשי: מתרגל/מנחה יוצר/ת ורואה רק את שלו/ה; Owner רואה הכל ומסמן/ת תשלום. */
export function canCreateSubmission(user: User): boolean {
  return hasRole(user, 'matargel') || hasRole(user, 'workshop_facilitator')
}

export function canViewSubmission(user: User, submission: PractitionerSubmission): boolean {
  return isOwner(user) || submission.practitionerId === user.id
}

export function canEditSubmission(user: User, submission: PractitionerSubmission): boolean {
  return submission.practitionerId === user.id
}

export function canMarkPayment(user: User): boolean {
  return isOwner(user)
}

/** מסמכים כלליים — Owner בלבד כברירת מחדל; מתרגל/ת רואה מסמכים המשויכים אליו/ה בלבד. */
export function canUploadDocument(user: User): boolean {
  return isOwner(user)
}

export function needsAttention(chevra: Chevra, notes: Note[], now: Date = new Date()): boolean {
  const chevraNotes = notes.filter((n) => n.chevraId === chevra.id)
  if (chevraNotes.length === 0) return chevra.status === 'active'
  const lastNoteDate = chevraNotes.reduce(
    (latest, n) => (n.createdAt > latest ? n.createdAt : latest),
    chevraNotes[0].createdAt,
  )
  const daysSince = (now.getTime() - new Date(lastNoteDate).getTime()) / (1000 * 60 * 60 * 24)
  return chevra.status === 'active' && daysSince > 21
}
