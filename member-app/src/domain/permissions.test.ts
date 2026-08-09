import { describe, expect, it } from 'vitest'
import {
  canCreateSubmission,
  canEditAgreement,
  canMarkPayment,
  canSetCriticalFlag,
  canViewAgreement,
  canViewAllChevrot,
  canViewChevra,
  canViewFinance,
  canViewMatargelSummary,
  canViewNote,
  canWriteNote,
  visibleChevraIds,
} from './permissions'
import type { AppData, Note, User } from './types'

// owner בלי finance = בפועל ניצן (רואה הכל חוץ מתנאי העסקה/תשלומים/סיכומי מתרגל).
const owner: User = { id: 'nitzan', name: 'ניצן', email: 'nitzan@briah.me', roles: ['owner'] }
// owner + finance = בפועל רוני (רואה גם תנאי העסקה/תשלומים, לא רואה סיכומי מתרגל כברירת מחדל).
const financeOwner: User = { id: 'roni', name: 'רוני', email: 'roni@briah.me', roles: ['owner', 'finance'] }
const melave: User = { id: 'maor', name: 'מאור', email: 'maor@briah.me', roles: ['melave'] }
const matargel: User = { id: 'ofri', name: 'עופרי', email: 'ofri@briah.me', roles: ['matargel'] }
const facilitator: User = {
  id: 'yaara',
  name: 'יערה',
  email: 'yaara@briah.me',
  roles: ['workshop_facilitator'],
}

const data: AppData = {
  users: [owner, financeOwner, melave, matargel, facilitator],
  chevrot: [
    {
      id: 'c1',
      name: 'חבר/ה 1',
      track: 'growth',
      cycleId: null,
      melaveId: 'maor',
      joinedAt: '2026-01-01',
      status: 'active',
    },
    {
      id: 'c2',
      name: 'חבר/ה 2',
      track: 'anchor',
      cycleId: null,
      melaveId: null,
      joinedAt: '2026-01-01',
      status: 'active',
    },
  ],
  cycles: [],
  sessions: [
    {
      id: 's1',
      type: 'individual_session',
      facilitatorId: 'ofri',
      date: '2026-08-01',
      durationMinutes: 60,
      chevraId: 'c2',
    },
    {
      id: 's2',
      type: 'group_workshop',
      facilitatorId: 'yaara',
      date: '2026-08-02',
      durationMinutes: 90,
      attendeeIds: ['c1', 'c2'],
    },
  ],
  notes: [],
  matargelSummaries: [],
  personalPlans: [],
  agreements: [],
  submissions: [],
  documents: [],
}

describe('finance & scope', () => {
  it('only the finance-holding owner (Roni) sees finance; plain owner (Nitzan) does not', () => {
    expect(canViewFinance(financeOwner)).toBe(true)
    expect(canViewFinance(owner)).toBe(false)
    expect(canViewFinance(melave)).toBe(false)
  })

  it('both owner and finance-owner see all chevrot (clinical visibility is not finance-gated)', () => {
    expect(canViewAllChevrot(owner)).toBe(true)
    expect(canViewAllChevrot(financeOwner)).toBe(true)
    expect(canViewAllChevrot(matargel)).toBe(false)
  })

  it('melave sees only her assigned chevra', () => {
    const ids = visibleChevraIds(melave, data)
    expect(ids.has('c1')).toBe(true)
    expect(ids.has('c2')).toBe(false)
  })

  it('matargel sees only chevrot with an individual session with them', () => {
    const ids = visibleChevraIds(matargel, data)
    expect(ids.has('c2')).toBe(true)
    expect(ids.has('c1')).toBe(false)
  })

  it('workshop facilitator sees only attendees of workshops they run', () => {
    const ids = visibleChevraIds(facilitator, data)
    expect(ids.has('c1')).toBe(true)
    expect(ids.has('c2')).toBe(true)
    expect(canViewChevra(facilitator, 'c1', data)).toBe(true)
  })

  it('owner sees every chevra regardless of assignment', () => {
    const ids = visibleChevraIds(owner, data)
    expect(ids.has('c1')).toBe(true)
    expect(ids.has('c2')).toBe(true)
  })
})

