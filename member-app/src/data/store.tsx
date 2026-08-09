import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  AppData,
  Note,
  NoteVisibility,
  PaymentStatus,
  PractitionerAgreement,
  PractitionerSubmission,
  ReceiptFile,
  SubmissionItem,
} from '../domain/types'
import { buildSeedData } from './seed'

const STORAGE_KEY = 'briah-member-app-data-v1'
const AUTH_KEY = 'briah-member-app-current-user-v1'

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // localStorage מושחת/לא זמין — ניפול חזרה לזרעים
  }
  return buildSeedData()
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

interface DataContextValue {
  data: AppData
  addNote: (input: {
    chevraId: string
    authorId: string
    content: string
    visibility: NoteVisibility
    sharedWith: string[]
    criticalFlag: boolean
    sessionId?: string | null
  }) => void
  upsertAgreement: (agreement: PractitionerAgreement) => void
  createSubmission: (input: {
    practitionerId: string
    month: number
    year: number
    items: SubmissionItem[]
    receipts: ReceiptFile[]
  }) => void
  markPayment: (submissionId: string, status: PaymentStatus, ownerId: string, ownerNote: string) => void
  resetToSeed: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const addNote = useCallback<DataContextValue['addNote']>((input) => {
    const note: Note = { id: uid('note'), createdAt: new Date().toISOString(), ...input }
    setData((prev) => ({ ...prev, notes: [note, ...prev.notes] }))
  }, [])

  const upsertAgreement = useCallback((agreement: PractitionerAgreement) => {
    setData((prev) => {
      const exists = prev.agreements.some((a) => a.id === agreement.id)
      return {
        ...prev,
        agreements: exists
          ? prev.agreements.map((a) => (a.id === agreement.id ? agreement : a))
          : [...prev.agreements, agreement],
      }
    })
  }, [])

  const createSubmission = useCallback<DataContextValue['createSubmission']>((input) => {
    const submission: PractitionerSubmission = {
      id: uid('sub'),
      paymentStatus: 'unpaid',
      markedBy: null,
      markedAt: null,
      ownerNote: '',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      ...input,
    }
    setData((prev) => ({ ...prev, submissions: [submission, ...prev.submissions] }))
  }, [])

  const markPayment = useCallback(
    (submissionId: string, status: PaymentStatus, ownerId: string, ownerNote: string) => {
      setData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) =>
          s.id === submissionId
            ? { ...s, paymentStatus: status, markedBy: ownerId, markedAt: new Date().toISOString(), ownerNote }
            : s,
        ),
      }))
    },
    [],
  )

  const resetToSeed = useCallback(() => setData(buildSeedData()), [])

  return (
    <DataContext.Provider value={{ data, addNote, upsertAgreement, createSubmission, markPayment, resetToSeed }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

interface AuthContextValue {
  currentUserId: string | null
  setCurrentUserId: (id: string | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(() => localStorage.getItem(AUTH_KEY))

  const setCurrentUserId = useCallback((id: string | null) => {
    setCurrentUserIdState(id)
    if (id) localStorage.setItem(AUTH_KEY, id)
    else localStorage.removeItem(AUTH_KEY)
  }, [])

  return <AuthContext.Provider value={{ currentUserId, setCurrentUserId }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
