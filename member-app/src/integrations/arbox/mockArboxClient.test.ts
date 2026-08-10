import { describe, expect, it } from 'vitest'
import { mockArboxClient } from './mockArboxClient'

describe('mockArboxClient', () => {
  it('returns a membership status shape', async () => {
    const status = await mockArboxClient.getMembershipStatus('cust-1')
    expect(status?.arboxCustomerId).toBe('cust-1')
    expect(typeof status?.isActive).toBe('boolean')
  })

  it('returns a weekly schedule', async () => {
    const events = await mockArboxClient.getWeeklySchedule('loc-1')
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].locationId).toBe('loc-1')
  })

  it('creates a mock lead', async () => {
    const result = await mockArboxClient.createLead({ firstName: 'בדיקה', phone: '050-0000000', locationId: 'loc-1' })
    expect(result.id).toMatch(/^mock-lead-/)
  })
})