describe('note visibility toggle', () => {
  const teamWide: Note = {
    id: 'n1',
    chevraId: 'c1',
    authorId: 'maor',
    content: 'team wide',
    visibility: 'team_wide',
    sharedWith: [],
    criticalFlag: false,
    createdAt: '2026-08-01',
  }
  const limited: Note = {
    id: 'n2',
    chevraId: 'c1',
    authorId: 'maor',
    content: 'limited',
    visibility: 'limited',
    sharedWith: ['ofri'],
    criticalFlag: false,
    createdAt: '2026-08-01',
  }
  const critical: Note = {
    id: 'n3',
    chevraId: 'c1',
    authorId: 'ofri',
    content: 'critical',
    visibility: 'limited',
    sharedWith: [],
    criticalFlag: true,
    createdAt: '2026-08-01',
  }

  it('team_wide is visible to melave/matargel but not workshop facilitator', () => {
    expect(canViewNote(melave, teamWide)).toBe(true)
    expect(canViewNote(matargel, teamWide)).toBe(true)
    expect(canViewNote(facilitator, teamWide)).toBe(false)
    expect(canViewNote(owner, teamWide)).toBe(true)
  })

  it('limited is visible only to sharedWith + author + owner', () => {
    expect(canViewNote(matargel, limited)).toBe(true) // shared with ofri
    expect(canViewNote(facilitator, limited)).toBe(false)
    expect(canViewNote(melave, limited)).toBe(true) // author
    expect(canViewNote(owner, limited)).toBe(true)
  })

  it('critical flag overrides visibility for everyone with team access', () => {
    expect(canViewNote(melave, critical)).toBe(true)
    expect(canViewNote(facilitator, critical)).toBe(true)
    expect(canViewNote(owner, critical)).toBe(true)
  })

  it('only matargel can set the critical flag', () => {
    expect(canSetCriticalFlag(matargel)).toBe(true)
    expect(canSetCriticalFlag(melave)).toBe(false)
    expect(canSetCriticalFlag(owner)).toBe(false)
  })

  it('owner, melave and matargel can write notes; workshop facilitator cannot (per open question in permissions-model.md)', () => {
    expect(canWriteNote(owner)).toBe(true)
    expect(canWriteNote(melave)).toBe(true)
    expect(canWriteNote(matargel)).toBe(true)
    expect(canWriteNote(facilitator)).toBe(false)
  })
})

describe('matargel summaries — visible to Nitzan (owner without finance) + author, not Roni', () => {
  it('gates by clinical-owner-or-self, excluding the finance owner', () => {
    expect(canViewMatargelSummary(owner, 'ofri')).toBe(true) // ניצן
    expect(canViewMatargelSummary(financeOwner, 'ofri')).toBe(false) // רוני — לא כברירת מחדל
    expect(canViewMatargelSummary(matargel, 'ofri')).toBe(true) // הכותב עצמו
    expect(canViewMatargelSummary(melave, 'ofri')).toBe(false)
    expect(canViewMatargelSummary(facilitator, 'ofri')).toBe(false)
  })
})

describe('practitioner agreements — owner edits, practitioner reads own only', () => {
  const agreement = {
    id: 'a1',
    practitionerId: 'ofri',
    agreementType: 'per_session' as const,
    rate: 300,
    currency: 'ILS' as const,
    paymentTerms: 'שוטף+30',
    startDate: '2026-01-01',
    endDate: null,
    notes: '',
  }

  it('only the finance owner (Roni) can edit — not plain owner (Nitzan), not anyone else', () => {
    expect(canEditAgreement(financeOwner)).toBe(true)
    expect(canEditAgreement(owner)).toBe(false)
    expect(canEditAgreement(matargel)).toBe(false)
  })

  it('only the finance owner and the practitioner themself can view it — Nitzan cannot', () => {
    expect(canViewAgreement(financeOwner, agreement)).toBe(true)
    expect(canViewAgreement(owner, agreement)).toBe(false)
    expect(canViewAgreement(matargel, agreement)).toBe(true) // ofri === matargel.id
    expect(canViewAgreement(melave, agreement)).toBe(false)
    expect(canViewAgreement(facilitator, agreement)).toBe(false)
  })
})

describe('practitioner monthly submissions & payment marking', () => {
  it('matargel and workshop facilitator can create submissions; melave (without another role) cannot', () => {
    expect(canCreateSubmission(matargel)).toBe(true)
    expect(canCreateSubmission(facilitator)).toBe(true)
    expect(canCreateSubmission(melave)).toBe(false)
  })

  it('only the finance owner (Roni) marks payment status — not plain owner (Nitzan)', () => {
    expect(canMarkPayment(financeOwner)).toBe(true)
    expect(canMarkPayment(owner)).toBe(false)
    expect(canMarkPayment(matargel)).toBe(false)
  })
})
