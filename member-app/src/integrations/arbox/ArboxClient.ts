import type { ArboxLeadInput, ArboxMembershipStatus, ArboxScheduleEvent } from './types'

/**
 * חוזה אחיד לכל מה שהאפליקציה צריכה מארבוקס (P0 #1: הרשמה, מערכת שעות, סטטוס מנוי, מונה סשנים).
 *
 * חשוב: אין שום מימוש כאן שקורא ל-Arbox ישירות מהדפדפן. מפתח ה-API של ארבוקס נותן הרשאת כתיבה
 * (יצירת לידים וכו') — אם הוא ייכנס לקוד/build של ה-frontend, כל מי שפותח את ה-DevTools יכול
 * לחלץ אותו ולהשתמש בו. לכן:
 *   - MockArboxClient  — נתוני דמו, לשימוש היום (אין עדיין backend מחובר).
 *   - HttpArboxClient  — מימוש אמיתי שמדבר מול ה-endpoint הפרטי שלנו
 *     (supabase/functions/arbox-proxy), לא מול arboxserver.arboxapp.com ישירות.
 *     המפתח עצמו חי רק כ-secret בצד השרת של אותה Edge Function.
 */
export interface ArboxClient {
  getMembershipStatus(arboxCustomerId: string): Promise<ArboxMembershipStatus | null>
  getWeeklySchedule(locationId: string): Promise<ArboxScheduleEvent[]>
  createLead(input: ArboxLeadInput): Promise<{ id: string }>
}
