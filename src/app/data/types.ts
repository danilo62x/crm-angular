// Domain model for the CRM template. Human-readable labels render via i18n keys
// (stage labels, activity types, etc.); raw values (names, emails, numbers) live
// in the mock data and stores directly.

export type StageId = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Stage {
  id: StageId
  /** i18n key suffix under `stages.<id>` */
  nameKey: string
  /** hex used for the column accent / stage pill */
  color: string
  /** default win probability suggestion (%) */
  probability: number
}

export type ContactStatus = 'active' | 'lead' | 'customer' | 'inactive'

export interface Contact {
  id: number
  name: string
  email: string
  phone: string
  companyId: number | null
  /** job title (free text) */
  title: string
  tags: string[]
  owner: string
  status: ContactStatus
  avatar: string
  createdAt: string
}

export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise'

export interface Company {
  id: number
  name: string
  industry: string
  size: CompanySize
  website: string
  city: string
  createdAt: string
}

export interface Deal {
  id: number
  title: string
  value: number
  contactId: number | null
  companyId: number | null
  stage: StageId
  probability: number
  owner: string
  expectedClose: string
  createdAt: string
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task'
export type ActivityStatus = 'open' | 'done'

export interface Activity {
  id: number
  type: ActivityType
  title: string
  status: ActivityStatus
  /** ISO date/time the activity is scheduled for / happened */
  date: string
  contactId: number | null
  dealId: number | null
  owner: string
}

export interface Note {
  id: number
  body: string
  contactId: number | null
  dealId: number | null
  author: string
  createdAt: string
}

export interface SalesRep {
  name: string
  avatar: string
  /** revenue won this period */
  revenue: number
  /** deals won this period */
  deals: number
}
