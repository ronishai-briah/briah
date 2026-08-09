// ישויות המודל, לפי docs/briah-app/data-model.md ו-permissions-model.md.
// כל שינוי כאן צריך להישאר תואם למסמכים האלה (או לעדכן אותם יחד).

export type Role = 'owner' | 'melave' | 'matargel' | 'workshop_facilitator'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  roles: Role[]
}

export type MembershipTrack = 'anchor' | 'growth' | 'deepening' | null

export type ChevraStatus = 'active' | 'paused' | 'ended'

export interface Chevra {
  id: string
  name: string
  phone?: string
  email?: string
  track: MembershipTrack
  cycleId: string | null
  melaveId: string | null
  joinedAt: string
  status: ChevraStatus
  arboxCustomerId?: string | null
}

export interface Cycle {
  id: string
  startDate: string
  endDate: string
}

export type SessionType =
  | 'group_workshop'
  | 'individual_session'
  | 'melave_meeting'
  | 'community_circle'
  | 'community_evening'

export type MethodologyLayer = 'grounding' | 'release' | 'integration' | 'community' | 'meaning'

export interface Session {
  id: string
  type: SessionType
  layer?: MethodologyLayer
  facilitatorId: string | null
  date: string
  durationMinutes: number
  arboxEventId?: string | null
  /** למפגש 1:1 בלבד — עם איזו חבר/ה */
  chevraId?: string | null
  /** לסדנה קבוצתית / מעגל — מי משתתף/ת */
  attendeeIds?: string[]
}

export type NoteVisibility = 'team_wide' | 'limited'

export interface Note {
  id: string
  chevraId: string
  authorId: string
  content: string
  visibility: NoteVisibility
  sharedWith: string[]
  criticalFlag: boolean
  sessionId?: string | null
  createdAt: string
}

export interface MatargelSummary {
  id: string
  chevraId: string
  matargelId: string
  sessionId: string | null
  goal: string
  whatCameUp: string
  recommendations: string
  createdAt: string
}

export interface PersonalPlan {
  chevraId: string
  layers: Partial<Record<MethodologyLayer, string>>
  melaveNotes: string
}

export type AgreementType = 'per_session' | 'retainer' | 'revenue_share' | 'other'

export interface PractitionerAgreement {
  id: string
  practitionerId: string
  agreementType: AgreementType
  rate: number | null
  currency: 'ILS'
  paymentTerms: string
  startDate: string
  endDate: string | null
  notes: string
}

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface SubmissionItem {
  id: string
  date: string
  kind: string
  note: string
}

export interface ReceiptFile {
  id: string
  fileName: string
  dataUrl: string
  uploadedAt: string
}

export interface PractitionerSubmission {
  id: string
  practitionerId: string
  month: number // 1-12
  year: number
  items: SubmissionItem[]
  receipts: ReceiptFile[]
  paymentStatus: PaymentStatus
  markedBy: string | null
  markedAt: string | null
  ownerNote: string
  createdAt: string
  submittedAt: string | null
}

export interface DocumentLink {
  type: 'chevra' | 'practitioner' | 'none'
  id: string | null
}

export interface AppDocument {
  id: string
  fileName: string
  dataUrl: string
  description: string
  uploadedBy: string
  uploadedAt: string
  linkedTo: DocumentLink
}

export interface AppData {
  users: User[]
  chevrot: Chevra[]
  cycles: Cycle[]
  sessions: Session[]
  notes: Note[]
  matargelSummaries: MatargelSummary[]
  personalPlans: PersonalPlan[]
  agreements: PractitionerAgreement[]
  submissions: PractitionerSubmission[]
  documents: AppDocument[]
}
