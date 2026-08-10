import type { ArboxClient } from './ArboxClient'
import type { ArboxLeadInput, ArboxMembershipStatus, ArboxScheduleEvent } from './types'

/**
 * מימוש אמיתי — פונה ל-Supabase Edge Function הפרטית שלנו (supabase/functions/arbox-proxy),
 * לא לארבוקס ישירות. ה-Edge Function מחזיקה את ARBOX_API_KEY כ-secret בצד שרת ומבצעת את הקריאה בפועל.
 *
 * טרם נבדק מול נתונים אמיתיים — הסביבה שבה זה נכתב חסומה מגישת רשת ל-arboxserver.arboxapp.com,
 * כך שגם ה-Edge Function עצמה לא הופעלה בפועל עדיין. יש לבדוק ולתקן לפי הצורך ברגע שיש סביבה עם
 * גישת רשת אמיתית + פרויקט Supabase מחובר.
 */
export function createHttpArboxClient(functionsBaseUrl: string, supabaseAnonKey: string): ArboxClient {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${functionsBaseUrl}/arbox-proxy${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        ...init?.headers,
      },
    })
    if (!res.ok) {
      throw new Error(`Arbox proxy error ${res.status}: ${await res.text()}`)
    }
    return (await res.json()) as T
  }

  return {
    getMembershipStatus(arboxCustomerId) {
      return call<ArboxMembershipStatus | null>(`/membership-status/${arboxCustomerId}`)
    },
    getWeeklySchedule(locationId) {
      return call<ArboxScheduleEvent[]>(`/schedule?locationId=${encodeURIComponent(locationId)}`)
    },
    createLead(input: ArboxLeadInput) {
      return call<{ id: string }>('/leads', { method: 'POST', body: JSON.stringify(input) })
    },
  }
}
