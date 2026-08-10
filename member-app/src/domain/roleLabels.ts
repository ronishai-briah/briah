import type { Role } from './types'

export const roleLabels: Record<Role, string> = {
  owner: 'Owner (גישת-על טיפולית)',
  finance: 'פיננסים (רוני בלבד)',
  melave: 'מלווה',
  matargel: 'מתרגל/ת 1:1',
  workshop_facilitator: 'מנחה סדנה',
}

export const allRoles: Role[] = ['owner', 'finance', 'melave', 'matargel', 'workshop_facilitator']
