import type { ArboxClient } from './ArboxClient'
import type { ArboxLeadInput, ArboxMembershipStatus, ArboxScheduleEvent } from './types'

/** מימוש דמו — עד שיש חיבור אמיתי (Edge Function + מפתח) פעיל בסביבה עם גישת רשת לארבוקס. */
export const mockArboxClient: ArboxClient = {
  async getMembershipStatus(arboxCustomerId: string): Promise<ArboxMembershipStatus | null> {
    return {
      arboxCustomerId,
      membershipTypeName: 'צמיחה',
      isActive: true,
      sessionsUsedThisMonth: 3,
      sessionsIncludedThisMonth: 8,
    }
  },

  async getWeeklySchedule(locationId: string): Promise<ArboxScheduleEvent[]> {
    const now = new Date()
    return [
      {
        arboxEventId: 'mock-1',
        title: 'יוגה סומטית',
        startsAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 60,
        locationId,
      },
      {
        arboxEventId: 'mock-2',
        title: 'ריברסינג',
        startsAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 90,
        locationId,
      },
    ]
  },

  async createLead(input: ArboxLeadInput): Promise<{ id: string }> {
    console.info('[mockArboxClient] היה נוצר ליד אמיתי בארבוקס עם:', input)
    return { id: `mock-lead-${Date.now()}` }
  },
}
