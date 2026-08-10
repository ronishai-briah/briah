import type { ArboxClient } from './ArboxClient'
import { createHttpArboxClient } from './httpArboxClient'
import { mockArboxClient } from './mockArboxClient'

export type { ArboxClient } from './ArboxClient'
export type { ArboxLeadInput, ArboxMembershipStatus, ArboxScheduleEvent } from './types'

/**
 * בורר מימוש: אם יש כתובת Functions + מפתח anon של Supabase מוגדרים (env), משתמשים בחיבור
 * האמיתי; אחרת נופלים חזרה לדמו. כך המסכים עצמם לא צריכים לדעת אם המידע אמיתי או מדומה.
 */
export function getArboxClient(): ArboxClient {
  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (functionsUrl && anonKey) {
    return createHttpArboxClient(functionsUrl, anonKey)
  }
  return mockArboxClient
}
